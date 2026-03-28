import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, error: authError } = await getAuthUser(request);
    if (authError || !supabase) return unauthorized(authError);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return serverError('Failed to logout');
    }

    return success(null, 'Logged out successfully');
  } catch {
    return unauthorized();
  }
}
