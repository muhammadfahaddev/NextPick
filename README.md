# NextPick – Sports Prediction App

NextPick is a full-stack web application for sports predictions. Register, make your picks for upcoming NFL, NBA, and Soccer matches, and compete on the global leaderboard.

## Features

- **Authentication** – Register and log in with email/password (NextAuth.js v5 + bcrypt)
- **Dashboard** – Personal stats (points, accuracy, total predictions) and match overviews
- **Prediction Engine** – Pick the winner (Home Win / Draw / Away Win) for upcoming matches across NFL, Basketball, and Soccer
- **Leaderboard** – Ranked list of all players by points and prediction accuracy
- **Responsive UI** – Works on mobile and desktop

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **NextAuth.js v5** (Credentials provider, JWT sessions)
- **bcryptjs** for password hashing
- **lucide-react** for icons
- File-based JSON storage in `./data/` (easily swappable for a real DB)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, /register   – Auth pages
│   ├── (dashboard)/              – Protected pages (dashboard, predictions, leaderboard)
│   └── api/                      – REST API routes
├── components/                   – NavBar, MatchCard, StatsCard, SessionProvider
└── lib/                          – auth.ts, db.ts, types.ts
data/                             – JSON flat-file storage (git-ignored)
```
