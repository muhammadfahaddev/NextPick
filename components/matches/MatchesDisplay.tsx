'use client';

import React, { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { MatchCard } from './MatchCard';
import { Trophy, Calendar, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MatchesDisplay() {
  const [selectedLeague, setSelectedLeague] = useState<string | undefined>(undefined);
  const { matches, leagues, loading, error } = useMatches(selectedLeague);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted font-outfit">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-10 text-center space-y-4 border-danger/20">
        <p className="text-danger">Failed to load matches: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const liveMatches = matches.filter(m => m.status.toLowerCase().includes('live'));
  const upcomingMatches = matches.filter(m => !m.status.toLowerCase().includes('live') && !m.status.toLowerCase().includes('finished') && !m.status.toLowerCase().includes('result'));

  return (
    <div className="space-y-8">
      {/* League Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedLeague(undefined)}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
            !selectedLeague 
              ? "bg-primary text-background border-primary" 
              : "glass border-white/10 text-muted hover:border-white/30"
          )}
        >
          All Matches
        </button>
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              selectedLeague === league.id 
                ? "bg-primary text-background border-primary" 
                : "glass border-white/10 text-muted hover:border-white/30"
            )}
          >
            {league.name}
          </button>
        ))}
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="w-5 h-5" />
            <h3 className="text-xl font-outfit font-bold uppercase tracking-tight">Live Now</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted">
          <Calendar className="w-5 h-5" />
          <h3 className="text-xl font-outfit font-bold uppercase tracking-tight">Upcoming Series</h3>
        </div>
        
        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted/30" />
            </div>
            <div>
              <p className="font-bold">No upcoming matches</p>
              <p className="text-sm text-muted">Check back later or try selecting another league.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
