import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/matches/live:
 *   get:
 *     summary: Get currently live matches
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of live matches
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await getAuthUser(request);
    if (authError || !supabase) return unauthorized(authError);

    const { data, error } = await supabase
      .from('matches')
      .select('*, leagues(id, name, key, league_type)')
      .eq('status', 'live')
      .order('match_datetime', { ascending: true });

    if (error) {
      return serverError(error.message);
    }

    return success(data);
  } catch {
    return unauthorized();
  }
}
