import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cricApi } from '@/lib/cricapi/client';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';
import type { SyncResult, CricApiMatch } from '@/lib/types';

/**
 * @swagger
 * /api/cron/sync-matches:
 *   post:
 *     summary: Sync matches from CricketData.org and auto-score
 *     description: |
 *       Optimized hit strategy (100 hits/day limit):
 *       - Uses /currentMatches (1 hit) for live status & results.
 *       - Optional ?full=true param fetches /series_info (1 hit per league) for future matches.
 *     tags: [Cron]
 *     parameters:
 *       - in: header
 *         name: x-cron-secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: full
 *         schema:
 *           type: boolean
 *         description: If true, performs a full schedule sync for all active leagues.
 *     responses:
 *       200:
 *         description: Sync complete
 */
export async function POST(request: NextRequest) {
  // 1. Auth check
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return unauthorized('Invalid cron secret');
  }

  const { searchParams } = new URL(request.url);
  const isFullSync = searchParams.get('full') === 'true';
  const supabase = getSupabaseAdmin();

  try {
    // 2. Get active leagues
    const { data: leagues, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('is_active', true);

    if (leagueError || !leagues || leagues.length === 0) {
      return success([], 'No active leagues to sync');
    }

    const results: SyncResult[] = [];
    const activeSeriesIds = leagues.map((l) => l.series_id);

    // 3. Optimized Sync Flow
    if (isFullSync) {
      // FULL SYNC: Fetch full schedule for each league (1 hit per league)
      // Good for discovery of upcoming matches (run once/day)
      for (const league of leagues) {
        const apiResponse = await cricApi.getSeriesInfo(league.series_id);
        if (apiResponse.status === 'success' && apiResponse.data) {
          const synced = await processMatches(apiResponse.data, league.id, league.name);
          results.push(synced);
        }
      }
    } else {
      // OPTIMIZED SYNC: Fetch only current/live matches (1 hit total)
      // Good for frequent updates (run every 30-60 min)
      const currentMatchesRes = await cricApi.getCurrentMatches();
      if (currentMatchesRes.status === 'success' && currentMatchesRes.data) {
        // Group API matches by series_id
        const apiMatchesByLeague = new Map<string, CricApiMatch[]>();
        for (const match of currentMatchesRes.data) {
          if (activeSeriesIds.includes(match.series_id)) {
            const league = leagues.find((l) => l.series_id === match.series_id)!;
            const existing = apiMatchesByLeague.get(league.id) || [];
            apiMatchesByLeague.set(league.id, [...existing, match]);
          }
        }

        // Process each group
        for (const [leagueId, matches] of apiMatchesByLeague.entries()) {
          const leagueName = leagues.find((l) => l.id === leagueId)?.name || 'Unknown';
          const synced = await processMatches(matches, leagueId, leagueName);
          results.push(synced);
        }
      }
    }

    return success(results, 'Sync complete');
  } catch (err) {
    console.error('Cron sync error:', err);
    return serverError('Failed to sync matches');
  }
}

/**
 * Helper to process API matches into DB
 */
async function processMatches(apiMatches: CricApiMatch[], leagueId: string, leagueName: string): Promise<SyncResult> {
  const supabase = getSupabaseAdmin();
  let matchesSynced = 0;
  let matchesScored = 0;

  for (const apiMatch of apiMatches) {
    // Determine status
    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
    if (apiMatch.matchEnded) status = 'completed';
    else if (apiMatch.matchStarted) status = 'live';

    // Parse team info
    const team1 = apiMatch.teamInfo?.[0];
    const team2 = apiMatch.teamInfo?.[1];

    // Determine winner from status text (e.g. "LQ won by 5 wickets")
    let winner: string | null = null;
    if (status === 'completed' && apiMatch.status) {
      const matchStatus = apiMatch.status.toLowerCase();
      const t1Name = apiMatch.teams?.[0]?.toLowerCase() || team1?.name?.toLowerCase();
      const t2Name = apiMatch.teams?.[1]?.toLowerCase() || team2?.name?.toLowerCase();
      const t1Short = team1?.shortname?.toLowerCase();
      const t2Short = team2?.shortname?.toLowerCase();

      if (matchStatus.includes('won')) {
        if ((t1Name && matchStatus.includes(t1Name)) || (t1Short && matchStatus.includes(t1Short))) {
          winner = apiMatch.teams?.[0] || team1?.name;
        } else if ((t2Name && matchStatus.includes(t2Name)) || (t2Short && matchStatus.includes(t2Short))) {
          winner = apiMatch.teams?.[1] || team2?.name;
        }
      }
    }

    // Upsert match
    const { data: match, error: upsertError } = await supabase
      .from('matches')
      .upsert(
        {
          league_id: leagueId,
          cricapi_match_id: apiMatch.id,
          team1_name: apiMatch.teams?.[0] || team1?.name || 'TBA',
          team1_short: team1?.shortname || null,
          team1_img: team1?.img || null,
          team2_name: apiMatch.teams?.[1] || team2?.name || 'TBA',
          team2_short: team2?.shortname || null,
          team2_img: team2?.img || null,
          venue: apiMatch.venue || null,
          match_type: apiMatch.matchType || null,
          status,
          winner,
          match_result: status === 'completed' ? apiMatch.status : null,
          match_datetime: apiMatch.dateTimeGMT,
          raw_data: apiMatch as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'cricapi_match_id' }
      )
      .select()
      .single();

    if (!upsertError && match) {
      matchesSynced++;

      // If match just completed and has winner, score it
      if (status === 'completed' && winner) {
        const scored = await scoreMatch(match.id, winner);
        matchesScored += scored;
      }
    }
  }

  return {
    league: leagueName,
    matches_synced: matchesSynced,
    matches_scored: matchesScored,
  };
}

/**
 * Score all predictions for a match
 */
async function scoreMatch(matchId: string, winner: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  // Find unscored predictions for this match
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('id, predicted_team')
    .eq('match_id', matchId)
    .is('is_correct', null);

  if (error || !predictions || predictions.length === 0) return 0;

  let scored = 0;
  for (const pred of predictions) {
    // Basic match check (allowing for slight naming variations, though strict match is safer)
    const isCorrect = pred.predicted_team.toLowerCase() === winner.toLowerCase();

    const { error: updateError } = await supabase
      .from('predictions')
      .update({
        is_correct: isCorrect,
        points_earned: isCorrect ? 1 : 0,
      })
      .eq('id', pred.id);

    if (!updateError) scored++;
  }

  return scored;
}
