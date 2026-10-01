# Oviare — Understand your rhythm.

> An intentional, calm, and private reproductive health and menstrual cycle tracking web application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Supabase.

---

## 1. Project Overview

Oviare provides a calm, scientific, and privacy-respecting cycle tracking sanctuary.

### Core Principles
- **Restrained Visual Identity**: Warm ivory surfaces (`#F7F4F0`), soft mauve accents (`#E8DFEA`), deep sage details (`#3F5148`), and muted plum focal elements (`#76566F`). Zero RGB neon glows or decorative saturation.
- **Privacy & Least-Privilege Architecture**: In Phase 2, real user authentication is powered by Supabase Auth with Row Level Security (RLS) policies enforcing that users can only read and write their own profile records.
- **Medical & Privacy Boundaries**: Oviare is an informational cycle awareness tool, not a diagnostic or contraceptive device. Estimations and predictions are clearly labeled as algorithmic calculations.
- **Accessible, Semantic UI**: Clean keyboard navigation, focus rings, accessible form inputs, and responsive layout across desktop and mobile screens.

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict mode enabled)
- **Backend & Auth**: Supabase (Supabase Auth, PostgreSQL, `@supabase/ssr`, Row Level Security)
- **Styling**: Tailwind CSS with custom design tokens for Oviare
- **Icons**: Lucide React (semantic SVG icons, no emoji controls)
- **Data Visualization**: Recharts (rhythm variance & symptom distribution models)
- **Deployment Target**: Vercel

---

## 3. Project Structure

```
oviare/
├── supabase/
│   └── migrations/             # SQL schema and RLS policies
│       └── 20261001_profiles_schema.sql
├── src/
│   ├── app/                    # Next.js App Router routes & layout
│   │   ├── auth/
│   │   │   ├── callback/       # Server route handler exchanging code for session
│   │   │   ├── login/          # Redirect to /login
│   │   │   ├── signup/         # Redirect to /signup
│   │   │   └── verify-email/   # Check inbox & resend verification instructions
│   │   ├── calendar/           # Monthly interactive calendar screen (Protected)
│   │   ├── dashboard/          # Primary overview, rhythm status (Protected)
│   │   ├── forgot-password/    # Password recovery request screen
│   │   ├── insights/           # Recharts cycle variance & symptoms (Protected)
│   │   ├── log/                # Daily symptom & physical sensations logging (Protected)
│   │   ├── login/              # Email & password sign in screen
│   │   ├── onboarding/         # New member setup (Display name, DOB, Timezone)
│   │   ├── profile/            # Profile settings, preferences, and security (Protected)
│   │   ├── reset-password/     # Password update screen with recovery session check
│   │   ├── signup/             # Member registration screen
│   │   ├── globals.css         # Custom tokens, scrollbar styling, and base resets
│   │   ├── layout.tsx          # Root layout with AuthProvider & CycleDataProvider
│   │   └── page.tsx            # Root redirect to /dashboard
│   ├── components/
│   │   ├── brand/              # Original flowing SVG logo mark & medical disclaimer
│   │   │   ├── Logo.tsx
│   │   │   └── MedicalDisclaimerBadge.tsx
│   │   ├── layout/             # Responsive desktop sidebar & mobile navigation
│   │   │   ├── AppShell.tsx    # Shell providing sidebar or focused auth layout
│   │   │   ├── MobileHeader.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/                 # Reusable atomic design components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── dashboard/          # Cycle ring, 7-day strip, wellness, reminders, educational
│   │   ├── calendar/           # Monthly view, day cells, details modal, legend
│   │   ├── log/                # Flow, symptom, mood, sleep/energy selector controls
│   │   ├── insights/           # Cycle length & symptom distribution charts
│   │   └── profile/            # Authenticated profile editing, security, and export
│   ├── context/
│   │   ├── AuthContext.tsx     # Supabase Auth user, session, and profile provider
│   │   └── CycleDataContext.tsx# Session-level state, sample toggle, and toasts
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client singleton
│   │       ├── server.ts       # Server Supabase client with Next.js cookies
│   │       ├── middleware.ts   # Session refresher and protected route guard
│   │       └── profile.ts      # Typed profile retrieval, upsert, and update
│   ├── middleware.ts           # Next.js root middleware
│   └── types/
│       └── index.ts            # Strict TS types for cycle logs, profiles, and settings
├── .env.example                # Example environment variables (placeholders only)
├── .env.local                  # Local secrets (excluded via .gitignore)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 4. Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Security Note:** Never commit `.env.local` to git. Ensure it is listed in `.gitignore`.

---

## 5. Supabase Database Schema & RLS

The `profiles` table stores member metadata linked directly to `auth.users(id)`:

- `id`: UUID Primary Key (`references auth.users(id) ON DELETE CASCADE`)
- `display_name`: Nullable Text
- `date_of_birth`: Nullable Date
- `language`: Nullable Text (Default: `'en'`)
- `timezone`: Nullable Text (Default: `'UTC'`)
- `onboarding_completed`: Boolean (Default: `FALSE`)
- `created_at`: Timestamptz (Default: `now()`)
- `updated_at`: Timestamptz (Default: `now()`)

### Row Level Security Policies
Row Level Security is enabled on `public.profiles`:
1. **SELECT**: `auth.uid() = id` (Users can only read their own profile).
2. **INSERT**: `auth.uid() = id` (Users can only insert their own profile record).
3. **UPDATE**: `auth.uid() = id` (Users can only update their own profile).

SQL migration file is available at `supabase/migrations/20261001_profiles_schema.sql`.

---

## 6. Authentication Flows

1. **Registration (`/signup`)**:
   - Collects preferred display name, email, password, and confirmation.
   - Enforces minimum 8 characters and password confirmation equality.
   - Automatically handles email verification requirement by redirecting to `/auth/verify-email`.
2. **Email Verification (`/auth/verify-email` & `/auth/callback`)**:
   - Informs member to confirm their email address with resend capability.
   - Route handler `/auth/callback` exchanges the auth code for a session, ensures profile existence, and routes to `/onboarding`.
3. **Sign In (`/login`)**:
   - Email/password authentication with safe error handling and loading indicators.
   - Post-login redirect to requested protected route or onboarding.
4. **Password Recovery (`/forgot-password` & `/reset-password`)**:
   - Email-based password reset without account enumeration leaks.
   - Validates active recovery session before permitting new password submission.
5. **Sign Out (`signOut`)**:
   - Invalidates Supabase Auth session, clears cookies, resets React state, and redirects to `/login`.
6. **Protected Route Guarding (`src/middleware.ts`)**:
   - Intercepts requests to `/dashboard`, `/calendar`, `/log`, `/insights`, `/profile`, and `/onboarding`.
   - Unauthenticated requests are redirected with a `307` to `/login?redirect=...`.
   - Users with incomplete onboarding are directed to `/onboarding`.
   - Authenticated users visiting `/login` or `/signup` are redirected to `/dashboard`.

---

## 7. Setup & Development Commands

```powershell
# 1. Install dependencies
npm install

# 2. Run TypeScript type checking
npm run typecheck

# 3. Create optimized production build
npm run build

# 4. Start production server
npm run start
# Local server runs at http://localhost:3000

# 5. Start development server
npm run dev
```

---

## 8. Current Limitations (Phase 2 Boundary)

1. **Cycle Tracking Persistence**: In accordance with Phase 2 scope, daily health check-ins (flow, symptoms, mood, sleep) remain stored in temporary client-side session state (`CycleDataContext`). Persistent PostgreSQL storage for cycle records is scheduled for Phase 3.
2. **Cycle Predictions**: Future ovulation and period dates are clearly labeled algorithmic sample estimates based on standard 28-day baseline cycles.
