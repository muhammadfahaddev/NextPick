export type Sport = "football" | "basketball" | "soccer";

export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  sport: Sport;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string; // ISO string
  status: MatchStatus;
  result?: {
    homeScore: number;
    awayScore: number;
    winner: "home" | "away" | "draw";
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
}

export type PredictionOutcome = "home" | "away" | "draw";

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinner: PredictionOutcome;
  confidence: number; // 1-3
  createdAt: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number;
}
