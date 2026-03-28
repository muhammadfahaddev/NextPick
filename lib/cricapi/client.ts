import type { CricApiSeriesResponse } from '@/lib/types';

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICDATA_API_KEY!;

/**
 * CricketData.org API Client
 * Docs: https://cricketdata.org
 */
export class CricApiClient {
  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set('apikey', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CricAPI Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get all available series/leagues (supports search)
   */
  async getSeries(search = '', offset = 0) {
    return this.fetch<CricApiSeriesResponse>('/series', { 
      search,
      offset: offset.toString() 
    });
  }

  /**
   * Get all matches in a specific series
   */
  async getSeriesInfo(seriesId: string) {
    return this.fetch<CricApiSeriesResponse>('/series_info', { id: seriesId });
  }

  /**
   * Get detailed info about a specific match
   */
  async getMatchInfo(matchId: string) {
    return this.fetch<CricApiSeriesResponse>('/match_info', { id: matchId });
  }

  /**
   * Get currently live matches
   */
  async getCurrentMatches(offset = 0) {
    return this.fetch<CricApiSeriesResponse>('/currentMatches', { offset: offset.toString() });
  }
}

export const cricApi = new CricApiClient();
