import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { success, serverError } from '@/lib/helpers/errors';
import type { LeaderboardEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const adminClient = getSupabaseAdmin();

    // Get all completed predictions with points
    const { data: predictions, error: predictionError } = await adminClient
      .from('predictions')
      .select('user_id, points_earned, is_correct')
      .not('points_earned', 'is', null);

    if (predictionError) {
      return serverError(predictionError.message);
    }

    // Aggregate stats by user_id
    const userStatsMap: Record<string, { points: number; total: number; correct: number }> = {};
    
    (predictions || []).forEach(p => {
      if (!userStatsMap[p.user_id]) {
        userStatsMap[p.user_id] = { points: 0, total: 0, correct: 0 };
      }
      userStatsMap[p.user_id].points += p.points_earned || 0;
      userStatsMap[p.user_id].total += 1;
      if (p.is_correct) {
        userStatsMap[p.user_id].correct += 1;
      }
    });

    // Get profiles for all these users
    const userIds = Object.keys(userStatsMap);
    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    if (profileError) {
      return serverError(profileError.message);
    }

    const leaderboard: LeaderboardEntry[] = profiles.map(profile => {
      const stats = userStatsMap[profile.id];
      return {
        user_id: profile.id,
        full_name: profile.full_name || 'Anonymous',
        avatar_url: profile.avatar_url,
        total_points: stats.points,
        total_predictions: stats.total,
        correct_predictions: stats.correct,
        rank: 0,
      };
    });

    // Sort by points, then by correct predictions
    leaderboard.sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return b.correct_predictions - a.correct_predictions;
    });

    // Assign rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return success(leaderboard.slice(0, 50)); // Return top 50
  } catch (err: any) {
    console.error('Global leaderboard error:', err);
    return serverError('Failed to fetch global leaderboard');
  }
}
