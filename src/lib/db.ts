import fs from "fs";
import path from "path";
import type { Match, User, Prediction } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filepath, "utf-8")) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ---- Users ----
export function getUsers(): User[] {
  return readJSON<User[]>("users.json", []);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  writeJSON("users.json", users);
}

// ---- Matches ----
export function getMatches(): Match[] {
  return readJSON<Match[]>("matches.json", seedMatches());
}

export function getMatchById(id: string): Match | undefined {
  return getMatches().find((m) => m.id === id);
}

// ---- Predictions ----
export function getPredictions(): Prediction[] {
  return readJSON<Prediction[]>("predictions.json", []);
}

export function getPredictionsByUser(userId: string): Prediction[] {
  return getPredictions().filter((p) => p.userId === userId);
}

export function getPredictionsByMatch(matchId: string): Prediction[] {
  return getPredictions().filter((p) => p.matchId === matchId);
}

export function getUserMatchPrediction(
  userId: string,
  matchId: string
): Prediction | undefined {
  return getPredictions().find(
    (p) => p.userId === userId && p.matchId === matchId
  );
}

export function savePrediction(prediction: Prediction): void {
  const predictions = getPredictions();
  const idx = predictions.findIndex((p) => p.id === prediction.id);
  if (idx >= 0) {
    predictions[idx] = prediction;
  } else {
    predictions.push(prediction);
  }
  writeJSON("predictions.json", predictions);
}

// ---- Seed Data ----
function seedMatches(): Match[] {
  const now = new Date();
  const h = (hours: number) =>
    new Date(now.getTime() + hours * 3600 * 1000).toISOString();

  const matches: Match[] = [
    // Football (NFL)
    {
      id: "m1",
      sport: "football",
      homeTeam: { name: "Kansas City Chiefs", logo: "🏈" },
      awayTeam: { name: "San Francisco 49ers", logo: "🏈" },
      startTime: h(2),
      status: "upcoming",
    },
    {
      id: "m2",
      sport: "football",
      homeTeam: { name: "Dallas Cowboys", logo: "🏈" },
      awayTeam: { name: "Philadelphia Eagles", logo: "🏈" },
      startTime: h(5),
      status: "upcoming",
    },
    // Basketball (NBA)
    {
      id: "m3",
      sport: "basketball",
      homeTeam: { name: "Los Angeles Lakers", logo: "🏀" },
      awayTeam: { name: "Boston Celtics", logo: "🏀" },
      startTime: h(3),
      status: "upcoming",
    },
    {
      id: "m4",
      sport: "basketball",
      homeTeam: { name: "Golden State Warriors", logo: "🏀" },
      awayTeam: { name: "Miami Heat", logo: "🏀" },
      startTime: h(7),
      status: "upcoming",
    },
    // Soccer (EPL)
    {
      id: "m5",
      sport: "soccer",
      homeTeam: { name: "Manchester City", logo: "⚽" },
      awayTeam: { name: "Arsenal", logo: "⚽" },
      startTime: h(1),
      status: "upcoming",
    },
    {
      id: "m6",
      sport: "soccer",
      homeTeam: { name: "Liverpool", logo: "⚽" },
      awayTeam: { name: "Chelsea", logo: "⚽" },
      startTime: h(4),
      status: "upcoming",
    },
    // Finished matches for history
    {
      id: "m7",
      sport: "football",
      homeTeam: { name: "Buffalo Bills", logo: "🏈" },
      awayTeam: { name: "Miami Dolphins", logo: "🏈" },
      startTime: h(-24),
      status: "finished",
      result: { homeScore: 28, awayScore: 21, winner: "home" },
    },
    {
      id: "m8",
      sport: "basketball",
      homeTeam: { name: "Denver Nuggets", logo: "🏀" },
      awayTeam: { name: "Phoenix Suns", logo: "🏀" },
      startTime: h(-12),
      status: "finished",
      result: { homeScore: 112, awayScore: 108, winner: "home" },
    },
    {
      id: "m9",
      sport: "soccer",
      homeTeam: { name: "Manchester United", logo: "⚽" },
      awayTeam: { name: "Tottenham", logo: "⚽" },
      startTime: h(-8),
      status: "finished",
      result: { homeScore: 2, awayScore: 2, winner: "draw" },
    },
  ];
  return matches;
}
