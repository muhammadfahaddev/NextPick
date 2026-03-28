'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  user_role?: 'ADMIN' | 'MEMBER';
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/groups', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setGroups(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create group');

      await fetchGroups();
      return data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join group');

      await fetchGroups();
      return data.data;
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return { groups, loading, error, createGroup, joinGroup, refreshGroups: fetchGroups };
}
