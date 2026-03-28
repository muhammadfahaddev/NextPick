'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Match } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
}

export function PredictionModal({ isOpen, onClose, match }: PredictionModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [existingPrediction, setExistingPrediction] = useState<any>(null);
  const { submitPrediction, getMatchPrediction, loading, error } = usePredictions();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && match) {
      getMatchPrediction(match.id).then(setExistingPrediction);
      setSuccess(false);
      setSelectedTeam(null);
    }
  }, [isOpen, match, getMatchPrediction]);

  const handleSubmit = async () => {
    if (!match || !selectedTeam) return;

    try {
      await submitPrediction(match.id, selectedTeam);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  if (!match) return null;

  const teams = [
    { id: 'team_a', name: match.team_a, img: match.team_a_img },
    { id: 'team_b', name: match.team_b, img: match.team_b_img },
  ];

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[100] px-4"
          >
            <div className="glass-card shadow-2xl border-white/10 overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-outfit font-bold tracking-tight">Make Your Prediction</h3>
                  <p className="text-sm text-muted">Select the team you think will win.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                {existingPrediction ? (
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-primary italic uppercase tracking-wider">Already Predicted</p>
                      <p className="text-xs text-muted">You predicted <b>{existingPrediction.predicted_team}</b></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 justify-center py-4">
                    {teams.map((team) => (
                      <TeamOption 
                        key={team.id}
                        name={team.name}
                        isSelected={selectedTeam === team.name}
                        onClick={() => setSelectedTeam(team.name)}
                      />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-4 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Prediction Saved! Good luck.</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Info className="w-4 h-4" />
                  <span>Lockout: 30m before match start.</span>
                </div>
                {!existingPrediction && !success && (
                  <Button 
                    variant="primary" 
                    size="md" 
                    disabled={!selectedTeam} 
                    isLoading={loading}
                    onClick={handleSubmit}
                  >
                    Submit Prediction
                  </Button>
                )}
                {(existingPrediction || success) && (
                  <Button variant="ghost" size="md" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface TeamOptionProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

function TeamOption({ name, isSelected, onClick }: TeamOptionProps) {
  const initials = (name || '??').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-4 group p-4 rounded-3xl transition-all duration-300 border-2",
        isSelected 
          ? "border-primary bg-primary/10 scale-105 shadow-xl shadow-primary/10" 
          : "border-transparent hover:border-white/10"
      )}
    >
      <div className={cn(
        "w-24 h-24 rounded-[2rem] flex items-center justify-center font-outfit font-black text-3xl transition-all duration-500",
        isSelected 
          ? "bg-primary text-background" 
          : "bg-white/5 text-muted/50 group-hover:bg-white/10 group-hover:text-white/80"
      )}>
        {initials}
      </div>
      <span className={cn(
        "text-sm font-bold transition-colors",
        isSelected ? "text-primary" : "text-muted group-hover:text-white"
      )}>
        {name}
      </span>
    </button>
  );
}
