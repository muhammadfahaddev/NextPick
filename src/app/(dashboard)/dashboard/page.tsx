import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getMatches,
  getPredictionsByUser,
  getUserById,
} from "@/lib/db";
import StatsCard from "@/components/StatsCard";
import MatchCard from "@/components/MatchCard";
import { Trophy, Target, CheckCircle2, TrendingUp } from "lucide-react";
import type { Match, Prediction } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = getUserById(session.user.id);
  const matches = getMatches();
  const predictions = getPredictionsByUser(session.user.id);

  const upcoming = matches.filter((m) => m.status === "upcoming").slice(0, 3);
  const recent = matches.filter((m) => m.status === "finished").slice(0, 3);

  const predMap = new Map<string, Prediction>(predictions.map((p) => [p.matchId, p]));

  const accuracy =
    user && user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name}! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s your prediction summary
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Points"
          value={user?.points ?? 0}
          icon={Trophy}
          description="Lifetime points"
          color="yellow"
        />
        <StatsCard
          title="Predictions"
          value={user?.totalPredictions ?? 0}
          icon={Target}
          description="Total picks made"
          color="indigo"
        />
        <StatsCard
          title="Correct"
          value={user?.correctPredictions ?? 0}
          icon={CheckCircle2}
          description="Correct outcomes"
          color="green"
        />
        <StatsCard
          title="Accuracy"
          value={`${accuracy}%`}
          icon={TrendingUp}
          description="Win rate"
          color="red"
        />
      </div>

      {/* Upcoming matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Matches</h2>
          <Link
            href="/predictions"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View all →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming matches.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((match: Match) => (
              <MatchCard
                key={match.id}
                match={match}
                userPrediction={predMap.get(match.id)?.predictedWinner}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Results</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm">No recent results.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((match: Match) => (
              <MatchCard
                key={match.id}
                match={match}
                userPrediction={predMap.get(match.id)?.predictedWinner}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
