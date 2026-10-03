import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateWellnessReminder,
  evaluatePeriodLoggingReminder,
  evaluateEstimatedPeriodReminder,
  evaluateAllReminders,
  NOTIFICATION_TEMPLATES,
  EvaluatorContext,
} from '../evaluator';
import { ReminderPreferences, DailyLogRecord, CycleRecord } from '@/types';
import { PredictionResult } from '@/lib/cycle/calculations';

const basePreferences: ReminderPreferences = {
  master_enabled: true,
  wellness_reminder_enabled: true,
  period_logging_reminder_enabled: true,
  estimated_period_reminder_enabled: true,
  preferred_time: '20:00',
  timezone: 'UTC',
  estimated_period_lead_days: 2,
};

const mockDailyLog: DailyLogRecord = {
  id: 'log-1',
  user_id: 'user-1',
  log_date: '2026-10-03',
  moods: ['calm'],
  sleep_duration_minutes: 480,
  sleep_quality: 'good',
  energy_level: 4,
  intimacy_logged: false,
  notes: null,
  created_at: '2026-10-03T10:00:00Z',
  updated_at: '2026-10-03T10:00:00Z',
};

const mockCycleRecord: CycleRecord = {
  id: 'cycle-1',
  user_id: 'user-1',
  period_start: '2026-09-07',
  period_end: '2026-09-12',
  flow_intensity: 'medium',
  notes: null,
  created_at: '2026-09-07T00:00:00Z',
  updated_at: '2026-09-12T00:00:00Z',
};

describe('Smart Reminders Evaluation Engine', () => {
  describe('Master Notification Toggle', () => {
    it('suppresses all reminders when master_enabled is false', () => {
      const ctx: EvaluatorContext = {
        preferences: { ...basePreferences, master_enabled: false },
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [mockCycleRecord],
      };

      const reminders = evaluateAllReminders(ctx);
      assert.strictEqual(reminders.length, 0);

      const wellness = evaluateWellnessReminder(ctx);
      assert.strictEqual(wellness.eligible, false);
      assert.strictEqual(wellness.suppressedReason, 'Master toggle is disabled');

      const period = evaluatePeriodLoggingReminder(ctx);
      assert.strictEqual(period.eligible, false);

      const estimated = evaluateEstimatedPeriodReminder(ctx);
      assert.strictEqual(estimated.eligible, false);
    });
  });

  describe('Daily Wellness Reminder', () => {
    it('triggers when enabled and no daily log exists for today', () => {
      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [],
      };

      const result = evaluateWellnessReminder(ctx);
      assert.strictEqual(result.eligible, true);
      assert.ok(result.item);
      assert.strictEqual(result.item?.id, 'wellness-2026-10-03');
      assert.strictEqual(result.item?.actionUrl, '/log');
    });

    it('is suppressed when a daily log for today already exists', () => {
      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [mockDailyLog],
        cycleRecords: [],
      };

      const result = evaluateWellnessReminder(ctx);
      assert.strictEqual(result.eligible, false);
      assert.strictEqual(
        result.suppressedReason,
        'Daily wellness check-in already recorded for today'
      );
    });

    it('is suppressed when wellness_reminder_enabled is false', () => {
      const ctx: EvaluatorContext = {
        preferences: { ...basePreferences, wellness_reminder_enabled: false },
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [],
      };

      const result = evaluateWellnessReminder(ctx);
      assert.strictEqual(result.eligible, false);
    });

    it('is suppressed when dismissed for the current day', () => {
      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [],
        dismissedReminderIds: ['wellness-2026-10-03'],
      };

      const result = evaluateWellnessReminder(ctx);
      assert.strictEqual(result.eligible, false);
      assert.strictEqual(result.suppressedReason, 'Dismissed for today');
    });
  });

  describe('Period Logging Reminder', () => {
    const predictionDueToday: PredictionResult = {
      estimatedStartDate: '2026-10-03',
      estimatedEndDate: '2026-10-08',
      daysUntilEstimate: 0,
      confidence: 'moderate',
      explanation: 'Estimated based on 28-day cycle length',
      isBasedOnPersonalAverage: true,
    };

    it('triggers when today matches estimated start date and unrecorded', () => {
      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [mockCycleRecord],
        prediction: predictionDueToday,
      };

      const result = evaluatePeriodLoggingReminder(ctx);
      assert.strictEqual(result.eligible, true);
      assert.ok(result.item);
      assert.strictEqual(result.item?.id, 'period-logging-2026-10-03');
    });

    it('is suppressed when a period is already recorded for today', () => {
      const todayPeriod: CycleRecord = {
        id: 'cycle-today',
        user_id: 'user-1',
        period_start: '2026-10-03',
        period_end: null,
        flow_intensity: 'heavy',
        notes: null,
        created_at: '2026-10-03T00:00:00Z',
        updated_at: '2026-10-03T00:00:00Z',
      };

      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [mockCycleRecord, todayPeriod],
        prediction: predictionDueToday,
      };

      const result = evaluatePeriodLoggingReminder(ctx);
      assert.strictEqual(result.eligible, false);
      assert.strictEqual(
        result.suppressedReason,
        'Period record is already recorded for current window'
      );
    });
  });

  describe('Upcoming Estimated Period Reminder', () => {
    const predictionIn2Days: PredictionResult = {
      estimatedStartDate: '2026-10-05',
      estimatedEndDate: '2026-10-10',
      daysUntilEstimate: 2,
      confidence: 'high',
      explanation: 'Based on 6-cycle rolling average',
      isBasedOnPersonalAverage: true,
    };

    it('triggers when within lead window (2 days prior to estimated date)', () => {
      const ctx: EvaluatorContext = {
        preferences: { ...basePreferences, estimated_period_lead_days: 2 },
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [mockCycleRecord],
        prediction: predictionIn2Days,
      };

      const result = evaluateEstimatedPeriodReminder(ctx);
      assert.strictEqual(result.eligible, true);
      assert.ok(result.item);
      assert.strictEqual(result.item?.id, 'estimated-period-2026-10-05');
      assert.strictEqual(result.item?.actionUrl, '/calendar');
    });

    it('is suppressed when outside lead window (e.g. 5 days prior with 2-day lead)', () => {
      const predictionIn5Days: PredictionResult = {
        ...predictionIn2Days,
        estimatedStartDate: '2026-10-08',
        daysUntilEstimate: 5,
      };

      const ctx: EvaluatorContext = {
        preferences: { ...basePreferences, estimated_period_lead_days: 2 },
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [mockCycleRecord],
        prediction: predictionIn5Days,
      };

      const result = evaluateEstimatedPeriodReminder(ctx);
      assert.strictEqual(result.eligible, false);
    });

    it('is suppressed when cycle data is insufficient (no estimate)', () => {
      const ctx: EvaluatorContext = {
        preferences: basePreferences,
        todayDateStr: '2026-10-03',
        dailyLogs: [],
        cycleRecords: [],
        prediction: {
          estimatedStartDate: null,
          estimatedEndDate: null,
          daysUntilEstimate: null,
          confidence: null,
          explanation: 'No period recorded yet',
          isBasedOnPersonalAverage: false,
        },
      };

      const result = evaluateEstimatedPeriodReminder(ctx);
      assert.strictEqual(result.eligible, false);
      assert.strictEqual(
        result.suppressedReason,
        'Insufficient cycle data for estimation'
      );
    });
  });

  describe('Privacy & Content Security', () => {
    it('ensures notification templates contain no sensitive personal health terms', () => {
      const forbiddenTerms = [
        'cramp',
        'cramps',
        'blood',
        'bleed',
        'bleeding',
        'symptom',
        'symptoms',
        'mood',
        'moods',
        'intimacy',
        'sexual',
        'sex',
        'contraception',
        'ovulation',
        'fertile',
        'discharge',
      ];

      for (const [key, template] of Object.entries(NOTIFICATION_TEMPLATES)) {
        const fullText = `${template.title} ${template.body}`.toLowerCase();
        for (const term of forbiddenTerms) {
          assert.strictEqual(
            fullText.includes(term),
            false,
            `Template ${key} should not contain sensitive term "${term}"`
          );
        }
      }
    });
  });
});
