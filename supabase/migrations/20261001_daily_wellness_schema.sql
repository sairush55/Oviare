-- Oviare Phase 4: Daily Wellness & Symptoms Schema with Row Level Security (RLS)
-- Target Database: Supabase PostgreSQL

-- 1. Daily Logs Table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  moods TEXT[] NULL,
  sleep_duration_minutes INTEGER NULL CHECK (sleep_duration_minutes IS NULL OR (sleep_duration_minutes >= 0 AND sleep_duration_minutes <= 1440)),
  sleep_quality TEXT NULL CHECK (sleep_quality IS NULL OR sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  energy_level INTEGER NULL CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 5)),
  intimacy_logged BOOLEAN NOT NULL DEFAULT FALSE,
  intimacy_notes TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraint: Exactly one daily log entry per user per date
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

-- 2. Daily Symptoms Table
CREATE TABLE IF NOT EXISTS public.daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraint: Unique symptom per daily log
  CONSTRAINT unique_log_symptom UNIQUE (daily_log_id, symptom_name)
);

-- 3. Custom Symptoms Table (User-scoped custom tracking categories)
CREATE TABLE IF NOT EXISTS public.custom_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT unique_user_custom_symptom UNIQUE (user_id, symptom_name)
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_symptoms_log_id ON public.daily_symptoms (daily_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_symptoms_user_id ON public.daily_symptoms (user_id);
CREATE INDEX IF NOT EXISTS idx_custom_symptoms_user_id ON public.custom_symptoms (user_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_symptoms ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies for daily_logs
CREATE POLICY "Users can view their own daily logs"
  ON public.daily_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily logs"
  ON public.daily_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily logs"
  ON public.daily_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily logs"
  ON public.daily_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Row Level Security Policies for daily_symptoms
CREATE POLICY "Users can view their own daily symptoms"
  ON public.daily_symptoms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily symptoms"
  ON public.daily_symptoms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.daily_logs WHERE id = daily_log_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own daily symptoms"
  ON public.daily_symptoms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily symptoms"
  ON public.daily_symptoms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. Row Level Security Policies for custom_symptoms
CREATE POLICY "Users can view their own custom symptoms"
  ON public.custom_symptoms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom symptoms"
  ON public.custom_symptoms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom symptoms"
  ON public.custom_symptoms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. Automatic updated_at triggers
DROP TRIGGER IF EXISTS on_daily_logs_updated ON public.daily_logs;
CREATE TRIGGER on_daily_logs_updated
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_daily_symptoms_updated ON public.daily_symptoms;
CREATE TRIGGER on_daily_symptoms_updated
  BEFORE UPDATE ON public.daily_symptoms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
