import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import {
  evaluateWellnessReminder,
  evaluatePeriodLoggingReminder,
  evaluateEstimatedPeriodReminder,
  NOTIFICATION_TEMPLATES,
} from '@/lib/notifications/evaluator';
import { ReminderPreferences, DailyLogRecord, CycleRecord } from '@/types';

// VAPID Credentials from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@oviare.app';
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Formats a Date object to 'YYYY-MM-DD' in a specific IANA timezone
 */
function getLocalDateStringInTimezone(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // 'YYYY-MM-DD'
  } catch {
    // Fallback to UTC if timezone is invalid
    return date.toISOString().split('T')[0];
  }
}

/**
 * Gets current local hour (0-23) in user's timezone
 */
function getLocalHourInTimezone(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hourCycle: 'h23',
    });
    return parseInt(formatter.format(date), 10);
  } catch {
    return date.getUTCHours();
  }
}

export async function GET(request: Request) {
  return handleReminderDispatch(request);
}

export async function POST(request: Request) {
  return handleReminderDispatch(request);
}

async function handleReminderDispatch(request: Request) {
  // 1. Authenticate the scheduled request if CRON_SECRET is configured
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET) {
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing Bearer token.' },
        { status: 401 }
      );
    }
  }

  // 2. Validate VAPID configuration
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({
      status: 'skipped',
      message:
        'Web Push scheduler skipped: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not configured in environment variables.',
      requiredEnvVars: [
        'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
        'VAPID_PRIVATE_KEY',
        'VAPID_SUBJECT (optional)',
        'CRON_SECRET (optional)',
      ],
    });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  // 3. Initialize server Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Supabase URL or Key missing.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 4. Query all users with master notification toggle enabled
  const { data: preferencesList, error: prefsError } = await supabase
    .from('reminder_preferences')
    .select('*')
    .eq('master_enabled', true);

  if (prefsError) {
    if (prefsError.code === 'PGRST205') {
      return NextResponse.json({
        status: 'skipped',
        message: 'reminder_preferences table not yet created on remote database.',
      });
    }
    return NextResponse.json({ error: prefsError.message }, { status: 500 });
  }

  if (!preferencesList || preferencesList.length === 0) {
    return NextResponse.json({
      status: 'ok',
      message: 'No users with master notifications enabled.',
      dispatched: 0,
    });
  }

  const now = new Date();
  let dispatchedCount = 0;
  let skippedCount = 0;
  let suppressedCount = 0;
  let inactiveSubscriptionsCount = 0;

  for (const prefs of preferencesList as ReminderPreferences[]) {
    const userId = prefs.user_id;
    if (!userId) continue;

    // Check timezone & preferred hour
    const userTimezone = prefs.timezone || 'UTC';
    const localHour = getLocalHourInTimezone(now, userTimezone);
    const localDateStr = getLocalDateStringInTimezone(now, userTimezone);

    const [preferredHourStr] = (prefs.preferred_time || '20:00').split(':');
    const preferredHour = parseInt(preferredHourStr, 10);

    // Only dispatch if current local hour matches user's preferred hour
    // (with a tolerance of 1 hour for cron scheduling windows)
    const hourDifference = Math.abs(localHour - preferredHour);
    if (hourDifference > 1 && hourDifference < 23) {
      skippedCount++;
      continue;
    }

    // Fetch user's recent daily logs and cycle records for suppression evaluation
    const [{ data: userLogs }, { data: userCycles }, { data: pushSubs }] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', localDateStr),
      supabase
        .from('cycle_records')
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
        .limit(10),
      supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
    ]);

    if (!pushSubs || pushSubs.length === 0) {
      skippedCount++;
      continue;
    }

    const evalContext = {
      preferences: prefs,
      todayDateStr: localDateStr,
      dailyLogs: (userLogs as DailyLogRecord[]) || [],
      cycleRecords: (userCycles as CycleRecord[]) || [],
    };

    // Evaluate each reminder type
    const remindersToEvaluate = [
      evaluateWellnessReminder(evalContext),
      evaluatePeriodLoggingReminder(evalContext),
      evaluateEstimatedPeriodReminder(evalContext),
    ];

    for (const rem of remindersToEvaluate) {
      if (!rem.eligible || !rem.pushPayload) {
        suppressedCount++;
        continue;
      }

      // Idempotency: Check if this reminder was already delivered today
      const { data: existingLog } = await supabase
        .from('reminder_delivery_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('reminder_type', rem.type)
        .eq('scheduled_for_date', localDateStr)
        .eq('delivery_channel', 'push')
        .maybeSingle();

      if (existingLog) {
        suppressedCount++;
        continue;
      }

      // Send to all active subscriptions for this user
      const payloadString = JSON.stringify(rem.pushPayload);

      for (const sub of pushSubs) {
        const pushSubscriptionObj = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscriptionObj, payloadString);
          dispatchedCount++;

          // Record successful delivery
          await supabase.from('reminder_delivery_logs').upsert({
            user_id: userId,
            reminder_type: rem.type,
            delivery_channel: 'push',
            scheduled_for_date: localDateStr,
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          });
        } catch (err: unknown) {
          const webPushErr = err as { statusCode?: number };
          // If subscription expired or was revoked (410 Gone or 404 Not Found), deactivate it
          if (webPushErr?.statusCode === 410 || webPushErr?.statusCode === 404) {
            inactiveSubscriptionsCount++;
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', sub.id);
          } else {
            console.error(`Push send failure for user ${userId}:`, err);
          }
        }
      }
    }
  }

  return NextResponse.json({
    status: 'success',
    executedAt: now.toISOString(),
    usersProcessed: preferencesList.length,
    dispatchedCount,
    skippedCount,
    suppressedCount,
    inactiveSubscriptionsCleaned: inactiveSubscriptionsCount,
  });
}
