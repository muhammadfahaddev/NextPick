'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Match {
  id: string;
  name: string;
  match_type: string;
  status: string;
  venue: string;
  date: string;
  team_a: string;
  team_b: string;
  team_a_img?: string;
  team_b_img?: string;
  league_id: string;
  series_id: string;
  score_a?: string;
  score_b?: string;
}

export interface League {
  id: string;
  name: string;
  league_type: string;
}

export function useMatches(leagueId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch Leagues
        const leaguesRes = await fetch('/api/leagues', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const leaguesData = await leaguesRes.json();
        setLeagues(leaguesData.data || []);

        // Fetch Matches
        const url = leagueId 
          ? `/api/matches?leagueId=${leagueId}` 
          : '/api/matches';
        
        const matchesRes = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const matchesData = await matchesRes.json();
        setMatches(matchesData.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  return { matches, leagues, loading, error };
}
