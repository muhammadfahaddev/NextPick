'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  league_id?: string;
}

export interface GroupMember {
  user_id: string;
  full_name: string;
  role: 'ADMIN' | 'MEMBER';
  joined_at: string;
}

export function useGroupDetails(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch Group Info
      const groupRes = await fetch(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const groupData = await groupRes.json();
      if (!groupRes.ok) throw new Error(groupData.message || 'Group not found');
      
      const rawGroup = groupData.data;
      const league_id = rawGroup.group_leagues?.[0]?.league_id;
      
      setGroup({ ...rawGroup, league_id });

      // Fetch Members
      const membersRes = await fetch(`/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const membersData = await membersRes.json();
      setMembers(membersData.data || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { group, members, loading, error, refresh: fetchDetails };
}
