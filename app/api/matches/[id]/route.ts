import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, unauthorized, notFound, serverError } from '@/lib/helpers/errors';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match details by ID
 *     tags: [Matches]
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
 *         description: Match details
 *       404:
 *         description: Match not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, error: authError } = await getAuthUser(request);
    if (authError || !supabase) return unauthorized(authError);

    const { data, error } = await supabase
      .from('matches')
      .select('*, leagues(id, name, key, league_type)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return notFound('Match not found');
    }

    return success(data);
  } catch {
    return unauthorized();
  }
}
