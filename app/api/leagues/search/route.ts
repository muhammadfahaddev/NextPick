import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/helpers/auth';
import { cricApi } from '@/lib/cricapi/client';
import { success, unauthorized, serverError } from '@/lib/helpers/errors';

/**
 * @swagger
 * /api/leagues/search:
 *   get:
 *     summary: Search for leagues/series from CricketData.org
 *     tags: [Leagues]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (e.g. "PSL", "IPL")
 *     responses:
 *       200:
 *         description: Search results
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError || !user) return unauthorized(authError);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const apiResponse = await cricApi.getSeries(query);
    
    // The series search returns CricApiSeries objects
    const seriesData = apiResponse.data as unknown as import('@/lib/types').CricApiSeries[];
    
    const formattedResults = seriesData?.map(series => ({
      id: series.id,
      name: series.name,
      startDate: series.startDate,
      endDate: series.endDate,
      matches: series.matches,
      status: series.status
    })) || [];

    return success(formattedResults, 'Search complete');
  } catch (err) {
    console.error('League search error:', err);
    return serverError('Failed to search leagues');
  }
}
