-- Oviare Phase 3: Cycle Records Table & Row Level Security (RLS) Migration
-- Target Database: Supabase PostgreSQL

-- 1. Create cycle_records table
CREATE TABLE IF NOT EXISTS public.cycle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NULL,
  flow_intensity TEXT NULL CHECK (flow_intensity IS NULL OR flow_intensity IN ('light', 'medium', 'heavy', 'spotting')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Constraint: If period_end is provided, it must be on or after period_start
  CONSTRAINT period_end_after_start CHECK (period_end IS NULL OR period_end >= period_start)
);

-- 2. Indexes for efficient user-based and date-ordered queries
CREATE INDEX IF NOT EXISTS idx_cycle_records_user_start 
  ON public.cycle_records (user_id, period_start DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.cycle_records ENABLE ROW LEVEL SECURITY;

-- 4. Row Level Security Policies
-- Policy A: Authenticated users can view only their own records
CREATE POLICY "Users can view their own cycle records"
  ON public.cycle_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy B: Authenticated users can insert their own records
CREATE POLICY "Users can insert their own cycle records"
  ON public.cycle_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy C: Authenticated users can update their own records
CREATE POLICY "Users can update their own cycle records"
  ON public.cycle_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy D: Authenticated users can delete their own records
CREATE POLICY "Users can delete their own cycle records"
  ON public.cycle_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Updated_at trigger helper function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger execution on cycle_records
DROP TRIGGER IF EXISTS on_cycle_records_updated ON public.cycle_records;
CREATE TRIGGER on_cycle_records_updated
  BEFORE UPDATE ON public.cycle_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
