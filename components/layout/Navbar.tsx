'use client';

import React from 'react';
import { Bell, Search, Menu, UserCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

export function Navbar() {
  return (
    <header className="fixed top-0 right-0 h-16 w-full lg:w-[calc(100%-256px)] bg-background/50 backdrop-blur-xl border-b border-border/50 z-40 transition-all duration-300">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-muted hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <div className="lg:hidden">
            <Logo iconOnly />
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-sm font-medium text-muted uppercase tracking-widest">
              NextPick / <span className="text-foreground">Predict Cricket, Win Big</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 group focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search leagues, groups..." 
              className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted/50"
            />
          </div>

          <button className="relative p-2 rounded-xl text-muted hover:bg-white/5 transition-all">
            <Bell className="w-6 h-6" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-background" />
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-border/50 group cursor-pointer">
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <span className="text-sm font-medium">Fahad</span>
              <span className="text-xs text-muted">1280 pts</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-primary/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
