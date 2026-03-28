-- ============================================
-- NextPick - Initial Database Schema
-- ============================================

-- 1. TABLES
-- Create all tables first to avoid dependency issues in policies

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- GROUP_MEMBERS
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- LEAGUES
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  series_id TEXT NOT NULL,
  league_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- GROUP_LEAGUES (junction)
CREATE TABLE IF NOT EXISTS public.group_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(group_id, league_id)
);

-- MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  cricapi_match_id TEXT UNIQUE NOT NULL,
  team1_name TEXT NOT NULL,
  team1_short TEXT,
  team1_img TEXT,
  team2_name TEXT NOT NULL,
  team2_short TEXT,
  team2_img TEXT,
  venue TEXT,
  match_type TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  winner TEXT,
  match_result TEXT,
  match_datetime TIMESTAMPTZ NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PREDICTIONS
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  predicted_team TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, match_id, group_id)
);


-- 2. FUNCTIONS & TRIGGERS

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to check group admin status without recursion
CREATE OR REPLACE FUNCTION public.is_group_admin(gid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. RLS POLICIES

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view their groups" ON public.groups;
CREATE POLICY "Members can view their groups" ON public.groups FOR SELECT TO authenticated 
  USING (public.is_group_member(id));
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Admins can update their groups" ON public.groups;
CREATE POLICY "Admins can update their groups" ON public.groups FOR UPDATE TO authenticated 
  USING (public.is_group_admin(id));
DROP POLICY IF EXISTS "Admins can delete their groups" ON public.groups;
CREATE POLICY "Admins can delete their groups" ON public.groups FOR DELETE TO authenticated 
  USING (public.is_group_admin(id));

-- Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT TO authenticated 
  USING (public.is_group_member(group_id));
DROP POLICY IF EXISTS "Authenticated users can insert themselves" ON public.group_members;
CREATE POLICY "Authenticated users can insert themselves" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can delete members" ON public.group_members;
CREATE POLICY "Admins can delete members" ON public.group_members FOR DELETE TO authenticated 
  USING (public.is_group_admin(group_id));

-- Leagues
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view leagues" ON public.leagues;
CREATE POLICY "Authenticated users can view leagues" ON public.leagues FOR SELECT TO authenticated USING (true);

-- Group Leagues
ALTER TABLE public.group_leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view group leagues" ON public.group_leagues;
CREATE POLICY "Members can view group leagues" ON public.group_leagues FOR SELECT TO authenticated 
  USING (public.is_group_member(group_id));
DROP POLICY IF EXISTS "Admins can manage group leagues" ON public.group_leagues;
CREATE POLICY "Admins can manage group leagues" ON public.group_leagues FOR INSERT TO authenticated 
  WITH CHECK (public.is_group_admin(group_id));
DROP POLICY IF EXISTS "Admins can delete group leagues" ON public.group_leagues;
CREATE POLICY "Admins can delete group leagues" ON public.group_leagues FOR DELETE TO authenticated 
  USING (public.is_group_admin(group_id));

-- Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view matches" ON public.matches;
CREATE POLICY "Authenticated users can view matches" ON public.matches FOR SELECT TO authenticated USING (true);

-- Predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view predictions in their groups" ON public.predictions;
CREATE POLICY "Users can view predictions in their groups" ON public.predictions FOR SELECT TO authenticated 
  USING (public.is_group_member(group_id));
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
CREATE POLICY "Users can insert own predictions" ON public.predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;
CREATE POLICY "Users can update own predictions" ON public.predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_matches_league_status ON public.matches(league_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_datetime ON public.matches(match_datetime);
CREATE INDEX IF NOT EXISTS idx_predictions_group_user ON public.predictions(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.predictions(match_id);
