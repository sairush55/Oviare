import { SupabaseClient } from '@supabase/supabase-js';
import {
  ReminderPreferences,
  UpdateReminderPreferencesInput,
  PushSubscriptionRecord,
  CreatePushSubscriptionInput,
  ReminderType,
  ReminderChannel,
} from '@/types';

export const DEFAULT_REMINDER_PREFERENCES: Omit<ReminderPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  master_enabled: false,
  wellness_reminder_enabled: false,
  period_logging_reminder_enabled: false,
  estimated_period_reminder_enabled: false,
  preferred_time: '20:00',
  timezone: 'UTC',
  estimated_period_lead_days: 2,
};

/**
 * Retrieves the user's saved reminder preferences with safe fallback
 */
export async function getReminderPreferences(
  supabase: SupabaseClient,
  userId: string
): Promise<ReminderPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      // PGRST205 indicates table does not exist yet (pre-migration)
      if (error.code === 'PGRST205') {
        console.warn('reminder_preferences table not found in schema cache. Returning null.');
        return null;
      }
      console.error('Error fetching reminder preferences:', error.message);
      return null;
    }

    return (data as ReminderPreferences) || null;
  } catch (err) {
    console.error('Unexpected error in getReminderPreferences:', err);
    return null;
  }
}

/**
 * Upserts user reminder preferences
 */
export async function upsertReminderPreferences(
  supabase: SupabaseClient,
  userId: string,
  updates: UpdateReminderPreferencesInput
): Promise<ReminderPreferences | null> {
  try {
    const payload = {
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reminder_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('reminder_preferences table not created yet in Supabase.');
        return null;
      }
      throw error;
    }

    return data as ReminderPreferences;
  } catch (err) {
    console.error('Failed to upsert reminder preferences:', err);
    throw err;
  }
}

/**
 * Saves or reactivates a Web Push subscription
 */
export async function savePushSubscription(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePushSubscriptionInput
): Promise<PushSubscriptionRecord | null> {
  try {
    const payload = {
      user_id: userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      is_active: true,
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'endpoint' })
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('push_subscriptions table not created yet in Supabase.');
        return null;
      }
      throw error;
    }

    return data as PushSubscriptionRecord;
  } catch (err) {
    console.error('Failed to save push subscription:', err);
    throw err;
  }
}

/**
 * Deactivates a push subscription for the user
 */
export async function deactivatePushSubscription(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error && error.code !== 'PGRST205') {
      console.error('Error deactivating push subscription:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error deactivating push subscription:', err);
  }
}

/**
 * Fetches all active push subscriptions for a user
 */
export async function getActivePushSubscriptions(
  supabase: SupabaseClient,
  userId: string
): Promise<PushSubscriptionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      if (error.code === 'PGRST205') return [];
      console.error('Error fetching push subscriptions:', error.message);
      return [];
    }

    return (data as PushSubscriptionRecord[]) || [];
  } catch (err) {
    console.error('Unexpected error in getActivePushSubscriptions:', err);
    return [];
  }
}

/**
 * Logs reminder delivery for idempotency
 */
export async function logReminderDelivery(
  supabase: SupabaseClient,
  log: {
    user_id: string;
    reminder_type: ReminderType;
    delivery_channel: ReminderChannel;
    scheduled_for_date: string;
    status: 'delivered' | 'failed' | 'suppressed' | 'dismissed';
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('reminder_delivery_logs')
      .upsert(
        {
          ...log,
          delivered_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,reminder_type,scheduled_for_date,delivery_channel' }
      );

    if (error && error.code !== 'PGRST205') {
      console.warn('Failed to log reminder delivery:', error.message);
    }
  } catch (err) {
    console.warn('Unexpected error logging reminder delivery:', err);
  }
}

/**
 * Checks if a reminder was already delivered today (idempotency check)
 */
export async function hasReminderBeenDelivered(
  supabase: SupabaseClient,
  userId: string,
  reminderType: ReminderType,
  dateStr: string,
  channel: ReminderChannel
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reminder_delivery_logs')
      .select('status')
      .eq('user_id', userId)
      .eq('reminder_type', reminderType)
      .eq('scheduled_for_date', dateStr)
      .eq('delivery_channel', channel)
      .maybeSingle();

    if (error || !data) return false;
    return data.status === 'delivered' || data.status === 'dismissed';
  } catch {
    return false;
  }
}
