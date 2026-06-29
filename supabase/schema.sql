-- ============================================================================
-- LifeLedger AI — Full Database Schema
-- Paste this entire script into Supabase SQL Editor and run it once.
-- ============================================================================

-- ─── Step 1: Extensions ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Step 2: updated_at trigger helper ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Step 3: Auto-create profile on new user signup ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Step 4: profiles ────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Step 5: items (WhereDidItGo) ────────────────────────────────────────────
CREATE TABLE public.items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) <= 100),
  category   TEXT NOT NULL DEFAULT 'Other',
  location   TEXT NOT NULL CHECK (char_length(location) <= 200),
  notes      TEXT CHECK (char_length(notes) <= 500),
  image_url  TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Step 6: routines (Repeat) ───────────────────────────────────────────────
CREATE TABLE public.routines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) <= 150),
  frequency     TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','custom')),
  interval      INTEGER DEFAULT 1 CHECK (interval > 0),
  interval_unit TEXT CHECK (interval_unit IN ('days','weeks','months')),
  next_due      DATE NOT NULL,
  reminder_time TIME,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Step 7: routine_completions ─────────────────────────────────────────────
CREATE TABLE public.routine_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id   UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action       TEXT DEFAULT 'completed' CHECK (action IN ('completed','skipped'))
);

-- ─── Step 8: activity_logs (LifeLog) ─────────────────────────────────────────
CREATE TABLE public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL CHECK (char_length(title) <= 200),
  category     TEXT NOT NULL DEFAULT 'Other',
  notes        TEXT CHECK (char_length(notes) <= 1000),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Step 9: chats (LifeGuide AI) ────────────────────────────────────────────
CREATE TABLE public.chats (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  message    TEXT NOT NULL,
  intent     TEXT,
  metadata   JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Step 10: Indexes ─────────────────────────────────────────────────────────
CREATE INDEX items_user_id_idx        ON public.items(user_id);
CREATE INDEX items_category_idx       ON public.items(category);
CREATE INDEX routines_user_id_idx     ON public.routines(user_id);
CREATE INDEX routines_next_due_idx    ON public.routines(next_due);
CREATE INDEX completions_routine_idx  ON public.routine_completions(routine_id);
CREATE INDEX completions_user_idx     ON public.routine_completions(user_id);
CREATE INDEX logs_user_id_idx         ON public.activity_logs(user_id);
CREATE INDEX logs_completed_at_idx    ON public.activity_logs(completed_at DESC);
CREATE INDEX chats_user_id_idx        ON public.chats(user_id);
CREATE INDEX chats_session_id_idx     ON public.chats(session_id);

-- ─── Step 11: updated_at triggers ────────────────────────────────────────────
CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Step 12: auth trigger (auto-create profile) ─────────────────────────────
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Step 13: Enable Row Level Security ──────────────────────────────────────
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats               ENABLE ROW LEVEL SECURITY;

-- ─── Step 14: RLS Policies (users only see their own data) ───────────────────
CREATE POLICY "own profiles"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "own items"
  ON public.items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "own routines"
  ON public.routines FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "own completions"
  ON public.routine_completions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "own logs"
  ON public.activity_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "own chats"
  ON public.chats FOR ALL
  USING (auth.uid() = user_id);

-- ─── Step 15: Storage Buckets ─────────────────────────────────────────────────
-- Run these only if you prefer SQL over the Dashboard UI.
-- Otherwise, create the buckets manually in Dashboard → Storage → New Bucket.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'item-images', 'item-images', true,
    5242880,   -- 5 MB
    ARRAY['image/jpeg','image/png','image/webp']
  ),
  (
    'avatars', 'avatars', true,
    2097152,   -- 2 MB
    ARRAY['image/jpeg','image/png','image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ─── Step 16: Storage RLS Policies ───────────────────────────────────────────
-- Users can only read/write files inside their own user-id folder

CREATE POLICY "Users manage own item images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users manage own avatar"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(name, '.', 1)
  );

-- ============================================================================
-- Done! Your LifeLedger AI database is ready.
-- ============================================================================
