import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: List all available leagues
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of leagues
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    let query = supabase.from('leagues').select('*').order('created_at', { ascending: false });

    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return serverError(error.message);
    }

    return success(data);
  } catch {
    return unauthorized();
  }
}
