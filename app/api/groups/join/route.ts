import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, badRequest, unauthorized, notFound, serverError } from '@/lib/helpers/errors';
import type { JoinGroupRequest } from '@/lib/types';

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     summary: Join a group using an invite code
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invite_code]
 *             properties:
 *               invite_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined group successfully
 *       400:
 *         description: Already a member
 *       404:
 *         description: Invalid invite code
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthUser(request);
    const body: JoinGroupRequest = await request.json();

    if (!body.invite_code) {
      return badRequest('Invite code is required');
    }

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', body.invite_code.toUpperCase())
      .single();

    if (groupError || !group) {
      return notFound('Invalid invite code');
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return badRequest('You are already a member of this group');
    }

    // Add as MEMBER
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'MEMBER',
      });

    if (joinError) {
      return serverError(joinError.message);
    }

    return success({ group_id: group.id, group_name: group.name, role: 'MEMBER' }, 'Joined group successfully');
  } catch {
    return unauthorized();
  }
}
