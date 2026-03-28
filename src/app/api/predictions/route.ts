import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPredictionsByUser,
  getUserMatchPrediction,
  savePrediction,
  getMatchById,
  saveUser,
  getUserById,
} from "@/lib/db";
import type { Prediction, PredictionOutcome } from "@/lib/types";

function generateId() {
  return crypto.randomUUID();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const predictions = getPredictionsByUser(session.user.id);
  return NextResponse.json(predictions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId, predictedWinner, confidence } = await req.json();

  if (!matchId || !predictedWinner) {
    return NextResponse.json(
      { error: "matchId and predictedWinner are required" },
      { status: 400 }
    );
  }

  const match = getMatchById(matchId);
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (match.status !== "upcoming") {
    return NextResponse.json(
      { error: "Cannot predict on a match that is not upcoming" },
      { status: 400 }
    );
  }

  const existing = getUserMatchPrediction(session.user.id, matchId);
  if (existing) {
    return NextResponse.json(
      { error: "You already predicted this match" },
      { status: 409 }
    );
  }

  const prediction: Prediction = {
    id: generateId(),
    userId: session.user.id,
    matchId,
    predictedWinner: predictedWinner as PredictionOutcome,
    confidence: Math.min(3, Math.max(1, Number(confidence) || 1)),
    createdAt: new Date().toISOString(),
  };

  savePrediction(prediction);

  // Update user total predictions count
  const user = getUserById(session.user.id);
  if (user) {
    user.totalPredictions += 1;
    saveUser(user);
  }

  return NextResponse.json(prediction, { status: 201 });
}
