// ============================================
// NextPick - TypeScript Type Definitions
// ============================================

// ---------- Database Models ----------

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export type MemberRole = 'ADMIN' | 'MEMBER';

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface GroupMemberWithProfile extends GroupMember {
  profiles: Profile;
}

export interface League {
  id: string;
  name: string;
  key: string;
  series_id: string;
  league_type: string;
  is_active: boolean;
  created_at: string;
}

export interface GroupLeague {
  id: string;
  group_id: string;
  league_id: string;
  created_at: string;
}

export interface GroupLeagueWithDetails extends GroupLeague {
  leagues: League;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Match {
  id: string;
  league_id: string;
  cricapi_match_id: string;
  team1_name: string;
  team1_short: string | null;
  team1_img: string | null;
  team2_name: string;
  team2_short: string | null;
  team2_img: string | null;
  venue: string | null;
  match_type: string | null;
  status: MatchStatus;
  winner: string | null;
  match_result: string | null;
  match_datetime: string;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  group_id: string;
  predicted_team: string;
  is_correct: boolean | null;
  points_earned: number;
  created_at: string;
}

export interface PredictionWithDetails extends Prediction {
  profiles: Profile;
  matches: Match;
}

// ---------- API Request Bodies ----------

export interface SignupRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
}

export interface JoinGroupRequest {
  invite_code: string;
}

export interface AddMemberRequest {
  email: string;
}

export interface AddLeagueToGroupRequest {
  league_id: string;
}

export interface CreatePredictionRequest {
  match_id: string;
  group_id: string;
  predicted_team: string;
}

export interface UpdatePredictionRequest {
  predicted_team: string;
}

// ---------- API Response Types ----------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  total_predictions: number;
  correct_predictions: number;
  rank: number;
}

export interface SyncResult {
  league: string;
  matches_synced: number;
  matches_scored: number;
}

// ---------- CricAPI Types ----------

export interface CricApiMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: CricApiTeamInfo[];
  score?: CricApiScore[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface CricApiTeamInfo {
  name: string;
  shortname: string;
  img: string;
}

export interface CricApiScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

export interface CricApiSeriesResponse {
  apikey: string;
  data: CricApiMatch[];
  status: string;
  info: {
    hitsToday: number;
    hitsUsed: number;
    hitsLimit: number;
    credits: number;
    server: number;
    offsetRows: number;
    totalRows: number;
    queryTime: number;
    s: number;
    cache: number;
  };
}
