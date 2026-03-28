import { NextRequest } from 'next/server';
import { getAuthUser, isGroupMember } from '@/lib/helpers/auth';
import { success, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/helpers/errors';
import type { CreatePredictionRequest } from '@/lib/types';

/**
 * @swagger
 * /api/predictions:
 *   post:
 *     summary: Make a prediction for a match
 *     tags: [Predictions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [match_id, group_id, predicted_team]
 *             properties:
 *               match_id:
 *                 type: string
 *               group_id:
 *                 type: string
 *               predicted_team:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prediction created
 *       400:
 *         description: Match already started or invalid data
 *   get:
 *     summary: Get user's predictions
 *     tags: [Predictions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: League key filter
 *     responses:
 *       200:
 *         description: List of predictions
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);
    const body: CreatePredictionRequest = await request.json();

    const { match_id, group_id, predicted_team } = body;

    if (!match_id || !group_id || !predicted_team) {
      return badRequest('match_id, group_id, and predicted_team are required');
    }

    // Check user is member of the group
    if (!await isGroupMember(supabase, group_id, user.id)) {
      return forbidden('You are not a member of this group');
    }

    // Check match exists and hasn't started
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, team1_name, team1_short, team2_name, team2_short, match_datetime, status')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return badRequest('Match not found');
    }

    // Check if match hasn't started yet
    const now = new Date();
    const matchTime = new Date(match.match_datetime);

    if (matchTime <= now || match.status !== 'upcoming') {
      return badRequest('Predictions are closed. This match has already started or completed.');
    }

    // Validate and normalize predicted_team
    let normalizedTeam = predicted_team;
    
    const isTeam1 = predicted_team === match.team1_name || (match.team1_short && predicted_team === match.team1_short);
    const isTeam2 = predicted_team === match.team2_name || (match.team2_short && predicted_team === match.team2_short);

    if (isTeam1) {
      normalizedTeam = match.team1_name;
    } else if (isTeam2) {
      normalizedTeam = match.team2_name;
    } else {
      const options = [match.team1_name];
      if (match.team1_short) options.push(match.team1_short);
      options.push(match.team2_name);
      if (match.team2_short) options.push(match.team2_short);
      
      return badRequest(`predicted_team must be one of: ${options.join(', ')}`);
    }

    // Check for existing prediction
    const { data: existing } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('match_id', match_id)
      .eq('group_id', group_id)
      .single();

    if (existing) {
      return badRequest('You already have a prediction for this match in this group. Use PUT to update.');
    }

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        match_id,
        group_id,
        predicted_team: normalizedTeam,
      })
      .select()
      .single();

    if (error) {
      return serverError(error.message);
    }

    return created(data, 'Prediction created');
  } catch (err) {
    console.error('POST /api/predictions error:', err);
    return serverError('An error occurred during prediction');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const leagueKey = searchParams.get('league');

    let query = supabase
      .from('predictions')
      .select('*, matches(id, team1_name, team1_short, team2_name, team2_short, match_datetime, status, winner, match_result, leagues(id, name, key))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
      return serverError(error.message);
    }

    // Filter by league key if provided (post-query because of nested relation)
    let result = data;
    if (leagueKey && data) {
      result = data.filter((p: Record<string, unknown>) => {
        const matches = p.matches as Record<string, unknown> | null;
        const leagues = matches?.leagues as Record<string, unknown> | null;
        return leagues?.key === leagueKey;
      });
    }

    return success(result);
  } catch (err) {
    console.error('GET /api/predictions error:', err);
    return unauthorized();
  }
}
