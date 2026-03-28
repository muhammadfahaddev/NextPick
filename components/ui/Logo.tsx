import React from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group cursor-default", className)}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-background rounded-full p-1.5 border border-white/10">
          <Trophy className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </div>
      {!iconOnly && (
        <span className="font-outfit text-xl font-bold tracking-tight text-white">
          Next<span className="text-primary italic">Pick</span>
        </span>
      )}
    </div>
  );
}
