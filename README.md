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

### `public.daily_logs` Table (Phase 4)
Stores daily wellness entries (one record per user per date):
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `log_date`: DATE NOT NULL
- `moods`: TEXT[] NOT NULL (`DEFAULT '{}'`)
- `sleep_duration_minutes`: INTEGER NULL (`CHECK (sleep_duration_minutes IS NULL OR (sleep_duration_minutes >= 0 AND sleep_duration_minutes <= 1440))`)
- `sleep_quality`: TEXT NULL (`CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent'))`)
- `energy_level`: INTEGER NULL (`CHECK (energy_level >= 1 AND energy_level <= 5)`)
- `intimacy_logged`: BOOLEAN NOT NULL (`DEFAULT FALSE`)
- `intimacy_notes`: TEXT NULL
- `notes`: TEXT NULL
- `created_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- `updated_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- **Constraints**:
  - `UNIQUE (user_id, log_date)`
  - Index on `(user_id, log_date DESC)`

RLS Policies:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

### `public.daily_symptoms` Table (Phase 4)
Stores multi-symptom details linked to daily logs:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `daily_log_id`: UUID (`REFERENCES public.daily_logs(id) ON DELETE CASCADE`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `symptom_name`: TEXT NOT NULL
- `severity`: TEXT NOT NULL (`CHECK (severity IN ('mild', 'moderate', 'severe'))`)
- `notes`: TEXT NULL
- **Constraints**:
  - `UNIQUE (daily_log_id, symptom_name)`
  - Index on `(daily_log_id)` and `(user_id, symptom_name)`

RLS Policies:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

### `public.custom_symptoms` Table (Phase 4)
Stores user-defined custom symptoms:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `symptom_name`: TEXT NOT NULL
- **Constraints**:
  - `UNIQUE (user_id, symptom_name)`

RLS Policies:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

SQL migration file: `supabase/migrations/20261001_daily_wellness_schema.sql`.

---

## 6. Clean Accounts & Try Demo Isolation

### Real User Accounts (Clean by Default)
Newly registered user accounts are guaranteed to be 100% clean:
- **Zero Mock Records**: No sample period dates, symptom entries, or dummy moods are ever inserted into the database or assigned to user accounts.
- **Empty States**: New users are welcomed with educational, calm empty states and intuitive quick-action prompts ("Log your first period to start tracking", "No wellness check-ins logged yet").
- **Isolated Storage**: Real accounts interact strictly with Supabase PostgreSQL tables protected by Row Level Security.

### Try Demo Experience
Visitors can explore the full application without creating an account:
- **Entry Point**: Available directly on `/login` via the "Try Interactive Demo" button.
- **In-Memory Synthetic Data**: Populated with realistic fictional cycle records and daily check-ins (`src/lib/demo/demoData.ts`).
- **Zero Supabase Writes**: In demo mode, all additions, edits, and deletions occur strictly in browser memory. No network mutations or database writes are performed.
- **Demo Mode Banner**: A persistent banner indicates demo mode is active with direct options to "Exit Demo" or "Create Real Account".
- **Route Protection**: The server middleware permits demo visitors to browse `/dashboard`, `/calendar`, `/log`, and `/insights`, but blocks `/profile` (redirecting to `/login?notice=account_required`).
- **Session Cleanup**: Logging in or registering an authentic account automatically purges the demo cookie (`oviare_demo_mode`) and resets the cycle data context to the user's authentic data.

---

## 7. Cycle Calculations Engine

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

## 8. Supabase Auth Rate-Limit Troubleshooting

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

## 9. Setup & Development Commands

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

### `public.reminder_preferences` Table (Additional Phase 4)
Stores user-specific reminder configurations, category toggles, and preferred local delivery times:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `master_enabled`: BOOLEAN NOT NULL (`DEFAULT FALSE`)
- `wellness_reminder_enabled`: BOOLEAN NOT NULL (`DEFAULT FALSE`)
- `period_logging_reminder_enabled`: BOOLEAN NOT NULL (`DEFAULT FALSE`)
- `estimated_period_reminder_enabled`: BOOLEAN NOT NULL (`DEFAULT FALSE`)
- `preferred_time`: TEXT NOT NULL (`DEFAULT '20:00'`)
- `timezone`: TEXT NOT NULL (`DEFAULT 'UTC'`)
- `estimated_period_lead_days`: INTEGER NOT NULL (`CHECK (estimated_period_lead_days IN (1, 2, 3))`)
- `created_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- `updated_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- **Constraints**: `UNIQUE (user_id)`
- **RLS Policies**: SELECT, INSERT, UPDATE, DELETE for `auth.uid() = user_id`.

### `public.push_subscriptions` Table (Additional Phase 4)
Stores browser Web Push endpoints and public keys for authenticated devices:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `endpoint`: TEXT NOT NULL (`UNIQUE`)
- `p256dh`: TEXT NOT NULL
- `auth`: TEXT NOT NULL
- `user_agent`: TEXT NULL
- `is_active`: BOOLEAN NOT NULL (`DEFAULT TRUE`)
- `last_used_at`: Timestamptz NULL
- `created_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- `updated_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- **RLS Policies**: SELECT, INSERT, UPDATE, DELETE for `auth.uid() = user_id`.

### `public.reminder_delivery_logs` Table (Additional Phase 4)
Idempotency tracking ensuring duplicate notifications are never sent on the same calendar date:
- `id`: UUID Primary Key (`DEFAULT gen_random_uuid()`)
- `user_id`: UUID (`REFERENCES auth.users(id) ON DELETE CASCADE`)
- `reminder_type`: TEXT NOT NULL (`CHECK (reminder_type IN ('wellness', 'period_logging', 'estimated_period'))`)
- `delivery_channel`: TEXT NOT NULL (`CHECK (delivery_channel IN ('push', 'in_app'))`)
- `scheduled_for_date`: DATE NOT NULL
- `delivered_at`: Timestamptz (`DEFAULT timezone('utc', now())`)
- `status`: TEXT NOT NULL (`CHECK (status IN ('delivered', 'failed', 'suppressed', 'dismissed'))`)
- **Constraints**: `UNIQUE (user_id, reminder_type, scheduled_for_date, delivery_channel)`
- **RLS Policies**: SELECT, INSERT, UPDATE for `auth.uid() = user_id`.

SQL migration file: `supabase/migrations/20261003_notifications_and_reminders_schema.sql`.

---

## 7. Mobile Notifications & Smart Reminders Architecture

### Principles & Privacy Guarantees
1. **Discreet Lock-Screen Messaging**: Notifications intentionally conceal sensitive reproductive health details. Generic, neutral phrasing only:
   - Daily Check-in: *"A little time for your Oviare check-in."*
   - Period Logging: *"Would you like to update your Oviare log?"*
   - Estimated Window: *"Your Oviare cycle reminder is coming up."*
   - Never contains symptoms, moods, sleep metrics, intimacy records, or personal notes.
2. **Strict Suppression Rules**:
   - Master toggle (`master_enabled === false`) silences all delivery channels.
   - Daily check-in reminder is automatically suppressed if a `daily_logs` record already exists for today.
   - Period logging cue is suppressed if an active period is already recorded.
   - Estimated period cue is suppressed if insufficient cycle data exists or if a period is already recorded.
3. **Dual-Channel Delivery**:
   - **In-App Reminders**: Embedded in the Dashboard (`UpcomingReminders.tsx`) and application shell (`InAppReminderBanner.tsx`). Always available as a zero-setup fallback.
   - **Browser Web Push**: Supported via Service Worker (`public/sw.js`) and W3C Push API for supported browsers.

### Browser & Device Compatibility
- **Desktop & Android (Chrome, Edge, Firefox, Brave)**: Fully supported natively via Web Push API and background Service Worker.
- **iOS & iPadOS (iOS 16.4+)**: Apple requires users to add the PWA to their Home Screen first (tap **Share ⎋ → "Add to Home Screen"**) before Web Push notifications can be granted and received. The Oviare settings UI clearly guides Apple users through this prerequisite.
- **Unsupported Environments**: Displays friendly guidance; falls back seamlessly to in-app reminders.

### Server Scheduler & Automated Delivery
- **Route Handler**: `/api/reminders/send` (GET/POST)
- **Vercel Cron**: Scheduled in `vercel.json` to execute hourly (`0 * * * *`).
- **Authorization**: Protected via `Authorization: Bearer ${CRON_SECRET}`.
- **Environment Variables Required**:
  ```bash
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
  VAPID_PRIVATE_KEY=your-vapid-private-key
  VAPID_SUBJECT=mailto:support@oviare.app
  CRON_SECRET=your-random-cron-secret
  ```

---

## 8. Setup & Development Commands

```powershell
# 1. Install dependencies
npm install

# 2. Run unit tests for cycle calculations & smart reminders
npx.cmd tsx --test src/lib/cycle/__tests__/calculations.test.ts
npx.cmd tsx --test src/lib/notifications/__tests__/evaluator.test.ts

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

## 9. Project Phase Summary

- **Phase 1 (Completed)**: UI design foundation, responsive AppShell, design tokens, navigation, mock views.
- **Phase 2 (Completed)**: Supabase Auth integration, session management, onboarding, RLS-protected user profiles, security headers.
- **Phase 3 (Completed)**: Persistent period logging, cycle calculations engine, 17 unit test suites, dynamic dashboard cycle ring & countdown, calendar month view with recorded/predicted periods, cycle history table with edit/delete confirmation, rate-limit troubleshooting.
- **Phase 4 (Completed)**: Daily wellness tracking (symptoms with Mild/Moderate/Severe severity, multi-mood tracking, sleep duration & quality, 1–5 energy scale, optional private intimacy logging, custom symptoms), database schema & RLS migrations, real aggregated personal insights (frequency chart, cycle history chart, wellness stat cards), guaranteed clean new user accounts with zero mock data, and an isolated in-memory "Try Demo" experience.
- **Additional Phase 4 (Completed)**: Mobile Notifications & Smart Reminders — privacy-first in-app reminders, Web Push service worker (`sw.js`), PWA manifest (`manifest.json`), customizable category controls (wellness, period logging, estimated period), preferred local time & timezone management, automated scheduled dispatch route (`/api/reminders/send`) with Vercel Cron, idempotency delivery logs, 11 reminder unit test suites, and strict Demo Mode isolation.

