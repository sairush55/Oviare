import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth'];
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const protectedRoutes = ['/dashboard', '/calendar', '/log', '/insights', '/profile'];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isOnboardingRoute = pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  const isDemoMode = request.cookies.get('oviare_demo_mode')?.value === 'true';

  // Case 1: Unauthenticated visitor
  if (!user) {
    // If in explicit Demo Mode, allow access to preview screens (dashboard, calendar, log, insights)
    // but disallow /profile and /onboarding which require a real authenticated account
    if (isDemoMode && isProtectedRoute && pathname !== '/profile') {
      return supabaseResponse;
    }

    if (isProtectedRoute || isOnboardingRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  // Clear demo cookie if an authenticated user session exists
  if (isDemoMode) {
    supabaseResponse.cookies.set('oviare_demo_mode', '', { path: '/', maxAge: 0 });
  }

  // Case 2: Authenticated user visiting public auth routes (login, signup, forgot-password)
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Case 3: Check onboarding status for authenticated user on protected or onboarding routes
  if (isProtectedRoute || isOnboardingRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      const onboardingCompleted = profile?.onboarding_completed ?? false;

      // If user hasn't completed onboarding and is trying to access protected routes
      if (!onboardingCompleted && isProtectedRoute) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // If user has completed onboarding and is trying to visit /onboarding
      if (onboardingCompleted && isOnboardingRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      // In case of transient database error, allow through to avoid blocking legitimate user
      console.error('Middleware profile lookup error:', err);
    }
  }

  return supabaseResponse;
}
