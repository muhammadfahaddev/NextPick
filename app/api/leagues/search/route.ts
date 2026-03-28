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
  const rawQuery = searchParams.get('q') || '';
  
  // Smart mapping for common abbreviations to help discovery
  const ABBREVIATIONS: Record<string, string> = {
    'ipl': 'Indian Premier League',
    'psl': 'Pakistan Super League',
    'bbl': 'Big Bash League',
    'cpl': 'Caribbean Premier League',
    'wpl': 'Womens Premier League'
  };
  
  const query = ABBREVIATIONS[rawQuery.toLowerCase()] || rawQuery;

  try {
    const apiResponse = await cricApi.getSeries(query);
    
    // The series search returns CricApiSeries objects
    const seriesData = apiResponse.data as unknown as import('@/lib/types').CricApiSeries[];
    
    // Fallback local filtering in case the API search is not exact or returns too much
    let filteredResults = seriesData || [];
    if (query && filteredResults.length > 0) {
      const lowerQuery = query.toLowerCase();
      filteredResults = filteredResults.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        (s.id && s.id.toLowerCase().includes(lowerQuery))
      );
    }
    
    const formattedResults = filteredResults.map(series => ({
      id: series.id,
      name: series.name,
      startDate: series.startDate,
      endDate: series.endDate,
      matches: series.matches,
      status: series.status
    }));

    // Include CricAPI metadata for debugging
    const meta = (apiResponse as any).info || {};
    
    return success({
      results: formattedResults,
      meta: {
        hitsToday: meta.hitsToday,
        hitsLimit: meta.hitsLimit,
        totalRows: meta.totalRows,
        queryUsed: query
      }
    }, `Search complete (${meta.totalRows || formattedResults.length} total series found)`);
  } catch (err) {
    console.error('League search error:', err);
    return serverError('Failed to search leagues');
  }
}
