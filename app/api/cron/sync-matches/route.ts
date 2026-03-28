import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cricApi } from '@/lib/cricapi/client';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';
import type { SyncResult } from '@/lib/types';

/**
 * @swagger
 * /api/cron/sync-matches:
 *   post:
 *     summary: Sync matches from CricketData.org API and auto-score completed matches
 *     tags: [Cron]
 *     parameters:
 *       - in: header
 *         name: x-cron-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Cron secret for authentication
 *     responses:
 *       200:
 *         description: Sync complete
 *       401:
 *         description: Invalid cron secret
 */
export async function POST(request: NextRequest) {
  // Authenticate cron request
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return unauthorized('Invalid cron secret');
  }

  try {
    // Get all active leagues
    const { data: leagues, error: leagueError } = await getSupabaseAdmin()
      .from('leagues')
      .select('*')
      .eq('is_active', true);

    if (leagueError || !leagues || leagues.length === 0) {
      return success([], 'No active leagues to sync');
    }

    const results: SyncResult[] = [];

    for (const league of leagues) {
      try {
        // Fetch series info from CricAPI
        const apiResponse = await cricApi.getSeriesInfo(league.series_id);

        if (apiResponse.status !== 'success' || !apiResponse.data) {
          console.error(`Failed to fetch series ${league.series_id}:`, apiResponse);
          continue;
        }

        let matchesSynced = 0;
        let matchesScored = 0;

        for (const apiMatch of apiResponse.data) {
          // Determine match status
          let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
          if (apiMatch.matchEnded) {
            status = 'completed';
          } else if (apiMatch.matchStarted) {
            status = 'live';
          }

          // Extract team info
          const team1Info = apiMatch.teamInfo?.[0];
          const team2Info = apiMatch.teamInfo?.[1];
          const team1Name = apiMatch.teams?.[0] || team1Info?.name || 'TBA';
          const team2Name = apiMatch.teams?.[1] || team2Info?.name || 'TBA';

          // Determine winner from status string
          let winner: string | null = null;
          if (status === 'completed' && apiMatch.status) {
            // Status usually contains "Team won by X" or similar
            if (apiMatch.status.toLowerCase().includes(team1Name.toLowerCase())) {
              if (apiMatch.status.toLowerCase().includes('won')) {
                winner = team1Name;
              }
            }
            if (apiMatch.status.toLowerCase().includes(team2Name.toLowerCase())) {
              if (apiMatch.status.toLowerCase().includes('won')) {
                winner = team2Name;
              }
            }

            // Also check shortnames
            if (!winner && team1Info?.shortname && apiMatch.status.includes(team1Info.shortname)) {
              winner = team1Name;
            }
            if (!winner && team2Info?.shortname && apiMatch.status.includes(team2Info.shortname)) {
              winner = team2Name;
            }
          }

          // Upsert match
          const { error: upsertError } = await getSupabaseAdmin()
            .from('matches')
            .upsert(
              {
                league_id: league.id,
                cricapi_match_id: apiMatch.id,
                team1_name: team1Name,
                team1_short: team1Info?.shortname || null,
                team1_img: team1Info?.img || null,
                team2_name: team2Name,
                team2_short: team2Info?.shortname || null,
                team2_img: team2Info?.img || null,
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
            );

          if (!upsertError) {
            matchesSynced++;
          }

          // Auto-score predictions for completed matches with a winner
          if (status === 'completed' && winner) {
            const scored = await scoreMatch(apiMatch.id, winner);
            matchesScored += scored;
          }
        }

        results.push({
          league: league.name,
          matches_synced: matchesSynced,
          matches_scored: matchesScored,
        });
      } catch (err) {
        console.error(`Error syncing league ${league.name}:`, err);
        results.push({
          league: league.name,
          matches_synced: 0,
          matches_scored: 0,
        });
      }
    }

    return success(results, 'Sync complete');
  } catch (err) {
    console.error('Cron sync error:', err);
    return serverError('Failed to sync matches');
  }
}

/**
 * Auto-score all predictions for a completed match
 */
async function scoreMatch(cricapiMatchId: string, winner: string): Promise<number> {
  // Find our internal match
  const { data: match } = await getSupabaseAdmin()
    .from('matches')
    .select('id')
    .eq('cricapi_match_id', cricapiMatchId)
    .single();

  if (!match) return 0;

  // Get all unscored predictions for this match
  const { data: predictions, error } = await getSupabaseAdmin()
    .from('predictions')
    .select('id, predicted_team')
    .eq('match_id', match.id)
    .is('is_correct', null); // Only score if not yet scored

  if (error || !predictions || predictions.length === 0) return 0;

  let scored = 0;

  for (const pred of predictions) {
    const isCorrect = pred.predicted_team === winner;

    const { error: updateError } = await getSupabaseAdmin()
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
