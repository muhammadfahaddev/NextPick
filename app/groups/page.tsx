'use client';

import React, { useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { Users, Plus, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GroupsPage() {
  const { groups, loading, error, refreshGroups } = useGroups();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-secondary px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full w-fit">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Community</span>
          </div>
          <h1 className="text-4xl font-outfit font-extrabold tracking-tight">Your Groups</h1>
          <p className="text-muted text-lg max-w-2xl">
            Join or create groups to compete with friends and climb the private leaderboards.
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          size="lg" 
          className="shadow-lg shadow-secondary/10"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create / Join Group
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            <div className="absolute inset-0 bg-secondary/20 blur-xl animate-pulse rounded-full" />
          </div>
          <p className="text-muted animate-pulse font-medium">Loading your community...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center border-danger/20">
          <p className="text-danger font-bold">Failed to load groups</p>
          <p className="text-sm text-muted mt-2">{error}</p>
          <Button variant="ghost" className="mt-4" onClick={() => refreshGroups()}>Try Again</Button>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <Users className="w-12 h-12 text-muted/30" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Groups Found</h2>
            <p className="text-muted">You haven't joined any groups yet. Start by creating your own or joining one with a code.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-start gap-4 text-left">
            <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              <b>Tip:</b> Groups allow you to have private competitions. Points you earn in any match are automatically added to all your groups.
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
          >
            Get Started Now
          </Button>
        </div>
      )}

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          refreshGroups();
        }} 
      />
    </div>
  );
}
