import React from 'react';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Match } from '@/hooks/useMatches';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onPredict?: (matchId: string) => void;
}

export function MatchCard({ match, onPredict }: MatchCardProps) {
  const isLive = match.status.toLowerCase().includes('live');
  const isFinished = match.status.toLowerCase().includes('finished') || match.status.toLowerCase().includes('result');
  
  let formattedDate = 'TBD';
  try {
    if (match.date) {
      formattedDate = format(new Date(match.date), 'MMM dd, h:mm a');
    }
  } catch (err) {
    console.warn('Invalid match date:', match.date);
  }

  return (
    <div className="glass-card hover:border-primary/30 transition-all duration-300 group overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted px-2 py-0.5 rounded bg-white/5 border border-white/5">
            {match.match_type}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Live
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
      </div>

      {/* Card Body (Teams) */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <TeamView name={match.team_a} score={match.score_a} />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-outfit font-bold text-muted/50 italic">VS</span>
          </div>
          <TeamView name={match.team_b} score={match.score_b} align="right" />
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            <span className="truncate max-w-[120px]">{match.venue}</span>
          </div>
          
          {!isFinished ? (
            <Button 
              size="sm" 
              variant="primary" 
              className="px-4 rounded-lg h-9 group/btn"
              onClick={() => onPredict?.(match.id)}
            >
              Predict
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <span className="text-xs font-bold text-muted italic">Result: {match.status}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamView({ name, score, align = 'left' }: { name?: string, score?: string, align?: 'left' | 'right' }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  
  return (
    <div className={cn(
      "flex flex-col gap-2 flex-1 min-w-0",
      align === 'right' ? "items-end text-right" : "items-start text-left"
    )}>
      <div className={cn(
        "flex items-center gap-3",
        align === 'right' ? "flex-row-reverse" : "flex-row"
      )}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-outfit font-bold text-lg text-white/80 shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-outfit font-bold text-sm lg:text-base truncate leading-tight">{name}</h4>
          {score && <p className="text-primary font-bold text-lg leading-tight mt-1">{score}</p>}
        </div>
      </div>
    </div>
  );
}
