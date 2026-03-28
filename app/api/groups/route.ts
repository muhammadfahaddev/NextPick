import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, created, badRequest, unauthorized, serverError } from '@/lib/helpers/errors';
import { generateInviteCode } from '@/lib/helpers/invite-code';
import type { CreateGroupRequest } from '@/lib/types';

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: List all groups the user belongs to
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthUser(request);

    const { data: memberships, error } = await supabase
      .from('group_members')
      .select('group_id, role, groups(id, name, invite_code, created_by, created_at)')
      .eq('user_id', user.id);

    if (error) {
      return serverError(error.message);
    }

    const groups = memberships?.map((m) => ({
      ...m.groups,
      my_role: m.role,
    }));

    return success(groups);
  } catch {
    return unauthorized();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthUser(request);
    const body: CreateGroupRequest = await request.json();

    if (!body.name || body.name.trim().length === 0) {
      return badRequest('Group name is required');
    }

    const invite_code = generateInviteCode();

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: body.name.trim(),
        invite_code,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      return serverError(groupError.message);
    }

    // Add creator as ADMIN
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'ADMIN',
      });

    if (memberError) {
      return serverError(memberError.message);
    }

    return created({ ...group, my_role: 'ADMIN' }, 'Group created successfully');
  } catch {
    return unauthorized();
  }
}
