-- ==============================================================================
-- OVIARE CONSOLIDATED DATABASE MIGRATION (PHASES 3 & 4)
-- Project Ref: rjbpkcdvdegvaiaewhjw
-- ==============================================================================

-- 1. Updated_at Helper Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Cycle Records Table (Phase 3: Menstrual Periods & Cycle Intervals)
CREATE TABLE IF NOT EXISTS public.cycle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NULL,
  flow_intensity TEXT NULL CHECK (flow_intensity IS NULL OR flow_intensity IN ('light', 'medium', 'heavy', 'spotting')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT period_end_after_start CHECK (period_end IS NULL OR period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_cycle_records_user_start 
  ON public.cycle_records (user_id, period_start DESC);

ALTER TABLE public.cycle_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cycle records" ON public.cycle_records;
CREATE POLICY "Users can view their own cycle records"
  ON public.cycle_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cycle records" ON public.cycle_records;
CREATE POLICY "Users can insert their own cycle records"
  ON public.cycle_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cycle records" ON public.cycle_records;
CREATE POLICY "Users can update their own cycle records"
  ON public.cycle_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cycle records" ON public.cycle_records;
CREATE POLICY "Users can delete their own cycle records"
  ON public.cycle_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_cycle_records_updated ON public.cycle_records;
CREATE TRIGGER on_cycle_records_updated
  BEFORE UPDATE ON public.cycle_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Daily Logs Table (Phase 4: Multi-Mood, Sleep, Energy, Notes)
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
  CONSTRAINT unique_user_log_date UNIQUE (user_id, log_date)
);

-- 4. Daily Symptoms Table (Phase 4: Multi-Symptom with Mild/Moderate/Severe)
CREATE TABLE IF NOT EXISTS public.daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_log_symptom UNIQUE (daily_log_id, symptom_name)
);

-- 5. Custom Symptoms Table (Phase 4: User-Scoped Custom Symptoms)
CREATE TABLE IF NOT EXISTS public.custom_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_custom_symptom UNIQUE (user_id, symptom_name)
);

-- 6. Indexes for Phase 4
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_symptoms_log_id ON public.daily_symptoms (daily_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_symptoms_user_id ON public.daily_symptoms (user_id);
CREATE INDEX IF NOT EXISTS idx_custom_symptoms_user_id ON public.custom_symptoms (user_id);

-- 7. Row Level Security for Phase 4
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_symptoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily logs" ON public.daily_logs;
CREATE POLICY "Users can view their own daily logs"
  ON public.daily_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily logs" ON public.daily_logs;
CREATE POLICY "Users can insert their own daily logs"
  ON public.daily_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily logs" ON public.daily_logs;
CREATE POLICY "Users can update their own daily logs"
  ON public.daily_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own daily logs" ON public.daily_logs;
CREATE POLICY "Users can delete their own daily logs"
  ON public.daily_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own daily symptoms" ON public.daily_symptoms;
CREATE POLICY "Users can view their own daily symptoms"
  ON public.daily_symptoms FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily symptoms" ON public.daily_symptoms;
CREATE POLICY "Users can insert their own daily symptoms"
  ON public.daily_symptoms FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.daily_logs WHERE id = daily_log_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own daily symptoms" ON public.daily_symptoms;
CREATE POLICY "Users can update their own daily symptoms"
  ON public.daily_symptoms FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own daily symptoms" ON public.daily_symptoms;
CREATE POLICY "Users can delete their own daily symptoms"
  ON public.daily_symptoms FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own custom symptoms" ON public.custom_symptoms;
CREATE POLICY "Users can view their own custom symptoms"
  ON public.custom_symptoms FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own custom symptoms" ON public.custom_symptoms;
CREATE POLICY "Users can insert their own custom symptoms"
  ON public.custom_symptoms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own custom symptoms" ON public.custom_symptoms;
CREATE POLICY "Users can delete their own custom symptoms"
  ON public.custom_symptoms FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_daily_logs_updated ON public.daily_logs;
CREATE TRIGGER on_daily_logs_updated
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_daily_symptoms_updated ON public.daily_symptoms;
CREATE TRIGGER on_daily_symptoms_updated
  BEFORE UPDATE ON public.daily_symptoms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. NOTIFICATIONS & SMART REMINDERS (Additional Phase 4)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  wellness_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  period_logging_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_period_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_time TEXT NOT NULL DEFAULT '20:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  estimated_period_lead_days INTEGER NOT NULL DEFAULT 2 CHECK (estimated_period_lead_days IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_reminder_preferences_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_reminder_prefs_user ON public.reminder_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_prefs_master ON public.reminder_preferences (master_enabled);
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can view their own reminder preferences" ON public.reminder_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can insert their own reminder preferences" ON public.reminder_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can update their own reminder preferences" ON public.reminder_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can delete their own reminder preferences" ON public.reminder_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_reminder_preferences_updated ON public.reminder_preferences;
CREATE TRIGGER on_reminder_preferences_updated BEFORE UPDATE ON public.reminder_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_push_subscriptions_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON public.push_subscriptions (user_id, is_active);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_push_subscriptions_updated ON public.push_subscriptions;
CREATE TRIGGER on_push_subscriptions_updated BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.reminder_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('wellness', 'period_logging', 'estimated_period')),
  delivery_channel TEXT NOT NULL CHECK (delivery_channel IN ('push', 'in_app')),
  scheduled_for_date DATE NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'suppressed', 'dismissed')),
  CONSTRAINT uq_reminder_delivery UNIQUE (user_id, reminder_type, scheduled_for_date, delivery_channel)
);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_date ON public.reminder_delivery_logs (user_id, scheduled_for_date);
ALTER TABLE public.reminder_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminder delivery logs" ON public.reminder_delivery_logs;
CREATE POLICY "Users can view their own reminder delivery logs" ON public.reminder_delivery_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own reminder delivery logs" ON public.reminder_delivery_logs;
CREATE POLICY "Users can insert their own reminder delivery logs" ON public.reminder_delivery_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own reminder delivery logs" ON public.reminder_delivery_logs;
CREATE POLICY "Users can update their own reminder delivery logs" ON public.reminder_delivery_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

