import React from 'react';
import { Users, Shield, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Group } from '@/hooks/useGroups';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const isAdmin = group.user_role === 'ADMIN';

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code);
    alert('Invite code copied!');
  };

  return (
    <div className="glass-card hover:border-secondary/30 transition-all duration-300 group relative overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center font-outfit font-black text-xl text-secondary">
            {group.name.substring(0, 1).toUpperCase()}
          </div>
          {isAdmin && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl font-outfit font-bold tracking-tight truncate">{group.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted mt-1">
            <Users className="w-4 h-4" />
            <span>{group.member_count || 0} Members</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-muted/80">
              {group.invite_code}
            </code>
            <button 
              onClick={copyInviteCode}
              className="p-1.5 hover:bg-white/5 rounded-lg text-muted transition-colors"
              title="Copy Invite Code"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href={`/groups/${group.id}`}>
            <Button size="sm" variant="ghost" className="h-9 px-3 group/btn">
              View Detail
              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors pointer-events-none" />
    </div>
  );
}
