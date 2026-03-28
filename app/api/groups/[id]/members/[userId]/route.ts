import { NextRequest } from 'next/server';
import { getAuthUser, isGroupAdmin } from '@/lib/helpers/auth';
import { success, unauthorized, forbidden, badRequest, serverError } from '@/lib/helpers/errors';

type RouteParams = { params: Promise<{ id: string; userId: string }> };

/**
 * @swagger
 * /api/groups/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the group (ADMIN only)
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can remove members');
    }

    // Prevent removing yourself if you're the only admin
    if (userId === user.id) {
      return badRequest('You cannot remove yourself. Transfer admin role first or delete the group.');
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', userId);

    if (error) {
      return serverError(error.message);
    }

    return success(null, 'Member removed');
  } catch {
    return unauthorized();
  }
}
