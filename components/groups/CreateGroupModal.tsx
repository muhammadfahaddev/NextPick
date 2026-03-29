'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Hash, Plus, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGroups } from '@/hooks/useGroups';
import { useMatches } from '@/hooks/useMatches';
import { cn } from '@/lib/utils';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [groupName, setGroupName] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createGroup, joinGroup } = useGroups();
  const { leagues, loading: leaguesLoading } = useMatches();

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'create') {
        if (!groupName) throw new Error('Group name is required');
        if (!leagueId) throw new Error('Please select a league for this group');
        await createGroup(groupName, leagueId);
      } else {
        if (!inviteCode) throw new Error('Invite code is required');
        await joinGroup(inviteCode);
      }
      onClose();
      setGroupName('');
      setInviteCode('');
      setLeagueId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[100] px-4"
          >
            <div className="glass-card shadow-2xl border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-outfit font-bold tracking-tight">Manage Groups</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="p-4 bg-white/[0.02] flex items-center gap-1 border-b border-white/5">
                <button 
                  onClick={() => setActiveTab('create')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                    activeTab === 'create' ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
                <button 
                  onClick={() => setActiveTab('join')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                    activeTab === 'join' ? "bg-white/10 text-white shadow-sm" : "text-muted hover:text-white"
                  )}
                >
                  <Hash className="w-4 h-4" />
                  Join with Code
                </button>
              </div>

              <div className="p-8 space-y-6">
                {activeTab === 'create' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Group Name</label>
                      <Input 
                        placeholder="e.g. Lahore Qalandars FC"
                        icon={<Users className="w-4 h-4" />}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Select League</label>
                      <select 
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                        value={leagueId}
                        onChange={(e) => setLeagueId(e.target.value)}
                        disabled={leaguesLoading}
                      >
                        <option value="" className="bg-background">Choose a league...</option>
                        {leagues.map(l => (
                          <option key={l.id} value={l.id} className="bg-background">{l.name}</option>
                        ))}
                      </select>
                      {leaguesLoading && <p className="text-[10px] text-primary animate-pulse ml-1">Loading leagues...</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Invite Code</label>
                      <Input 
                        placeholder="Paste code here (e.g. NP-1234)"
                        icon={<Hash className="w-4 h-4" />}
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="secondary"
                  isLoading={loading}
                  onClick={handleAction}
                >
                  {activeTab === 'create' ? 'Create Group' : 'Join Group'}
                  {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
