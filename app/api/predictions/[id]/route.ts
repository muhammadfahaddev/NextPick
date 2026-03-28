import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, badRequest, unauthorized, notFound, forbidden, serverError } from '@/lib/helpers/errors';
import type { UpdatePredictionRequest } from '@/lib/types';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/predictions/{id}:
 *   put:
 *     summary: Update a prediction (only before match starts)
 *     tags: [Predictions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [predicted_team]
 *             properties:
 *               predicted_team:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prediction updated
 *       400:
 *         description: Match already started
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);
    const body: UpdatePredictionRequest = await request.json();

    if (!body.predicted_team) {
      return badRequest('predicted_team is required');
    }

    // Get existing prediction
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('*, matches(id, team1_name, team2_name, match_datetime, status)')
      .eq('id', id)
      .single();

    if (predError || !prediction) {
      return notFound('Prediction not found');
    }

    // Check ownership
    if (prediction.user_id !== user.id) {
      return forbidden('You can only update your own predictions');
    }

    const match = prediction.matches as { id: string; team1_name: string; team2_name: string; match_datetime: string; status: string };

    // Check if match hasn't started
    const now = new Date();
    const matchTime = new Date(match.match_datetime);

    if (matchTime <= now || match.status !== 'upcoming') {
      return badRequest('Cannot update. This match has already started or completed.');
    }

    // Validate team name
    if (body.predicted_team !== match.team1_name && body.predicted_team !== match.team2_name) {
      return badRequest(`predicted_team must be either "${match.team1_name}" or "${match.team2_name}"`);
    }

    const { data, error } = await supabase
      .from('predictions')
      .update({ predicted_team: body.predicted_team })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return serverError(error.message);
    }

    return success(data, 'Prediction updated');
  } catch {
    return unauthorized();
  }
}
