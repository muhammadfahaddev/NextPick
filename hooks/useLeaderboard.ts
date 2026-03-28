'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  points: number;
  prediction_count: number;
  accuracy?: number;
  rank?: number;
}

export function useLeaderboard(groupId?: string) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = groupId 
        ? `/api/groups/${groupId}/leaderboard`
        : '/api/leaderboard';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch leaderboard');
      
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard: data, loading, error, refresh: fetchLeaderboard };
}
