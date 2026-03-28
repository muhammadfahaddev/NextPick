import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: List matches with optional filters
 *     tags: [Matches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: League key (e.g. psl-2026)
 *       - in: query
 *         name: league_id
 *         schema:
 *           type: string
 *         description: League UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, live, completed]
 *         description: Match status filter
 *     responses:
 *       200:
 *         description: List of matches
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const leagueKey = searchParams.get('league');
    const leagueId = searchParams.get('league_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('matches')
      .select('*, leagues(id, name, key, league_type)')
      .order('match_datetime', { ascending: true });

    if (leagueId) {
      query = query.eq('league_id', leagueId);
    }

    if (leagueKey) {
      // First find the league by key
      const { data: league } = await supabase
        .from('leagues')
        .select('id')
        .eq('key', leagueKey)
        .single();

      if (league) {
        query = query.eq('league_id', league.id);
      }
    }

    if (status) {
      query = query.eq('status', status);
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
