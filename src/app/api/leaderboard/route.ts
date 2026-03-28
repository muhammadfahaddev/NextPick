import { NextResponse } from "next/server";
import { getUsers } from "@/lib/db";
import type { LeaderboardEntry } from "@/lib/types";

export async function GET() {
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

  return NextResponse.json(leaderboard);
}
