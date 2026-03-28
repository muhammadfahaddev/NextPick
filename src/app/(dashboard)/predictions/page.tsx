"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import MatchCard from "@/components/MatchCard";
import type { Match, Prediction } from "@/lib/types";

type SportFilter = "all" | "football" | "basketball" | "soccer";
type StatusFilter = "all" | "upcoming" | "finished";

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [sport, setSport] = useState<SportFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("upcoming");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    const [mRes, pRes] = await Promise.all([
      fetch("/api/matches"),
      fetch("/api/predictions"),
    ]);
    const [mData, pData] = await Promise.all([mRes.json(), pRes.json()]);
    setMatches(Array.isArray(mData) ? mData : []);
    setPredictions(Array.isArray(pData) ? pData : []);
    setFetching(false);
    fetchingRef.current = false;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  async function handlePredict(
    matchId: string,
    outcome: "home" | "away" | "draw"
  ) {
    setLoading(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        predictedWinner: outcome,
        confidence: 1,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setToast("✓ Prediction saved!");
      fetchingRef.current = false;
      void fetchData();
    } else {
      const data = await res.json();
      setToast(`✗ ${data.error ?? "Error saving prediction"}`);
    }
    setTimeout(() => setToast(null), 3000);
  }

  const predMap = new Map<string, Prediction>(
    predictions.map((p) => [p.matchId, p])
  );

  const filtered = matches.filter((m) => {
    if (status !== "all" && m.status !== status) return false;
    if (sport !== "all" && m.sport !== sport) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Predictions</h1>
        <p className="text-slate-400 mt-1">
          Pick the winner for upcoming matches
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          {(["upcoming", "finished"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                status === s
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Sport filter */}
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          {(["all", "football", "basketball", "soccer"] as SportFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sport === s
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s === "all"
                  ? "All"
                  : s === "football"
                  ? "🏈 NFL"
                  : s === "basketball"
                  ? "🏀 NBA"
                  : "⚽ Soccer"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Matches grid */}
      {fetching ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400">No matches found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              userPrediction={predMap.get(match.id)?.predictedWinner}
              onPredict={handlePredict}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-sm text-white shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
