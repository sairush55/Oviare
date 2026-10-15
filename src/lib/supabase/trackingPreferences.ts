import type { SupabaseClient } from '@supabase/supabase-js';
import { UserTrackingPreferences, UpdateUserTrackingPreferencesInput } from '@/types';

export const DEFAULT_TRACKING_PREFERENCES: UserTrackingPreferences = {
  symptoms_enabled: true,
  mood_enabled: true,
  sleep_enabled: true,
  energy_enabled: true,
  notes_enabled: true,
  intimacy_enabled: false,
};

/**
 * Fetch the authenticated user's tracking preferences from Supabase PostgreSQL.
 * If no record exists, returns standard defaults.
 */
export async function getTrackingPreferences(
  supabase: SupabaseClient,
  userId: string
): Promise<UserTrackingPreferences> {
  const { data, error } = await supabase
    .from('user_tracking_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // If table doesn't exist yet, return safe defaults
    if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
      return { ...DEFAULT_TRACKING_PREFERENCES, user_id: userId };
    }
    console.error('Error fetching user tracking preferences:', error.message);
    return { ...DEFAULT_TRACKING_PREFERENCES, user_id: userId };
  }

  if (!data) {
    return { ...DEFAULT_TRACKING_PREFERENCES, user_id: userId };
  }

  return {
    id: data.id,
    user_id: data.user_id,
    symptoms_enabled: Boolean(data.symptoms_enabled),
    mood_enabled: Boolean(data.mood_enabled),
    sleep_enabled: Boolean(data.sleep_enabled),
    energy_enabled: Boolean(data.energy_enabled),
    notes_enabled: Boolean(data.notes_enabled),
    intimacy_enabled: Boolean(data.intimacy_enabled),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Upsert tracking preferences for the authenticated user.
 */
export async function upsertTrackingPreferences(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateUserTrackingPreferencesInput
): Promise<UserTrackingPreferences> {
  const payload = {
    user_id: userId,
    symptoms_enabled: input.symptoms_enabled ?? DEFAULT_TRACKING_PREFERENCES.symptoms_enabled,
    mood_enabled: input.mood_enabled ?? DEFAULT_TRACKING_PREFERENCES.mood_enabled,
    sleep_enabled: input.sleep_enabled ?? DEFAULT_TRACKING_PREFERENCES.sleep_enabled,
    energy_enabled: input.energy_enabled ?? DEFAULT_TRACKING_PREFERENCES.energy_enabled,
    notes_enabled: input.notes_enabled ?? DEFAULT_TRACKING_PREFERENCES.notes_enabled,
    intimacy_enabled: input.intimacy_enabled ?? DEFAULT_TRACKING_PREFERENCES.intimacy_enabled,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_tracking_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving tracking preferences:', error.message);
    throw new Error(error.message || 'Failed to save tracking preferences');
  }

  return {
    id: data.id,
    user_id: data.user_id,
    symptoms_enabled: Boolean(data.symptoms_enabled),
    mood_enabled: Boolean(data.mood_enabled),
    sleep_enabled: Boolean(data.sleep_enabled),
    energy_enabled: Boolean(data.energy_enabled),
    notes_enabled: Boolean(data.notes_enabled),
    intimacy_enabled: Boolean(data.intimacy_enabled),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
