import type { Match } from "@/lib/types";

const sportColors: Record<string, string> = {
  football: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  basketball: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  soccer: "bg-green-500/20 text-green-400 border-green-500/30",
};

const sportLabels: Record<string, string> = {
  football: "NFL",
  basketball: "NBA",
  soccer: "Soccer",
};

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Props {
  match: Match;
  userPrediction?: "home" | "away" | "draw";
  onPredict?: (matchId: string, outcome: "home" | "away" | "draw") => void;
  loading?: boolean;
}

export default function MatchCard({
  match,
  userPrediction,
  onPredict,
  loading,
}: Props) {
  const sportColor = sportColors[match.sport] ?? "";
  const isPredicting = !!onPredict && match.status === "upcoming";

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${sportColor}`}
        >
          {sportLabels[match.sport]}
        </span>
        <div className="text-right">
          {match.status === "upcoming" && (
            <span className="text-xs text-slate-400">
              {formatDate(match.startTime)} · {formatTime(match.startTime)}
            </span>
          )}
          {match.status === "live" && (
            <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
              LIVE
            </span>
          )}
          {match.status === "finished" && match.result && (
            <span className="text-xs text-slate-400">Final</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        {/* Home team */}
        <div className="flex-1 text-center">
          <div className="text-2xl mb-1">{match.homeTeam.logo}</div>
          <div className="text-sm font-medium text-white leading-tight">
            {match.homeTeam.name}
          </div>
          <div className="text-xs text-slate-400">Home</div>
          {match.result && (
            <div
              className={`text-2xl font-bold mt-1 ${
                match.result.winner === "home"
                  ? "text-green-400"
                  : "text-slate-300"
              }`}
            >
              {match.result.homeScore}
            </div>
          )}
        </div>

        <div className="text-slate-500 font-bold text-lg">VS</div>

        {/* Away team */}
        <div className="flex-1 text-center">
          <div className="text-2xl mb-1">{match.awayTeam.logo}</div>
          <div className="text-sm font-medium text-white leading-tight">
            {match.awayTeam.name}
          </div>
          <div className="text-xs text-slate-400">Away</div>
          {match.result && (
            <div
              className={`text-2xl font-bold mt-1 ${
                match.result.winner === "away"
                  ? "text-green-400"
                  : "text-slate-300"
              }`}
            >
              {match.result.awayScore}
            </div>
          )}
        </div>
      </div>

      {/* Prediction buttons */}
      {isPredicting && !userPrediction && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => onPredict(match.id, "home")}
            disabled={loading}
            className="py-2 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 rounded-lg transition-colors disabled:opacity-50"
          >
            Home Win
          </button>
          <button
            onClick={() => onPredict(match.id, "draw")}
            disabled={loading}
            className="py-2 text-xs font-medium bg-slate-600/20 hover:bg-slate-600/40 border border-slate-500/40 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            Draw
          </button>
          <button
            onClick={() => onPredict(match.id, "away")}
            disabled={loading}
            className="py-2 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 rounded-lg transition-colors disabled:opacity-50"
          >
            Away Win
          </button>
        </div>
      )}

      {/* Existing prediction */}
      {userPrediction && match.status === "upcoming" && (
        <div className="mt-4 text-center">
          <span className="text-xs text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
            ✓ Your pick:{" "}
            {userPrediction === "home"
              ? match.homeTeam.name
              : userPrediction === "away"
              ? match.awayTeam.name
              : "Draw"}
          </span>
        </div>
      )}

      {/* Finished with user prediction */}
      {userPrediction && match.status === "finished" && match.result && (
        <div className="mt-4 text-center">
          {userPrediction === match.result.winner ? (
            <span className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
              ✓ Correct pick! +1 pt
            </span>
          ) : (
            <span className="text-xs text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
              ✗ Wrong pick (picked{" "}
              {userPrediction === "home"
                ? match.homeTeam.name
                : userPrediction === "away"
                ? match.awayTeam.name
                : "Draw"}
              )
            </span>
          )}
        </div>
      )}
    </div>
  );
}
