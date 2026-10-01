import type { SupabaseClient } from '@supabase/supabase-js';
import { DailyLogRecord, DailySymptom, UpsertDailyLogInput } from '@/types';

/**
 * Fetch all daily wellness logs for a user, ordered by date descending,
 * including associated symptoms.
 */
export async function getDailyLogs(
  supabase: SupabaseClient,
  userId: string
): Promise<DailyLogRecord[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      id,
      user_id,
      log_date,
      moods,
      sleep_duration_minutes,
      sleep_quality,
      energy_level,
      intimacy_logged,
      intimacy_notes,
      notes,
      created_at,
      updated_at,
      daily_symptoms (
        id,
        daily_log_id,
        user_id,
        symptom_name,
        severity,
        notes,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('log_date', { ascending: false });

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      console.warn('Table public.daily_logs does not exist yet. Please run migration 20261001_daily_wellness_schema.sql in Supabase SQL editor.');
      return [];
    }
    console.error('Error fetching daily logs:', error.message);
    throw new Error(error.message || 'Failed to fetch daily logs');
  }

  // Format nested daily_symptoms into symptoms property
  return (data || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    log_date: row.log_date,
    moods: row.moods || [],
    sleep_duration_minutes: row.sleep_duration_minutes,
    sleep_quality: row.sleep_quality,
    energy_level: row.energy_level,
    intimacy_logged: Boolean(row.intimacy_logged),
    intimacy_notes: row.intimacy_notes,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    symptoms: row.daily_symptoms || [],
  })) as DailyLogRecord[];
}

/**
 * Fetch a single daily log for a specific date, including symptoms.
 */
export async function getDailyLogForDate(
  supabase: SupabaseClient,
  userId: string,
  dateStr: string
): Promise<DailyLogRecord | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      id,
      user_id,
      log_date,
      moods,
      sleep_duration_minutes,
      sleep_quality,
      energy_level,
      intimacy_logged,
      intimacy_notes,
      notes,
      created_at,
      updated_at,
      daily_symptoms (
        id,
        daily_log_id,
        user_id,
        symptom_name,
        severity,
        notes,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .eq('log_date', dateStr)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      return null;
    }
    console.error('Error fetching daily log for date:', error.message);
    throw new Error(error.message || 'Failed to fetch daily log');
  }

  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    log_date: data.log_date,
    moods: data.moods || [],
    sleep_duration_minutes: data.sleep_duration_minutes,
    sleep_quality: data.sleep_quality,
    energy_level: data.energy_level,
    intimacy_logged: Boolean(data.intimacy_logged),
    intimacy_notes: data.intimacy_notes,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    symptoms: (data as any).daily_symptoms || [],
  };
}

/**
 * Upsert a daily wellness log (insert or update on user_id, log_date conflict)
 * and sync its symptoms.
 */
export async function upsertDailyLog(
  supabase: SupabaseClient,
  userId: string,
  input: UpsertDailyLogInput
): Promise<DailyLogRecord> {
  const logPayload = {
    user_id: userId,
    log_date: input.log_date,
    moods: input.moods || [],
    sleep_duration_minutes: input.sleep_duration_minutes !== undefined ? input.sleep_duration_minutes : null,
    sleep_quality: input.sleep_quality || null,
    energy_level: input.energy_level !== undefined ? input.energy_level : null,
    intimacy_logged: Boolean(input.intimacy_logged),
    intimacy_notes: input.intimacy_notes?.trim() || null,
    notes: input.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  // 1. Upsert daily_logs row
  const { data: logData, error: logError } = await supabase
    .from('daily_logs')
    .upsert(logPayload, { onConflict: 'user_id,log_date' })
    .select()
    .single();

  if (logError) {
    console.error('Error saving daily log:', logError.message);
    throw new Error(logError.message || 'Failed to save daily log');
  }

  const logId = logData.id;

  // 2. Synchronize symptoms
  // Delete existing symptoms for this log
  const { error: deleteSympError } = await supabase
    .from('daily_symptoms')
    .delete()
    .eq('daily_log_id', logId)
    .eq('user_id', userId);

  if (deleteSympError) {
    console.warn('Error clearing previous symptoms:', deleteSympError.message);
  }

  // Insert new symptoms if any
  let insertedSymptoms: DailySymptom[] = [];
  if (input.symptoms && input.symptoms.length > 0) {
    const sympRows = input.symptoms.map((s) => ({
      daily_log_id: logId,
      user_id: userId,
      symptom_name: s.symptom_name,
      severity: s.severity,
      notes: s.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: sympData, error: insertSympError } = await supabase
      .from('daily_symptoms')
      .insert(sympRows)
      .select();

    if (insertSympError) {
      console.error('Error saving symptoms:', insertSympError.message);
    } else {
      insertedSymptoms = (sympData || []) as DailySymptom[];
    }
  }

  return {
    ...logData,
    symptoms: insertedSymptoms,
  };
}

/**
 * Delete a daily log entry and its symptoms.
 */
export async function deleteDailyLog(
  supabase: SupabaseClient,
  userId: string,
  logId: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting daily log:', error.message);
    throw new Error(error.message || 'Failed to delete daily log');
  }
}

/**
 * Get user custom symptoms
 */
export async function getCustomSymptoms(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('custom_symptoms')
    .select('symptom_name')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return (data || []).map((row: any) => row.symptom_name);
}

/**
 * Add a custom symptom for user
 */
export async function addCustomSymptom(
  supabase: SupabaseClient,
  userId: string,
  symptomName: string
): Promise<void> {
  await supabase.from('custom_symptoms').insert({
    user_id: userId,
    symptom_name: symptomName.trim().toLowerCase(),
    created_at: new Date().toISOString(),
  });
}
