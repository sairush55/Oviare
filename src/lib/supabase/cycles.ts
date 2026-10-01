import type { SupabaseClient } from '@supabase/supabase-js';
import { CycleRecord, CreateCycleRecordInput, UpdateCycleRecordInput } from '@/types';
import { validatePeriodDates } from '@/lib/cycle/calculations';

/**
 * Fetch all cycle/period records for a user, ordered by period_start ascending.
 */
export async function getCycleRecords(
  supabase: SupabaseClient,
  userId: string
): Promise<CycleRecord[]> {
  const { data, error } = await supabase
    .from('cycle_records')
    .select('id, user_id, period_start, period_end, flow_intensity, notes, created_at, updated_at')
    .eq('user_id', userId)
    .order('period_start', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      console.warn('Table public.cycle_records does not exist yet. Please run migration 20261001_cycle_records_schema.sql in Supabase SQL editor.');
      return [];
    }
    console.error('Error fetching cycle records:', error.message);
    throw new Error(error.message || 'Failed to fetch cycle records');
  }

  return (data || []) as CycleRecord[];
}

/**
 * Insert a new period log record with validation.
 */
export async function createCycleRecord(
  supabase: SupabaseClient,
  input: CreateCycleRecordInput
): Promise<CycleRecord> {
  const validation = validatePeriodDates(input.period_start, input.period_end);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid period dates');
  }

  const payload = {
    user_id: input.user_id,
    period_start: input.period_start,
    period_end: input.period_end || null,
    flow_intensity: input.flow_intensity || null,
    notes: input.notes?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cycle_records')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating cycle record:', error.message);
    throw new Error(error.message || 'Failed to save cycle record');
  }

  return data as CycleRecord;
}

/**
 * Update an existing period record.
 */
export async function updateCycleRecord(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  updates: UpdateCycleRecordInput
): Promise<CycleRecord> {
  if (updates.period_start) {
    const validation = validatePeriodDates(updates.period_start, updates.period_end ?? null);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid period dates');
    }
  }

  const payload = {
    ...updates,
    period_end: updates.period_end === undefined ? undefined : (updates.period_end || null),
    notes: updates.notes === undefined ? undefined : (updates.notes?.trim() || null),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cycle_records')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating cycle record:', error.message);
    throw new Error(error.message || 'Failed to update cycle record');
  }

  return data as CycleRecord;
}

/**
 * Delete a period record.
 */
export async function deleteCycleRecord(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('cycle_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting cycle record:', error.message);
    throw new Error(error.message || 'Failed to delete cycle record');
  }
}
