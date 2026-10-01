import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile, getProfile } from '@/lib/supabase/profile';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile exists in database
      try {
        const profile = await getProfile(supabase, data.user.id);
        if (!profile) {
          await ensureProfile(supabase, data.user);
        }

        // If explicit next destination was specified (e.g. /reset-password)
        if (next) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Check if onboarding was completed
        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        return NextResponse.redirect(`${origin}/dashboard`);
      } catch (profileErr) {
        console.error('Error handling profile in auth callback:', profileErr);
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    } else if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Verification link was invalid or has expired.')}`
      );
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/login`);
}
