import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
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
    const { user, supabase, error: authError } = await getAuthUser(request);
    if (authError || !user || !supabase) return unauthorized(authError);

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
  const { user, error: authError } = await getAuthUser(request);
  if (authError || !user) return unauthorized(authError);

  try {
    const body: CreateGroupRequest = await request.json();

    if (!body.name || body.name.trim().length === 0) {
      return badRequest('Group name is required');
    }

    const invite_code = generateInviteCode();
    const adminClient = getSupabaseAdmin();

    // Create the group using admin client to bypass RLS bootstrap issues
    const { data: group, error: groupError } = await adminClient
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

    // Add creator as ADMIN using admin client
    const { error: memberError } = await adminClient
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'ADMIN',
      });

    if (memberError) {
      console.error('Member create error:', memberError);
      // Clean up orphaned group
      await adminClient.from('groups').delete().eq('id', group.id);
      return serverError(memberError.message);
    }

    return created({ ...group, my_role: 'ADMIN' }, 'Group created successfully');
  } catch (err) {
    console.error('POST /api/groups error:', err);
    return serverError('An error occurred during group creation');
  }
}
