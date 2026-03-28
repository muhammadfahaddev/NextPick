import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

/**
 * Extracts JWT from the Authorization header and returns the authenticated user.
 * Returns an error string if authentication fails.
 */
export async function getAuthUser(request: NextRequest): Promise<{
  user: { id: string; email: string } | null;
  profile: Profile | null;
  supabase: ReturnType<typeof createServerClient> | null;
  error?: string;
}> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, profile: null, supabase: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createServerClient(token);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, supabase: null, error: 'Invalid or expired token' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { user: null, profile: null, supabase, error: 'Profile not found' };
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: profile as Profile,
    supabase,
  };
}

/**
 * Check if user is ADMIN of a specific group
 */
export async function isGroupAdmin(
  supabase: ReturnType<typeof createServerClient>,
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  return data?.role === 'ADMIN';
}

/**
 * Check if user is a member of a specific group
 */
export async function isGroupMember(
  supabase: ReturnType<typeof createServerClient>,
  groupId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  return !!data;
}
