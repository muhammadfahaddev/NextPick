import { NextRequest } from 'next/server';
import { getAuthUser, isGroupAdmin, isGroupMember } from '@/lib/helpers/auth';
import { success, badRequest, unauthorized, notFound, forbidden, serverError } from '@/lib/helpers/errors';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
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
 *         description: Group details
 *   put:
 *     summary: Update group (ADMIN only)
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated
 *   delete:
 *     summary: Delete group (ADMIN only)
 *     tags: [Groups]
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
 *         description: Group deleted
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupMember(supabase, id, user.id)) {
      return forbidden('You are not a member of this group');
    }

    const { data: group, error } = await supabase
      .from('groups')
      .select('*, group_members(id, user_id, role, profiles(id, full_name, email, avatar_url))')
      .eq('id', id)
      .single();

    if (error || !group) {
      return notFound('Group not found');
    }

    return success(group);
  } catch {
    return unauthorized();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can update the group');
    }

    const body = await request.json();

    if (!body.name || body.name.trim().length === 0) {
      return badRequest('Group name is required');
    }

    const { data, error } = await supabase
      .from('groups')
      .update({ name: body.name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return serverError(error.message);
    }

    return success(data, 'Group updated');
  } catch {
    return unauthorized();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can delete the group');
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      return serverError(error.message);
    }

    return success(null, 'Group deleted');
  } catch {
    return unauthorized();
  }
}
