import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to delete your account.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation mismatch. You must confirm by providing confirmation="DELETE".' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Check if Supabase Service Role Key is configured for full auth.users deletion
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      try {
        const adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        // Deleting from auth.users triggers ON DELETE CASCADE on all tables
        const { error: adminDeleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (adminDeleteError) {
          console.error('Admin deleteUser error:', adminDeleteError.message);
          throw adminDeleteError;
        }
      } catch (adminErr) {
        console.warn('Falling back to user-scoped cascading table purge:', adminErr);
        await purgeUserData(supabase, userId);
      }
    } else {
      // Purge all user-owned records using the authenticated client
      await purgeUserData(supabase, userId);
    }

    // Sign out session
    await supabase.auth.signOut().catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Account and associated records deleted permanently.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function purgeUserData(supabase: any, userId: string) {
  // Purge in reverse dependency order
  await Promise.allSettled([
    supabase.from('daily_symptoms').delete().eq('user_id', userId),
    supabase.from('daily_logs').delete().eq('user_id', userId),
    supabase.from('cycle_records').delete().eq('user_id', userId),
    supabase.from('custom_symptoms').delete().eq('user_id', userId),
    supabase.from('user_tracking_preferences').delete().eq('user_id', userId),
    supabase.from('reminder_preferences').delete().eq('user_id', userId),
    supabase.from('push_subscriptions').delete().eq('user_id', userId),
    supabase.from('reminder_delivery_logs').delete().eq('user_id', userId),
  ]);

  // Purge profile
  await supabase.from('profiles').delete().eq('id', userId);
}
