import { NextRequest } from 'next/server';
import { getAuthUser, isGroupAdmin, isGroupMember } from '@/lib/helpers/auth';
import { success, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/helpers/errors';
import type { AddMemberRequest } from '@/lib/types';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/groups/{id}/members:
 *   get:
 *     summary: List members of a group
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
 *         description: List of members
 *   post:
 *     summary: Add a member to the group by email (ADMIN only)
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member added
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupMember(supabase, id, user.id)) {
      return forbidden('You are not a member of this group');
    }

    const { data, error } = await supabase
      .from('group_members')
      .select('id, user_id, role, joined_at, profiles(id, full_name, email, avatar_url)')
      .eq('group_id', id)
      .order('joined_at', { ascending: true });

    if (error) {
      return serverError(error.message);
    }

    return success(data);
  } catch {
    return unauthorized();
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthUser(request);

    if (!await isGroupAdmin(supabase, id, user.id)) {
      return forbidden('Only group admins can add members');
    }

    const body: AddMemberRequest = await request.json();

    if (!body.email) {
      return badRequest('Email is required');
    }

    // Find user by email
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .single();

    if (profileError || !targetProfile) {
      return badRequest('User with this email not found. They must sign up first.');
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', id)
      .eq('user_id', targetProfile.id)
      .single();

    if (existing) {
      return badRequest('User is already a member of this group');
    }

    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: id,
        user_id: targetProfile.id,
        role: 'MEMBER',
      })
      .select('id, user_id, role, joined_at, profiles(id, full_name, email, avatar_url)')
      .single();

    if (error) {
      return serverError(error.message);
    }

    return created(data, 'Member added successfully');
  } catch {
    return unauthorized();
  }
}
