import { NextRequest } from 'next/server';
import { getAuthUser, isGroupAdmin, isGroupMember } from '@/lib/helpers/auth';
import { success, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/helpers/errors';
import type { AddLeagueToGroupRequest } from '@/lib/types';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/groups/{id}/leagues:
 *   get:
 *     summary: Get leagues linked to a group
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group leagues
 *   post:
 *     summary: Add a league to a group (ADMIN only)
 *     tags: [Leagues]
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
 *             required: [league_id]
 *             properties:
 *               league_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: League added to group
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);

    if (!await isGroupMember(supabase, id, user.id)) {
      return forbidden('You are not a member of this group');
    }

    const { data, error } = await supabase
      .from('group_leagues')
      .select('id, league_id, created_at, leagues(id, name, key, league_type, is_active)')
      .eq('group_id', id);

    if (error) {
      return serverError(error.message);
    }

    return success(data);
  } catch {
    return unauthorized();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can add leagues');
    }

    const body: AddLeagueToGroupRequest = await request.json();

    if (!body.league_id) {
      return badRequest('league_id is required');
    }

    // Check if league exists
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('id, name')
      .eq('id', body.league_id)
      .single();

    if (leagueError || !league) {
      return badRequest('League not found');
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('group_leagues')
      .select('id')
      .eq('group_id', id)
      .eq('league_id', body.league_id)
      .single();

    if (existing) {
      return badRequest('This league is already added to the group');
    }

    const { data, error } = await supabase
      .from('group_leagues')
      .insert({ group_id: id, league_id: body.league_id })
      .select('id, league_id, created_at, leagues(id, name, key, league_type, is_active)')
      .single();

    if (error) {
      return serverError(error.message);
    }

    return created(data, 'League added to group');
  } catch {
    return unauthorized();
  }
}
