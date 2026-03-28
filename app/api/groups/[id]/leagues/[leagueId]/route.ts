import { NextRequest } from 'next/server';
import { getAuthUser, isGroupAdmin } from '@/lib/helpers/auth';
import { success, unauthorized, forbidden, serverError } from '@/lib/helpers/errors';

type RouteParams = { params: Promise<{ id: string; leagueId: string }> };

/**
 * @swagger
 * /api/groups/{id}/leagues/{leagueId}:
 *   delete:
 *     summary: Remove a league from a group (ADMIN only)
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: League removed from group
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, leagueId } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can remove leagues');
    }

    const { error } = await supabase
      .from('group_leagues')
      .delete()
      .eq('group_id', id)
      .eq('league_id', leagueId);

    if (error) {
      return serverError(error.message);
    }

    return success(null, 'League removed from group');
  } catch {
    return unauthorized();
  }
}
