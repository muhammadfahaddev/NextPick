'use client';

import React from 'react';
import { useLeaderboard, type LeaderboardEntry } from '@/hooks/useLeaderboard';
import { Trophy, Medal, Star, Shield, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const { leaderboard, loading, error } = useLeaderboard();

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-primary px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Global Ranking</span>
        </div>
        <h1 className="text-5xl font-outfit font-extrabold tracking-tight">Hall of Fame</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          The ultimate arena for NextPick strategists. Only the top analysts earn their place here.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted font-medium animate-pulse">Calculating rankings...</p>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="space-y-12">
          {/* Podium Area */}
          <div className="mt-8 flex flex-col md:flex-row items-end justify-center gap-4 px-4">
            {/* 2nd Place */}
            {topThree[1] && <PodiumStep entry={topThree[1]} rank={2} color="text-slate-300" />}
            {/* 1st Place */}
            {topThree[0] && <PodiumStep entry={topThree[0]} rank={1} color="text-primary" featured />}
            {/* 3rd Place */}
            {topThree[2] && <PodiumStep entry={topThree[2]} rank={3} color="text-amber-600" />}
          </div>

          {/* List Area */}
          {others.length > 0 && (
            <div className="max-w-4xl mx-auto glass-card overflow-hidden">
              <div className="grid grid-cols-12 p-6 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted">
                <div className="col-span-1">Rank</div>
                <div className="col-span-7">Player</div>
                <div className="col-span-2 text-center">Matches</div>
                <div className="col-span-2 text-right">Total Points</div>
              </div>
              <div className="divide-y divide-white/5">
                {others.map((entry, idx) => (
                  <div key={entry.user_id} className="grid grid-cols-12 p-6 items-center hover:bg-white/[0.02] transition-colors group">
                    <div className="col-span-1 font-outfit font-bold text-muted group-hover:text-white transition-colors">
                      {idx + 4}
                    </div>
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs uppercase">
                        {entry.full_name[0]}
                      </div>
                      <span className="font-bold">{entry.full_name}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm font-medium text-muted">
                      {entry.prediction_count}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="font-outfit font-black text-white group-hover:text-primary transition-colors">
                        {entry.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-20 text-center max-w-2xl mx-auto space-y-4">
          <Trophy className="w-16 h-16 text-muted/20 mx-auto" />
          <h2 className="text-2xl font-bold">Leaderboard is empty</h2>
          <p className="text-muted">Start predicting matches to see yourself on the board!</p>
        </div>
      )}
    </div>
  );
}

function PodiumStep({ entry, rank, color, featured = false }: { entry: LeaderboardEntry, rank: number, color: string, featured?: boolean }) {
  const Icon = rank === 1 ? Trophy : Medal;
  const height = rank === 1 ? 'md:h-64' : rank === 2 ? 'md:h-48' : 'md:h-40';

  return (
    <div className={cn(
      "relative flex flex-col items-center w-full md:w-64 space-y-4 transition-all duration-700",
      featured ? "z-10 scale-110" : "z-0"
    )}>
      <div className="flex flex-col items-center text-center space-y-1">
        <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10 mb-2", color)}>
          <Icon className="w-8 h-8" />
        </div>
        <p className="font-outfit font-black text-xl truncate w-full px-2">{entry.full_name}</p>
        <p className={cn("font-bold text-sm", color)}>{entry.points} PTS</p>
      </div>
      
      <div className={cn(
        "hidden md:flex w-full rounded-t-3xl items-center justify-center flex-col glass-card border-white/10",
        height,
        featured ? "bg-primary/10 shadow-lg shadow-primary/5" : "bg-white/5"
      )}>
        <span className={cn("font-outfit font-black text-6xl opacity-20", color)}>{rank}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/50 mt-2">Rank</p>
      </div>
    </div>
  );
}
