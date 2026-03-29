'use client';

import React, { use } from 'react';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Users, Shield, Trophy, Share2, Loader2, ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { MatchesDisplay } from '@/components/matches/MatchesDisplay';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { group, members, loading: groupLoading, error: groupError } = useGroupDetails(id);
  const { leaderboard, loading: leaderLoading } = useLeaderboard(id);

  if (groupLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-muted mt-4">Loading group arena...</p>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="glass-card p-12 text-center max-w-lg mx-auto mt-20">
        <p className="text-danger font-bold text-xl">Group not found</p>
        <p className="text-muted mt-2">This group may have been deleted or the invite is invalid.</p>
        <Link href="/groups">
          <Button variant="ghost" className="mt-6">Back to My Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Back Button */}
      <div className="space-y-6">
        <Link href="/groups" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Groups
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-outfit font-extrabold tracking-tight">{group.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                <Users className="w-4 h-4" />
                {members.length} Members
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                Invite Code: <code className="text-secondary font-bold font-mono ml-1">{group.invite_code}</code>
              </span>
            </div>
          </div>
          
          <Button variant="ghost" className="text-muted hover:text-danger">
            Leave Group
          </Button>
        </div>
      </div>

      {/* Matches for Group League */}
      {group.league_id && (
        <section className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
             <Trophy className="w-6 h-6 text-primary" />
             <h2 className="text-2xl font-outfit font-bold">Group Predictions</h2>
          </div>
          <MatchesDisplay 
            groupId={id} 
            leagueId={group.league_id} 
            title="Available Matches" 
            hideFilters 
          />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Leaderboard Column - Taking 2/3 space */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold font-outfit">Group Leaderboard</h2>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            {leaderLoading ? (
               <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
            ) : leaderboard.length > 0 ? (
              <div className="divide-y divide-white/5">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.user_id} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "font-outfit font-bold w-6",
                        idx === 0 ? "text-primary" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-muted"
                      )}>
                        {idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm uppercase">
                        {entry.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold">{entry.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest">{entry.prediction_count} Predictions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-outfit font-black text-xl text-white">{entry.points}</p>
                      <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <Trophy className="w-12 h-12 text-muted/20 mx-auto" />
                <p className="font-bold">No competition yet!</p>
                <p className="text-sm text-muted">Predictions will reveal the winner.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column - Members & Activity */}
        <div className="space-y-8">
          {/* Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-outfit flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members
            </h3>
            <div className="glass-card divide-y divide-white/5">
              {members.map((member) => (
                <div key={member.user_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold uppercase transition-colors group-hover:bg-white/10">
                      {member.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.full_name || 'Anonymous'}</p>
                      {member.role === 'ADMIN' && (
                        <span className="text-[9px] font-black text-secondary/70 flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats/Activity */}
          <div className="glass-card p-6 bg-secondary/5 border-secondary/10 relative overflow-hidden">
             <History className="w-12 h-12 absolute bottom-[-10px] right-[-10px] text-secondary/5" />
             <h3 className="font-bold text-secondary mb-2">Group Info</h3>
             <p className="text-xs text-muted leading-relaxed">
               Created on {new Date(group.created_at).toLocaleDateString()}. Point sharing is active. 
               All matches for selected series will be scored automatically.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
