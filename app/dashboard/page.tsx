'use client';

import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/components/providers/AuthProvider';
import { MatchesDisplay } from '@/components/matches/MatchesDisplay';
import { TrendingUp, Users, Calendar, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return (
    <Shell>
      <div className="space-y-10 pb-20">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <Zap className="w-4 h-4 fill-primary" />
              Live Updates Active
            </div>
            <h2 className="text-4xl font-outfit font-bold">Good morning, {firstName}!</h2>
            <p className="text-muted max-w-xl">
              Stay ahead of the game. Check the latest matches and place your predictions to climb the leaderboard.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5 shadow-xl shadow-black/20">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Your Rank</p>
                  <p className="text-lg font-outfit font-bold decoration-primary underline-offset-4 decoration-2">#128 <span className="text-xs text-muted font-normal ml-1">(Global)</span></p>
                </div>
             </div>
          </div>
        </div>

        {/* Dynamic Matches Section */}
        <MatchesDisplay />

        {/* Secondary Info / CTA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-outfit font-bold italic">Win Exclusive Rewards</h3>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                Join our featured "PSL 2026 Grand League" and compete for a chance to win signed jerseys and match tickets.
              </p>
              <button className="px-6 py-2.5 rounded-xl bg-white text-background font-bold text-sm hover:scale-105 active:scale-95 transition-all">
                Join Private League
              </button>
            </div>
            <Trophy className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="glass-card p-8 bg-gradient-to-br from-secondary/5 to-transparent border-secondary/10 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-outfit font-bold italic">Invite Your Squad</h3>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                Cricket is better with friends. Create your own group and challenge your friends to see who has the best IQ.
              </p>
              <button className="px-6 py-2.5 rounded-xl bg-secondary text-background font-bold text-sm hover:scale-105 active:scale-95 transition-all">
                Create New Group
              </button>
            </div>
            <Users className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-secondary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </Shell>
  );
}
