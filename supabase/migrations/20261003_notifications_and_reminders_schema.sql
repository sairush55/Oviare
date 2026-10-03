-- ==============================================================================
-- OVIARE: ADDITIONAL PHASE 4 - MOBILE NOTIFICATIONS & SMART REMINDERS SCHEMA
-- Target Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Helper function for updated_at (ensure exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Reminder Preferences Table
-- Stores user-specific reminder configurations, preferred local time, and category toggles.
CREATE TABLE IF NOT EXISTS public.reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  wellness_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  period_logging_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_period_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_time TEXT NOT NULL DEFAULT '20:00', -- Format: 'HH:mm' in 24hr format
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
CREATE POLICY "Users can view their own reminder preferences"
  ON public.reminder_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can insert their own reminder preferences"
  ON public.reminder_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can update their own reminder preferences"
  ON public.reminder_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminder preferences" ON public.reminder_preferences;
CREATE POLICY "Users can delete their own reminder preferences"
  ON public.reminder_preferences FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_reminder_preferences_updated ON public.reminder_preferences;
CREATE TRIGGER on_reminder_preferences_updated
  BEFORE UPDATE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Web Push Subscriptions Table
-- Stores browser Web Push endpoints and public cryptographic keys for authenticated users.
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
CREATE POLICY "Users can view their own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert their own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_push_subscriptions_updated ON public.push_subscriptions;
CREATE TRIGGER on_push_subscriptions_updated
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Reminder Delivery Logs Table
-- Idempotency tracking to prevent duplicate notification delivery on the same calendar day.
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
CREATE POLICY "Users can view their own reminder delivery logs"
  ON public.reminder_delivery_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reminder delivery logs" ON public.reminder_delivery_logs;
CREATE POLICY "Users can insert their own reminder delivery logs"
  ON public.reminder_delivery_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminder delivery logs" ON public.reminder_delivery_logs;
CREATE POLICY "Users can update their own reminder delivery logs"
  ON public.reminder_delivery_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
