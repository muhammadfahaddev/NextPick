'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { Trophy, Target, History, Award, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserStats {
  total_predictions: number;
  correct_predictions: number;
  total_points: number;
  accuracy: number;
}

interface UserPrediction {
  id: string;
  predicted_team: string;
  status: 'PENDING' | 'CORRECT' | 'WRONG';
  points_awarded?: number;
  created_at: string;
  match: {
    team_a: string;
    team_b: string;
    match_winner?: string;
    status: string;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<UserPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch Stats
        const statsRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const statsData = await statsRes.json();
        
        // Mocking stats logic based on prediction history if API doesn't provide it
        // In a real app, the backend would aggregate this.
        const histRes = await fetch('/api/predictions', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const histData = await histRes.json();
        const predictions = histData.data || [];
        
        const correct = predictions.filter((p: any) => p.status === 'CORRECT').length;
        const total = predictions.length;
        
        setStats({
          total_predictions: total,
          correct_predictions: correct,
          total_points: statsData.data?.points || 0,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
        });
        
        setHistory(predictions);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted mt-4">Gathering your achievements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="relative overflow-hidden glass-card p-10 flex flex-col md:flex-row items-center gap-8 border-primary/10">
        <div className="w-32 h-32 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-outfit font-black text-5xl text-primary animate-in zoom-in duration-500">
          {user?.full_name?.[0] || 'U'}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-outfit font-extrabold tracking-tight">{user?.full_name}</h1>
          <p className="text-muted text-lg">{user?.email}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-muted">NextPick Pro</span>
            <span className="text-xs text-muted">Member since {new Date().getFullYear()}</span>
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title="Total Points" value={stats?.total_points || 0} icon={Trophy} color="text-primary" />
        <StatItem title="Accuracy" value={`${stats?.accuracy}%`} icon={Target} color="text-secondary" />
        <StatItem title="Predictions" value={stats?.total_predictions || 0} icon={Award} color="text-accent" />
        <StatItem title="Best Streak" value={stats?.correct_predictions || 0} icon={TrendingUp} color="text-white" />
      </div>

      {/* History Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-muted" />
          <h2 className="text-2xl font-outfit font-bold">Prediction History</h2>
        </div>

        <div className="glass-card overflow-hidden">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">Date</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">Matchup</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">Your Pick</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted">Result</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-muted text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 text-sm font-medium text-muted">
                        {format(new Date(item.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 font-bold">
                          <span>{item.match.team_a}</span>
                          <span className="text-muted font-normal">vs</span>
                          <span>{item.match.team_b}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-sm font-bold">
                          {item.predicted_team}
                        </span>
                      </td>
                      <td className="p-5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-5 text-right font-outfit font-black text-lg">
                        <span className={cn(
                          item.status === 'CORRECT' ? "text-primary" : "text-muted/50"
                        )}>
                          {item.points_awarded || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center space-y-4">
              <History className="w-12 h-12 text-muted/20 mx-auto" />
              <p className="text-muted">No prediction history yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-3 hover:border-primary/20 transition-all duration-300 group">
      <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5 mb-2 group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-3xl font-outfit font-black text-white">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">{title}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserPrediction['status'] }) {
  if (status === 'CORRECT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Correct
      </span>
    );
  }
  if (status === 'WRONG') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 border border-danger/20 text-[10px] font-bold text-danger uppercase">
        <XCircle className="w-3.5 h-3.5" />
        Wrong
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted uppercase">
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
