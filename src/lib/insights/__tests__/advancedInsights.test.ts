import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getDateRangeBounds,
  calculateLoggingConsistency,
  calculateSymptomInsights,
  calculateMoodInsights,
  calculateSleepInsights,
  calculateEnergyInsights,
  calculateComparativeInsights,
  generateAdvancedInsights,
} from '../advancedInsights';
import { DailyLogRecord } from '@/types';

const mockLogs: DailyLogRecord[] = [
  {
    id: 'log-1',
    user_id: 'user-1',
    log_date: '2026-10-01',
    moods: ['happy', 'energetic'],
    sleep_duration_minutes: 480, // 8.0 hrs
    sleep_quality: 'good',
    energy_level: 4,
    intimacy_logged: true,
    symptoms: [
      { symptom_name: 'headache', severity: 'moderate' },
      { symptom_name: 'cramps', severity: 'severe' },
    ],
    notes: 'Feeling productive',
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'user-1',
    log_date: '2026-09-30',
    moods: ['calm'],
    sleep_duration_minutes: 420, // 7.0 hrs
    sleep_quality: 'good',
    energy_level: 3,
    intimacy_logged: false,
    symptoms: [
      { symptom_name: 'cramps', severity: 'mild' },
      { symptom_name: 'bloating', severity: 'mild' },
    ],
    notes: null,
    created_at: '2026-09-30T08:00:00Z',
    updated_at: '2026-09-30T08:00:00Z',
  },
  {
    id: 'log-3',
    user_id: 'user-1',
    log_date: '2026-09-29',
    moods: ['tired'],
    sleep_duration_minutes: 360, // 6.0 hrs
    sleep_quality: 'poor',
    energy_level: 2,
    intimacy_logged: false,
    symptoms: [
      { symptom_name: 'fatigue', severity: 'severe' },
    ],
    notes: null,
    created_at: '2026-09-29T08:00:00Z',
    updated_at: '2026-09-29T08:00:00Z',
  },
];

describe('Phase 5: Advanced Personal Insights Engine', () => {
  describe('Date Range Bounds', () => {
    it('calculates 30-day range correctly from reference date', () => {
      const bounds = getDateRangeBounds('30d', '2026-10-01');
      assert.strictEqual(bounds.endDate, '2026-10-01');
      assert.strictEqual(bounds.startDate, '2026-09-02');
      assert.strictEqual(bounds.totalDays, 30);
    });

    it('calculates 90-day range correctly from reference date', () => {
      const bounds = getDateRangeBounds('90d', '2026-10-01');
      assert.strictEqual(bounds.endDate, '2026-10-01');
      assert.strictEqual(bounds.totalDays, 90);
    });

    it('calculates custom range correctly', () => {
      const bounds = getDateRangeBounds('custom', '2026-10-01', '2026-09-10', '2026-09-15');
      assert.strictEqual(bounds.startDate, '2026-09-10');
      assert.strictEqual(bounds.endDate, '2026-09-15');
      assert.strictEqual(bounds.totalDays, 6);
    });
  });

  describe('Logging Consistency & Streaks', () => {
    it('returns zeroes for empty log array', () => {
      const consistency = calculateLoggingConsistency([], 30, '2026-10-01');
      assert.strictEqual(consistency.totalLoggedDays, 0);
      assert.strictEqual(consistency.consistencyPercentage, 0);
      assert.strictEqual(consistency.currentStreakDays, 0);
      assert.strictEqual(consistency.longestStreakDays, 0);
    });

    it('calculates consistency percentage and streaks for continuous logs', () => {
      const consistency = calculateLoggingConsistency(mockLogs, 3, '2026-10-01');
      assert.strictEqual(consistency.totalLoggedDays, 3);
      assert.strictEqual(consistency.totalDaysInRange, 3);
      assert.strictEqual(consistency.consistencyPercentage, 100);
      assert.strictEqual(consistency.currentStreakDays, 3);
      assert.strictEqual(consistency.longestStreakDays, 3);
    });
  });

  describe('Symptom Frequency & Severity Breakdown', () => {
    it('returns empty list when no symptoms are recorded', () => {
      const symptoms = calculateSymptomInsights([]);
      assert.strictEqual(symptoms.length, 0);
    });

    it('aggregates symptom occurrences, percentages, and severity counts', () => {
      const symptoms = calculateSymptomInsights(mockLogs);
      assert.strictEqual(symptoms.length, 4);

      // 'cramps' appeared 2 times out of 3 logs (66.7% -> 67%)
      const cramps = symptoms.find((s) => s.symptomName === 'cramps');
      assert(cramps !== undefined);
      assert.strictEqual(cramps.totalOccurrences, 2);
      assert.strictEqual(cramps.percentageOfLoggedDays, 67);
      assert.strictEqual(cramps.severityBreakdown.mild, 1);
      assert.strictEqual(cramps.severityBreakdown.severe, 1);
      assert.strictEqual(cramps.severityBreakdown.moderate, 0);

      // Verify symptoms are sorted by frequency descending
      assert.strictEqual(symptoms[0].symptomName, 'cramps');
    });
  });

  describe('Mood Distribution', () => {
    it('returns empty list when no moods are logged', () => {
      const moods = calculateMoodInsights([]);
      assert.strictEqual(moods.length, 0);
    });

    it('calculates counts and percentage of total mood occurrences', () => {
      const moods = calculateMoodInsights(mockLogs);
      // Moods: happy (1), energetic (1), calm (1), tired (1) -> total 4 moods, 25% each
      assert.strictEqual(moods.length, 4);
      for (const m of moods) {
        assert.strictEqual(m.count, 1);
        assert.strictEqual(m.percentage, 25);
      }
    });
  });

  describe('Sleep Insights', () => {
    it('handles logs with no sleep data', () => {
      const sleep = calculateSleepInsights([]);
      assert.strictEqual(sleep.totalLoggedSleepDays, 0);
      assert.strictEqual(sleep.averageDurationHours, null);
      assert.strictEqual(sleep.mostCommonQuality, null);
    });

    it('calculates average sleep duration and quality distribution', () => {
      // 480m (8h), 420m (7h), 360m (6h) -> average 420m = 7.0h
      const sleep = calculateSleepInsights(mockLogs);
      assert.strictEqual(sleep.totalLoggedSleepDays, 3);
      assert.strictEqual(sleep.averageDurationHours, 7.0);
      assert.strictEqual(sleep.averageDurationMinutes, 420);
      assert.strictEqual(sleep.qualityBreakdown.good, 2);
      assert.strictEqual(sleep.qualityBreakdown.poor, 1);
      assert.strictEqual(sleep.mostCommonQuality, 'good');
    });
  });

  describe('Energy Insights', () => {
    it('handles logs with no energy data', () => {
      const energy = calculateEnergyInsights([]);
      assert.strictEqual(energy.totalLoggedEnergyDays, 0);
      assert.strictEqual(energy.averageScore, null);
    });

    it('calculates average energy level and distribution buckets', () => {
      // Scores: 4, 3, 2 -> average 3.0
      const energy = calculateEnergyInsights(mockLogs);
      assert.strictEqual(energy.totalLoggedEnergyDays, 3);
      assert.strictEqual(energy.averageScore, 3.0);
      assert.strictEqual(energy.distribution.score4, 1);
      assert.strictEqual(energy.distribution.score3, 1);
      assert.strictEqual(energy.distribution.score2, 1);
      assert.strictEqual(energy.distribution.score1, 0);
    });
  });

  describe('Comparative Period Analysis', () => {
    it('flags insufficient data when prior period has zero logs', () => {
      const bounds = {
        startDate: '2026-09-29',
        endDate: '2026-10-01',
        totalDays: 3,
        label: 'Last 3 Days',
      };
      const comparison = calculateComparativeInsights(mockLogs, bounds);
      assert.strictEqual(comparison.currentCheckinsCount, 3);
      assert.strictEqual(comparison.previousCheckinsCount, 0);
      assert.strictEqual(comparison.hasSufficientComparativeData, false);
    });

    it('computes comparison when both periods have logs', () => {
      // Prior period logs: 2026-09-26 to 2026-09-28
      const allLogs: DailyLogRecord[] = [
        ...mockLogs,
        {
          id: 'log-prior-1',
          user_id: 'user-1',
          log_date: '2026-09-28',
          moods: ['tired'],
          sleep_duration_minutes: 360,
          sleep_quality: 'poor',
          energy_level: 2,
          intimacy_logged: false,
          symptoms: [{ symptom_name: 'bloating', severity: 'severe' }],
          notes: null,
          created_at: '2026-09-28T08:00:00Z',
          updated_at: '2026-09-28T08:00:00Z',
        },
        {
          id: 'log-prior-2',
          user_id: 'user-1',
          log_date: '2026-09-27',
          moods: ['calm'],
          sleep_duration_minutes: 420,
          sleep_quality: 'fair',
          energy_level: 3,
          intimacy_logged: false,
          symptoms: [{ symptom_name: 'bloating', severity: 'moderate' }],
          notes: null,
          created_at: '2026-09-27T08:00:00Z',
          updated_at: '2026-09-27T08:00:00Z',
        },
      ];

      const bounds = {
        startDate: '2026-09-29',
        endDate: '2026-10-01',
        totalDays: 3,
        label: 'Last 3 Days',
      };
      const comparison = calculateComparativeInsights(allLogs, bounds);
      assert.strictEqual(comparison.currentCheckinsCount, 3);
      assert.strictEqual(comparison.previousCheckinsCount, 2);
      assert.strictEqual(comparison.hasSufficientComparativeData, true);
      assert.strictEqual(comparison.topSymptomCurrent, 'cramps');
      assert.strictEqual(comparison.topSymptomPrevious, 'bloating');
    });
  });

  describe('Full Insights Generation Workflow', () => {
    it('produces cohesive, non-null summary for empty logs', () => {
      const summary = generateAdvancedInsights([], '30d', '2026-10-01');
      assert.strictEqual(summary.recordsUsedCount, 0);
      assert.strictEqual(summary.symptoms.length, 0);
      assert.strictEqual(summary.moods.length, 0);
      assert.strictEqual(summary.sleep.averageDurationHours, null);
      assert.strictEqual(summary.energy.averageScore, null);
    });

    it('produces complete summary with accurate record counts for populated logs', () => {
      const summary = generateAdvancedInsights(mockLogs, '30d', '2026-10-01');
      assert.strictEqual(summary.recordsUsedCount, 3);
      assert.strictEqual(summary.dateRange, '30d');
      assert(summary.symptoms.length > 0);
      assert(summary.moods.length > 0);
      assert.strictEqual(summary.sleep.totalLoggedSleepDays, 3);
    });
  });
});
