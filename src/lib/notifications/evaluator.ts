import {
  ReminderPreferences,
  DailyLogRecord,
  CycleRecord,
  InAppReminderItem,
  ReminderType,
} from '@/types';
import {
  differenceInCalendarDays,
  predictNextPeriod,
  buildCycleHistory,
  calculateCycleStats,
  PredictionResult,
} from '@/lib/cycle/calculations';

function getOrCalculatePrediction(
  records: CycleRecord[],
  todayDateStr: string,
  providedPrediction?: PredictionResult
): PredictionResult {
  if (providedPrediction) return providedPrediction;
  const history = buildCycleHistory(records);
  const stats = calculateCycleStats(history);
  return predictNextPeriod(records, stats, 28, 5, todayDateStr);
}

export interface EvaluatorContext {
  preferences: ReminderPreferences;
  todayDateStr: string; // ISO format 'YYYY-MM-DD' in user's local timezone
  dailyLogs: DailyLogRecord[];
  cycleRecords: CycleRecord[];
  prediction?: PredictionResult;
  dismissedReminderIds?: string[];
}

export interface EvaluatedReminder {
  type: ReminderType;
  eligible: boolean;
  suppressedReason?: string;
  item?: InAppReminderItem;
  pushPayload?: {
    title: string;
    body: string;
    url: string;
    tag: string;
  };
}

/**
 * Standard privacy-first, non-diagnostic discreet notification templates
 */
export const NOTIFICATION_TEMPLATES = {
  wellness: {
    title: 'Oviare Check-in',
    body: 'A little time for your Oviare check-in.',
    actionLabel: 'Log today',
    actionUrl: '/log',
    tag: 'oviare-wellness-checkin',
  },
  period_logging: {
    title: 'Oviare Log',
    body: 'Would you like to update your Oviare log?',
    actionLabel: 'Update log',
    actionUrl: '/log',
    tag: 'oviare-period-update',
  },
  estimated_period: {
    title: 'Oviare Rhythm',
    body: 'Your Oviare cycle reminder is coming up.',
    actionLabel: 'View calendar',
    actionUrl: '/calendar',
    tag: 'oviare-cycle-upcoming',
  },
} as const;

/**
 * Evaluates whether the daily wellness check-in reminder should trigger
 */
export function evaluateWellnessReminder(ctx: EvaluatorContext): EvaluatedReminder {
  const { preferences, todayDateStr, dailyLogs, dismissedReminderIds = [] } = ctx;

  if (!preferences.master_enabled) {
    return { type: 'wellness', eligible: false, suppressedReason: 'Master toggle is disabled' };
  }

  if (!preferences.wellness_reminder_enabled) {
    return { type: 'wellness', eligible: false, suppressedReason: 'Wellness reminder is disabled' };
  }

  const id = `wellness-${todayDateStr}`;
  if (dismissedReminderIds.includes(id)) {
    return { type: 'wellness', eligible: false, suppressedReason: 'Dismissed for today' };
  }

  // Suppression: check if today's wellness check-in has already been logged
  const existingLog = dailyLogs.find((l) => l.log_date === todayDateStr);
  if (existingLog) {
    return {
      type: 'wellness',
      eligible: false,
      suppressedReason: 'Daily wellness check-in already recorded for today',
    };
  }

  const template = NOTIFICATION_TEMPLATES.wellness;
  return {
    type: 'wellness',
    eligible: true,
    item: {
      id,
      type: 'wellness',
      title: template.title,
      description: template.body,
      timingLabel: `Daily reminder (${preferences.preferred_time})`,
      actionUrl: template.actionUrl,
      actionLabel: template.actionLabel,
    },
    pushPayload: {
      title: template.title,
      body: template.body,
      url: template.actionUrl,
      tag: template.tag,
    },
  };
}

/**
 * Evaluates period logging reminder eligibility
 */
export function evaluatePeriodLoggingReminder(ctx: EvaluatorContext): EvaluatedReminder {
  const { preferences, todayDateStr, cycleRecords, prediction, dismissedReminderIds = [] } = ctx;

  if (!preferences.master_enabled) {
    return { type: 'period_logging', eligible: false, suppressedReason: 'Master toggle is disabled' };
  }

  if (!preferences.period_logging_reminder_enabled) {
    return { type: 'period_logging', eligible: false, suppressedReason: 'Period logging reminder is disabled' };
  }

  const id = `period-logging-${todayDateStr}`;
  if (dismissedReminderIds.includes(id)) {
    return { type: 'period_logging', eligible: false, suppressedReason: 'Dismissed for today' };
  }

  // Check if user already recorded a period that started on or covers today
  const hasActivePeriodToday = cycleRecords.some((r) => {
    if (r.period_start === todayDateStr) return true;
    if (r.period_end && r.period_start <= todayDateStr && r.period_end >= todayDateStr) return true;
    if (!r.period_end && r.period_start <= todayDateStr) {
      // Ongoing period started within the last 10 days
      const daysSinceStart = differenceInCalendarDays(r.period_start, todayDateStr);
      return daysSinceStart >= 0 && daysSinceStart <= 10;
    }
    return false;
  });

  if (hasActivePeriodToday) {
    return {
      type: 'period_logging',
      eligible: false,
      suppressedReason: 'Period record is already recorded for current window',
    };
  }

  // Check if today matches or is within 1 day of an estimated period start date
  const pred = getOrCalculatePrediction(cycleRecords, todayDateStr, prediction);
  if (!pred.estimatedStartDate) {
    return {
      type: 'period_logging',
      eligible: false,
      suppressedReason: 'No estimated period start date available',
    };
  }

  const diffDays = differenceInCalendarDays(todayDateStr, pred.estimatedStartDate);
  // Eligible if today is the estimated start date or 1 day past it and unrecorded
  const isDue = diffDays === 0 || diffDays === -1;

  if (!isDue) {
    return {
      type: 'period_logging',
      eligible: false,
      suppressedReason: 'Not currently at estimated period date',
    };
  }

  const template = NOTIFICATION_TEMPLATES.period_logging;
  return {
    type: 'period_logging',
    eligible: true,
    item: {
      id,
      type: 'period_logging',
      title: template.title,
      description: template.body,
      timingLabel: 'Rhythm update cue',
      actionUrl: template.actionUrl,
      actionLabel: template.actionLabel,
    },
    pushPayload: {
      title: template.title,
      body: template.body,
      url: template.actionUrl,
      tag: template.tag,
    },
  };
}

/**
 * Evaluates upcoming estimated-period reminder eligibility
 */
export function evaluateEstimatedPeriodReminder(ctx: EvaluatorContext): EvaluatedReminder {
  const { preferences, todayDateStr, cycleRecords, prediction, dismissedReminderIds = [] } = ctx;

  if (!preferences.master_enabled) {
    return { type: 'estimated_period', eligible: false, suppressedReason: 'Master toggle is disabled' };
  }

  if (!preferences.estimated_period_reminder_enabled) {
    return { type: 'estimated_period', eligible: false, suppressedReason: 'Estimated period reminder is disabled' };
  }

  const pred = getOrCalculatePrediction(cycleRecords, todayDateStr, prediction);

  // Suppress if insufficient cycle data (must have at least an estimate)
  if (!pred.estimatedStartDate) {
    return {
      type: 'estimated_period',
      eligible: false,
      suppressedReason: 'Insufficient cycle data for estimation',
    };
  }

  const id = `estimated-period-${pred.estimatedStartDate}`;
  if (dismissedReminderIds.includes(id)) {
    return { type: 'estimated_period', eligible: false, suppressedReason: 'Dismissed for this cycle' };
  }

  // Days until the estimated period starts
  const daysUntilEstimate = differenceInCalendarDays(todayDateStr, pred.estimatedStartDate);
  const leadDays = preferences.estimated_period_lead_days || 2;

  // Eligible only when within lead days (e.g. 1 to leadDays days before)
  const isWithinLeadWindow = daysUntilEstimate > 0 && daysUntilEstimate <= leadDays;

  if (!isWithinLeadWindow) {
    return {
      type: 'estimated_period',
      eligible: false,
      suppressedReason: `Not within lead window of ${leadDays} days (currently ${daysUntilEstimate} days away)`,
    };
  }

  // Suppress if a period has already been recorded on or after today
  const hasRecentPeriod = cycleRecords.some(
    (r) => r.period_start >= todayDateStr || (r.period_end && r.period_end >= todayDateStr)
  );

  if (hasRecentPeriod) {
    return {
      type: 'estimated_period',
      eligible: false,
      suppressedReason: 'A period has already been recorded for this window',
    };
  }

  const template = NOTIFICATION_TEMPLATES.estimated_period;
  return {
    type: 'estimated_period',
    eligible: true,
    item: {
      id,
      type: 'estimated_period',
      title: template.title,
      description: template.body,
      timingLabel: `Upcoming window (~${daysUntilEstimate} ${daysUntilEstimate === 1 ? 'day' : 'days'})`,
      actionUrl: template.actionUrl,
      actionLabel: template.actionLabel,
    },
    pushPayload: {
      title: template.title,
      body: template.body,
      url: template.actionUrl,
      tag: template.tag,
    },
  };
}

/**
 * Evaluates all active in-app reminders based on current state
 */
export function evaluateAllReminders(ctx: EvaluatorContext): InAppReminderItem[] {
  const results: InAppReminderItem[] = [];

  const wellness = evaluateWellnessReminder(ctx);
  if (wellness.eligible && wellness.item) {
    results.push(wellness.item);
  }

  const periodLogging = evaluatePeriodLoggingReminder(ctx);
  if (periodLogging.eligible && periodLogging.item) {
    results.push(periodLogging.item);
  }

  const estimatedPeriod = evaluateEstimatedPeriodReminder(ctx);
  if (estimatedPeriod.eligible && estimatedPeriod.item) {
    results.push(estimatedPeriod.item);
  }

  return results;
}
