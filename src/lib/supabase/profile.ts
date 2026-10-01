import type { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, date_of_birth, language, timezone, onboarding_completed, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    throw new Error('Failed to load user profile');
  }

  return data as UserProfile | null;
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string; user_metadata?: { display_name?: string; full_name?: string } }
): Promise<UserProfile> {
  const existing = await getProfile(supabase, user.id);
  if (existing) {
    return existing;
  }

  const defaultDisplayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    (user.email ? user.email.split('@')[0] : 'Member');

  const newProfile = {
    id: user.id,
    display_name: defaultDisplayName,
    date_of_birth: null,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    onboarding_completed: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error.message);
    // If conflict occurred because profile was created simultaneously, retrieve it
    const fallback = await getProfile(supabase, user.id);
    if (fallback) return fallback;
    throw new Error('Could not create profile record.');
  }

  return data as UserProfile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<UserProfile> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error.message);
    throw new Error(error.message || 'Failed to update profile');
  }

  return data as UserProfile;
}
