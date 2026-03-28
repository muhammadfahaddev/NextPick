import { getUsers } from "@/lib/db";
import { Trophy, Target, CheckCircle2, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const users = getUsers();
  const leaderboard: LeaderboardEntry[] = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      points: u.points,
      correctPredictions: u.correctPredictions,
      totalPredictions: u.totalPredictions,
      accuracy:
        u.totalPredictions > 0
          ? Math.round((u.correctPredictions / u.totalPredictions) * 100)
          : 0,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 mt-1">
          Top predictors ranked by points earned
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-slate-400">
            No predictions yet. Be the first to make a pick!
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">
              <Trophy className="w-3 h-3 inline mr-1" />
              Points
            </div>
            <div className="col-span-2 text-center">
              <Target className="w-3 h-3 inline mr-1" />
              Total
            </div>
            <div className="col-span-2 text-center">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              Correct
            </div>
            <div className="col-span-1 text-center">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              %
            </div>
          </div>

          {/* Rows */}
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.userId}
              className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 last:border-0 transition-colors ${
                idx === 0 ? "bg-yellow-500/5" : "hover:bg-slate-700/30"
              }`}
            >
              <div className="col-span-1 flex items-center">
                <span className="text-lg">{medals[idx] ?? `${idx + 1}`}</span>
              </div>
              <div className="col-span-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white mr-3 shrink-0">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-white">{entry.name}</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span
                  className={`font-bold ${idx === 0 ? "text-yellow-400" : "text-white"}`}
                >
                  {entry.points}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center text-slate-300">
                {entry.totalPredictions}
              </div>
              <div className="col-span-2 flex items-center justify-center text-green-400">
                {entry.correctPredictions}
              </div>
              <div className="col-span-1 flex items-center justify-center text-slate-300 text-sm">
                {entry.accuracy}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
