# Oviare — Understand your rhythm.

> An intentional, calm, and private reproductive health and menstrual cycle tracking web application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Supabase.

---

## 1. Project Overview

Oviare provides a calm, scientific, and privacy-respecting cycle tracking sanctuary.

### Core Principles
- **Restrained Visual Identity**: Warm ivory surfaces (`#F7F4F0`), soft mauve accents (`#E8DFEA`), deep sage details (`#3F5148`), and muted plum focal elements (`#76566F`). Zero RGB neon glows or decorative saturation.
- **Privacy & Least-Privilege Architecture**: User authentication is powered by Supabase Auth with Row Level Security (RLS) policies enforcing that members can only read, insert, update, and delete their own cycle and profile records.
- **Pure Mathematical Calculations**: Period cycle lengths are strictly defined and computed between consecutive period start dates using UTC calendar date arithmetic. All predictions are transparent, rolling-average estimates with variability metrics.
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
- **Testing**: Node.js test runner (`tsx --test`) for the pure cycle calculations engine
- **Deployment Target**: Vercel

---

## 3. Project Structure

```
oviare/
├── supabase/
│   └── migrations/
│       ├── 20261001_profiles_schema.sql       # User profiles table & RLS
│       └── 20261001_cycle_records_schema.sql  # Cycle records table & RLS (Phase 3)
├── src/
│   ├── app/                                   # Next.js App Router routes & layout
│   │   ├── auth/
│   │   │   ├── callback/                      # Server route handler exchanging code for session
│   │   │   ├── login/                         # Redirect to /login
│   │   │   ├── signup/                        # Redirect to /signup
│   │   │   └── verify-email/                  # Check inbox & resend verification instructions
│   │   ├── calendar/                          # Monthly calendar & cycle history table (Protected)
│   │   ├── dashboard/                         # Rhythm ring, status, countdown (Protected)
│   │   ├── forgot-password/                   # Password recovery request screen
│   │   ├── insights/                          # Recharts cycle variance & stats (Protected)
│   │   ├── log/                               # Daily symptom logging & period log trigger (Protected)
│   │   ├── login/                             # Email & password sign in screen
│   │   ├── onboarding/                        # New member setup (Display name, DOB, Timezone)
│   │   ├── profile/                           # Profile settings, preferences, and security (Protected)
│   │   ├── reset-password/                    # Password update screen with recovery session check
│   │   ├── signup/                            # Member registration screen
│   │   ├── globals.css                        # Custom tokens, scrollbar styling, and base resets
│   │   ├── layout.tsx                         # Root layout with AuthProvider & CycleDataProvider
│   │   └── page.tsx                           # Root redirect to /dashboard
│   ├── components/
│   │   ├── brand/                             # Original flowing SVG logo mark & medical disclaimer
│   │   │   ├── Logo.tsx
│   │   │   └── MedicalDisclaimerBadge.tsx
│   │   ├── layout/                            # Responsive desktop sidebar & mobile navigation
│   │   │   ├── AppShell.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/                                # Reusable atomic design components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── cycle/                             # Phase 3 Cycle Tracking Components
│   │   │   ├── PeriodLogModal.tsx             # Modal to add/edit period start, end, flow, notes
│   │   │   ├── DeleteRecordModal.tsx          # Confirmation modal for record deletion
│   │   │   └── CycleHistoryTable.tsx          # Table of recorded periods, durations, intervals
│   │   ├── dashboard/                         # Cycle ring, 7-day strip, wellness, reminders
│   │   ├── calendar/                          # Monthly view, day cells, details modal, legend
│   │   ├── log/                               # Daily flow, symptom, mood, sleep/energy selectors
│   │   ├── insights/                          # Cycle length & symptom distribution charts
│   │   └── profile/                           # Authenticated profile editing, security, and export
│   ├── context/
│   │   ├── AuthContext.tsx                    # Supabase Auth user, session, and profile provider
│   │   └── CycleDataContext.tsx               # Cycle engine state, Supabase sync, sample toggle
│   ├── lib/
│   │   ├── cycle/
│   │   │   ├── calculations.ts                # Pure TypeScript Cycle Calculation Engine
│   │   │   └── __tests__/
│   │   │       └── calculations.test.ts       # 17 Unit test suites for date math & edge cases
│   │   └── supabase/
│   │       ├── client.ts                      # Browser Supabase client singleton
│   │       ├── server.ts                      # Server Supabase client with Next.js cookies
│   │       ├── middleware.ts                  # Session refresher and protected route guard
│   │       ├── profile.ts                     # Profile retrieval, upsert, and update
│   │       └── cycles.ts                      # Supabase CRUD service for cycle_records table
│   ├── middleware.ts                          # Next.js root middleware
│   └── types/
│       └── index.ts                           # Strict TS types for cycle logs, records, profiles
├── .env.example                               # Example environment variables (placeholders only)
├── .env.local                                 # Local secrets (excluded via .gitignore)
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

## 5. Supabase Database Schema & Row Level Security (RLS)

### `public.profiles` Table
Stores member metadata linked directly to `auth.users(id)`:
- `id`: UUID Primary Key (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `display_name`: Nullable Text
- `date_of_birth`: Nullable Date
- `language`: Nullable Text (Default: `'en'`)
- `timezone`: Nullable Text (Default: `'UTC'`)
- `onboarding_completed`: Boolean (Default: `FALSE`)
- `created_at`: Timestamptz (Default: `now()`)
- `updated_at`: Timestamptz (Default: `now()`)

RLS Policies:
- **SELECT**: `auth.uid() = id`
- **INSERT**: `auth.uid() = id`
- **UPDATE**: `auth.uid() = id`

SQL migration file: `supabase/migrations/20261001_profiles_schema.sql`.

### `public.cycle_records` Table (Phase 3)
Stores menstrual period logs for each user:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `period_start`: DATE NOT NULL
- `period_end`: DATE NULL (null indicates an ongoing period)
- `flow_intensity`: TEXT NULL (`CHECK (flow_intensity IN ('light', 'medium', 'heavy', 'spotting'))`)
- `notes`: TEXT NULL
- `created_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- `updated_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- **Constraints**:
  - `CHECK (period_end IS NULL OR period_end >= period_start)`
  - Index on `(user_id, period_start DESC)` for fast chronological querying

RLS Policies:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

SQL migration file: `supabase/migrations/20261001_cycle_records_schema.sql`.

---

## 6. Cycle Calculations Engine

Located at `src/lib/cycle/calculations.ts`, the engine is a pure, independent, zero-dependency TypeScript calculation module:

### Rules & Methodologies
1. **UTC Calendar Arithmetic**: All dates are handled as ISO strings (`YYYY-MM-DD`) and parsed strictly into UTC (`Date.UTC`) to eliminate local midnight timezone shifts and daylight savings bugs.
2. **Cycle Length Definition**: Calculated exclusively as the difference in calendar days between **consecutive period start dates** ($Start_{n+1} - Start_n$).
3. **Period Duration**: Calculated as $(End - Start) + 1$ days. If ongoing (`period_end === null`), duration is labeled as "Ongoing" or "In progress".
4. **Physiological Filtering**: Only cycle lengths between 18 and 60 days are included in statistical averages to filter out outlier anomalies or unrecorded gaps.
5. **Rolling 6-Cycle Window**: Computes rolling arithmetic mean and sample standard deviation ($\sigma$) over up to the 6 most recent completed cycle intervals.
6. **Graceful Insufficient-Data States**:
   - **0 periods**: Returns empty state, guides user to log first period start.
   - **1 period**: Computes current cycle day from that start date; provides a transparent 28-day baseline next-period estimate clearly labeled: *"Estimated using standard 28-day baseline from your latest logged period. Log 2+ periods to personalize."*
   - **2+ periods**: Computes personal rolling average, confidence score, and standard deviation variability ($\pm X$ days).
7. **Date Conflict & Overlap Validation**: Prevents duplicate start dates and invalid overlapping period ranges.

### Unit Tests
Run unit tests with:
```powershell
npx.cmd tsx --test src/lib/cycle/__tests__/calculations.test.ts
```
All 17 test suites cover month boundaries, leap years (February 2024 vs 2025), missing end dates, rolling windows, and data quality states.

---

## 7. Supabase Auth Rate-Limit Troubleshooting

### Symptom
`AuthApiError: email rate limit exceeded` during registration (`/signup`) or password recovery (`/forgot-password`).

### Root Cause
Supabase projects on the free tier utilize a shared built-in SMTP provider that enforces an hourly quota of **3–4 emails per hour**. In development, consecutive test signups rapidly exhaust this limit.

### Solutions
1. **For Local Development & Testing (Recommended)**:
   - Go to your **Supabase Dashboard** → **Authentication** → **Providers** → **Email**.
   - Set **"Confirm email"** to **OFF** (Disabled).
   - In **Authentication** → **Email Templates**, uncheck confirmation emails.
   - New accounts will be confirmed immediately upon sign up (`session: true`), avoiding outgoing emails entirely and completely bypassing the rate limit.
2. **For Production**:
   - In Supabase Dashboard → **Project Settings** → **Authentication** → **SMTP Settings**.
   - Toggle **"Enable Custom SMTP"** to **ON**.
   - Enter credentials for a dedicated transactional email service such as **Resend**, **SendGrid**, or **AWS SES**.
   - Custom SMTP eliminates Supabase's default 3–4 emails/hr quota and supports thousands of emails/day.

---

## 8. Setup & Development Commands

```powershell
# 1. Install dependencies
npm install

# 2. Run unit tests for cycle calculations
npx.cmd tsx --test src/lib/cycle/__tests__/calculations.test.ts

# 3. Run TypeScript type checking
npm run typecheck

# 4. Create optimized production build
npm run build

# 5. Start production server
npm run start
# Local server runs at http://localhost:3000

# 6. Start development server
npm run dev
```

---

## 9. Current Status & Phase Scope

- **Phase 1 (Completed)**: UI design foundation, responsive AppShell, design tokens, navigation, mock views.
- **Phase 2 (Completed)**: Supabase Auth integration, session management, onboarding, RLS-protected user profiles, security headers.
- **Phase 3 (Completed)**: Persistent period logging, cycle calculations engine, 17 unit test suites, dynamic dashboard cycle ring & countdown, calendar month view with recorded/predicted periods, cycle history table with edit/delete confirmation, rate-limit troubleshooting.
- **Phase 4 (Future Scope)**: Persistent multi-symptom daily check-in tables, encrypted notes, exportable PDF health reports.
