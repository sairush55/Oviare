-- ==============================================================================
-- Oviare Phase 5: Personalization, Custom Categories & Data Management Schema
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. User Tracking Preferences Table
-- Controls which wellness categories the user desires to display in the logging UI.
CREATE TABLE IF NOT EXISTS public.user_tracking_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mood_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sleep_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  energy_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notes_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  intimacy_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraint: Exactly one tracking preference configuration per user
  CONSTRAINT unique_user_tracking_preferences UNIQUE (user_id)
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_tracking_preferences_user_id 
  ON public.user_tracking_preferences (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_tracking_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tracking_preferences
CREATE POLICY "Users can view their own tracking preferences"
  ON public.user_tracking_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking preferences"
  ON public.user_tracking_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking preferences"
  ON public.user_tracking_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking preferences"
  ON public.user_tracking_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger for user_tracking_preferences
DROP TRIGGER IF EXISTS on_user_tracking_preferences_updated ON public.user_tracking_preferences;
CREATE TRIGGER on_user_tracking_preferences_updated
  BEFORE UPDATE ON public.user_tracking_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Enhance Custom Symptoms / Categories Table
-- Ensure custom_symptoms has category_type, is_active, and updated_at
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  -- Add category_type if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'custom_symptoms' 
      AND column_name = 'category_type'
  ) THEN
    ALTER TABLE public.custom_symptoms 
      ADD COLUMN category_type TEXT NOT NULL DEFAULT 'symptom' 
      CHECK (category_type IN ('symptom', 'wellness'));
  END IF;

  -- Add is_active if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'custom_symptoms' 
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.custom_symptoms 
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  -- Add updated_at if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'custom_symptoms' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.custom_symptoms 
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
  END IF;
END $$;

-- Add RLS policy for updating custom symptoms (rename, toggle active status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'custom_symptoms' 
      AND policyname = 'Users can update their own custom symptoms'
  ) THEN
    CREATE POLICY "Users can update their own custom symptoms"
      ON public.custom_symptoms
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
