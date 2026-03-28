'use client';

import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Calendar, Trophy } from 'lucide-react';

export default function DashboardPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-outfit font-bold">Welcome back, Fahad!</h2>
          <p className="text-muted mt-1">Hero of the last match: Quetta Gladiators won by 5 wickets.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Points" 
            value="1,280" 
            icon={TrendingUp} 
            trend="+12% from last week"
            trendType="up"
          />
          <StatCard 
            title="Active Groups" 
            value="4" 
            icon={Users} 
            trend="Join more to win big"
          />
          <StatCard 
            title="Avg. Accuracy" 
            value="68%" 
            icon={ShieldCheck} 
            trend="Top 15% in Global"
            trendType="up"
          />
          <StatCard 
            title="Upcoming" 
            value="12" 
            icon={Calendar} 
            trend="Next match in 2h"
          />
        </div>

        {/* Placeholder for Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-outfit font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Featured Matches
            </h3>
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-muted max-w-xs">Integrating match data from CricketData.org. Your predictions will appear here shortly.</p>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-outfit font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" />
              Top Groups
            </h3>
            <div className="glass-card p-6 divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-muted">
                      {i}
                    </div>
                    <div>
                      <p className="font-medium">Karachi Kings Fanbase</p>
                      <p className="text-xs text-muted">24 Members</p>
                    </div>
                  </div>
                  <span className="text-sm text-primary font-medium">Join</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendType = 'neutral' }: any) {
  return (
    <div className="glass-card p-6 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trendType === 'up' ? "bg-primary/10 text-primary" : "bg-white/5 text-muted"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted mb-1 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-outfit font-bold">{value}</p>
      </div>
    </div>
  );
}

// Simple icons not imported above
function ShieldCheck(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
