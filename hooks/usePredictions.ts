'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Prediction {
  id: string;
  match_id: string;
  group_id?: string;
  predicted_team: string;
  points_awarded?: number;
  status: 'PENDING' | 'CORRECT' | 'WRONG';
  created_at: string;
}

export function usePredictions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMatchPrediction = useCallback(async (matchId: string, groupId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const url = groupId 
        ? `/api/predictions/match/${matchId}?group_id=${groupId}`
        : `/api/predictions/match/${matchId}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      return data.data as Prediction | null;
    } catch (err: any) {
      console.error('Error fetching prediction:', err);
      return null;
    }
  }, []);

  const submitPrediction = async (matchId: string, team: string, groupId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          predicted_team: team,
          group_id: groupId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit prediction');

      return data.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitPrediction, getMatchPrediction, loading, error };
}
