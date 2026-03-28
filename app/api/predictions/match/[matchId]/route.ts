import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, badRequest, unauthorized, serverError } from '@/lib/helpers/errors';

type RouteParams = { params: Promise<{ matchId: string }> };

/**
 * @swagger
 * /api/predictions/match/{matchId}:
 *   get:
 *     summary: Get all predictions for a match within a group
 *     tags: [Predictions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All predictions for the match
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { matchId } = await params;
    const { supabase } = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');

    if (!groupId) {
      return badRequest('group_id query parameter is required');
    }

    // Check if match is completed — only show others' predictions after match ends
    const { data: match } = await supabase
      .from('matches')
      .select('status')
      .eq('id', matchId)
      .single();

    const { data, error } = await supabase
      .from('predictions')
      .select('id, user_id, predicted_team, is_correct, points_earned, created_at, profiles(id, full_name, avatar_url)')
      .eq('match_id', matchId)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      return serverError(error.message);
    }

    // If match hasn't completed, hide other users' predictions (show only predicted_team as "hidden")
    const isCompleted = match?.status === 'completed';

    return success({
      match_id: matchId,
      group_id: groupId,
      match_status: match?.status || 'unknown',
      reveal_predictions: isCompleted,
      predictions: data,
    });
  } catch {
    return unauthorized();
  }
}
