import { NextRequest } from 'next/server';
import { getAuthUser, isGroupMember } from '@/lib/helpers/auth';
import { success, unauthorized, forbidden, serverError } from '@/lib/helpers/errors';
import type { LeaderboardEntry } from '@/lib/types';

/**
 * @swagger
 * /api/groups/{id}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a group
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: Filter by league key (e.g. psl-2026)
 *     responses:
 *       200:
 *         description: Ranked leaderboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !supabase || !user) return unauthorized(authError);
    const { searchParams } = new URL(request.url);
    const leagueKey = searchParams.get('league');

    if (!await isGroupMember(supabase, id, user.id)) {
      return forbidden('You are not a member of this group');
    }

    // Get all predictions for this group
    let query = supabase
      .from('predictions')
      .select('user_id, predicted_team, is_correct, points_earned, matches(league_id, leagues(key))')
      .eq('group_id', id);

    const { data: predictions, error } = await query;

    if (error) {
      return serverError(error.message);
    }

    // Filter by league if specified
    let filtered = predictions || [];
    if (leagueKey) {
      filtered = filtered.filter((p: Record<string, unknown>) => {
        const matches = p.matches as Record<string, unknown> | null;
        const leagues = matches?.leagues as Record<string, unknown> | null;
        return leagues?.key === leagueKey;
      });
    }

    // Aggregate by user
    const userStats: Record<string, { total: number; correct: number; points: number }> = {};

    for (const pred of filtered) {
      if (!userStats[pred.user_id]) {
        userStats[pred.user_id] = { total: 0, correct: 0, points: 0 };
      }
      userStats[pred.user_id].total++;
      if (pred.is_correct) {
        userStats[pred.user_id].correct++;
      }
      userStats[pred.user_id].points += pred.points_earned || 0;
    }

    // Get user profiles
    const userIds = Object.keys(userStats);

    // Also include group members who haven't predicted yet
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, profiles(id, full_name, avatar_url)')
      .eq('group_id', id);

    const leaderboard: LeaderboardEntry[] = (members || []).map((m) => {
      const profile = m.profiles as unknown as { id: string; full_name: string; avatar_url: string | null };
      const stats = userStats[m.user_id] || { total: 0, correct: 0, points: 0 };

      return {
        user_id: m.user_id,
        full_name: profile?.full_name || 'Unknown',
        avatar_url: profile?.avatar_url || null,
        total_points: stats.points,
        total_predictions: stats.total,
        correct_predictions: stats.correct,
        rank: 0,
      };
    });

    // Sort by points descending, then by correct predictions
    leaderboard.sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return b.correct_predictions - a.correct_predictions;
    });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return success({
      group_id: id,
      league_filter: leagueKey || 'all',
      leaderboard,
    });
  } catch {
    return unauthorized();
  }
}
