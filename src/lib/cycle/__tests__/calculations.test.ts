import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  differenceInCalendarDays,
  addDaysToISODate,
  isValidISODate,
  validatePeriodDates,
  buildCycleHistory,
  calculateCycleStatistics,
  estimateUpcomingPeriod,
  getCurrentCycleDay,
  CycleRecord,
} from '../calculations';

describe('Cycle Calculations Engine', () => {
  describe('Date Utilities (UTC Arithmetic)', () => {
    test('calculates correct difference across regular month boundary', () => {
      const diff = differenceInCalendarDays('2026-04-28', '2026-05-26');
      assert.equal(diff, 28);
    });

    test('calculates correct difference across year boundary', () => {
      const diff = differenceInCalendarDays('2026-12-20', '2027-01-17');
      assert.equal(diff, 28);
    });

    test('calculates correct difference in leap year (February 2024 has 29 days)', () => {
      const diff = differenceInCalendarDays('2024-02-01', '2024-03-01');
      assert.equal(diff, 29); // 29 days in leap February
    });

    test('calculates correct difference in non-leap year (February 2025 has 28 days)', () => {
      const diff = differenceInCalendarDays('2025-02-01', '2025-03-01');
      assert.equal(diff, 28);
    });

    test('adds days accurately across month boundaries', () => {
      const result = addDaysToISODate('2026-09-15', 28);
      assert.equal(result, '2026-10-13');
    });

    test('validates valid and invalid ISO dates', () => {
      assert.equal(isValidISODate('2026-10-01'), true);
      assert.equal(isValidISODate('2024-02-29'), true); // leap year
      assert.equal(isValidISODate('2025-02-29'), false); // not leap year
      assert.equal(isValidISODate('invalid'), false);
    });
  });

  describe('Period Validation', () => {
    test('rejects end date before start date', () => {
      const res = validatePeriodDates('2026-10-05', '2026-10-02');
      assert.equal(res.isValid, false);
      assert.match(res.error || '', /cannot be earlier/);
    });

    test('allows ongoing period with null end date', () => {
      const res = validatePeriodDates('2026-10-01', null);
      assert.equal(res.isValid, true);
    });

    test('rejects duplicate start date with existing records', () => {
      const existing: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-09-01', period_end: '2026-09-05' },
      ];
      const res = validatePeriodDates('2026-09-01', '2026-09-06', existing);
      assert.equal(res.isValid, false);
      assert.match(res.error || '', /already starts on this date/);
    });

    test('rejects overlapping period range with existing record', () => {
      const existing: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-09-01', period_end: '2026-09-05' },
      ];
      const res = validatePeriodDates('2026-09-03', '2026-09-08', existing);
      assert.equal(res.isValid, false);
      assert.match(res.error || '', /overlaps with an existing period/);
    });

    test('allows non-overlapping adjacent period', () => {
      const existing: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-09-01', period_end: '2026-09-05' },
      ];
      const res = validatePeriodDates('2026-09-29', '2026-10-03', existing);
      assert.equal(res.isValid, true);
    });
  });

  describe('Cycle History Building & Lengths', () => {
    test('computes cycle lengths between consecutive period start dates', () => {
      const records: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-06-01', period_end: '2026-06-05' },
        { id: '2', user_id: 'u1', period_start: '2026-06-30', period_end: '2026-07-04' },
        { id: '3', user_id: 'u1', period_start: '2026-07-28', period_end: null }, // ongoing
      ];

      const history = buildCycleHistory(records);
      assert.equal(history.length, 3);

      // Cycle 1: June 1 to June 30 = 29 days
      assert.equal(history[0].cycleLengthDays, 29);
      assert.equal(history[0].periodDurationDays, 5);
      assert.equal(history[0].isOngoing, false);

      // Cycle 2: June 30 to July 28 = 28 days
      assert.equal(history[1].cycleLengthDays, 28);
      assert.equal(history[1].periodDurationDays, 5);

      // Cycle 3: July 28 onwards (current/latest, no next period yet)
      assert.equal(history[2].cycleLengthDays, null);
      assert.equal(history[2].isOngoing, true);
      assert.equal(history[2].periodDurationDays, null);
    });
  });

  describe('Cycle Statistics & Rolling Average', () => {
    test('handles insufficient data (0 or 1 period record)', () => {
      const stats0 = calculateCycleStatistics([]);
      assert.equal(stats0.hasSufficientData, false);
      assert.equal(stats0.averageCycleLength, null);
      assert.equal(stats0.dataQuality, 'insufficient');

      const singleRecord: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-08-01', period_end: '2026-08-05' },
      ];
      const stats1 = calculateCycleStatistics(buildCycleHistory(singleRecord));
      assert.equal(stats1.hasSufficientData, false);
      assert.equal(stats1.averageCycleLength, null);
      assert.equal(stats1.recordedPeriodsCount, 1);
    });

    test('calculates correct average and rolling window of up to 6 intervals', () => {
      // 8 periods = 7 completed cycle intervals: 28, 29, 27, 28, 30, 28, 29
      const records: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-01-01', period_end: '2026-01-05' }, // -> +28 = 2026-01-29
        { id: '2', user_id: 'u1', period_start: '2026-01-29', period_end: '2026-02-02' }, // -> +29 = 2026-02-27
        { id: '3', user_id: 'u1', period_start: '2026-02-27', period_end: '2026-03-03' }, // -> +27 = 2026-03-26
        { id: '4', user_id: 'u1', period_start: '2026-03-26', period_end: '2026-03-30' }, // -> +28 = 2026-04-23
        { id: '5', user_id: 'u1', period_start: '2026-04-23', period_end: '2026-04-27' }, // -> +30 = 2026-05-23
        { id: '6', user_id: 'u1', period_start: '2026-05-23', period_end: '2026-05-27' }, // -> +28 = 2026-06-20
        { id: '7', user_id: 'u1', period_start: '2026-06-20', period_end: '2026-06-24' }, // -> +29 = 2026-07-19
        { id: '8', user_id: 'u1', period_start: '2026-07-19', period_end: '2026-07-23' },
      ];

      const history = buildCycleHistory(records);
      const stats = calculateCycleStatistics(history, 6);

      // Total intervals = 7, but only most recent 6 used
      assert.equal(stats.intervalsUsedCount, 6);
      assert.equal(stats.hasSufficientData, true);
      assert.equal(stats.dataQuality, 'solid');

      // The 6 most recent intervals are: 29, 27, 28, 30, 28, 29 -> Sum = 171 / 6 = 28.5
      assert.equal(stats.averageCycleLength, 28.5);
      assert.equal(stats.minCycleLength, 27);
      assert.equal(stats.maxCycleLength, 30);
      assert.equal(stats.averagePeriodDuration, 5);
      assert.ok(stats.cycleVariabilityDays !== null && stats.cycleVariabilityDays > 0);
    });
  });

  describe('Next Period Estimation', () => {
    test('estimates next period start by adding average to latest period start', () => {
      const records: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-08-01', period_end: '2026-08-05' },
        { id: '2', user_id: 'u1', period_start: '2026-08-29', period_end: '2026-09-02' }, // 28d cycle
      ];

      const history = buildCycleHistory(records);
      const stats = calculateCycleStatistics(history);
      const estimate = estimateUpcomingPeriod(records, stats, 28, 5, '2026-09-10');

      assert.equal(estimate.estimatedStartDate, '2026-09-26'); // 2026-08-29 + 28 days = 2026-09-26
      assert.equal(estimate.estimatedEndDate, '2026-09-30'); // 5 days duration
      assert.equal(estimate.daysUntilEstimate, 16); // Sep 26 - Sep 10 = 16 days
      assert.equal(estimate.isBasedOnPersonalAverage, true);
    });

    test('provides baseline fallback with clear explanation when only 1 period logged', () => {
      const records: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-09-01', period_end: '2026-09-05' },
      ];
      const stats = calculateCycleStatistics(buildCycleHistory(records));
      const estimate = estimateUpcomingPeriod(records, stats, 28, 5, '2026-09-10');

      assert.equal(estimate.estimatedStartDate, '2026-09-29'); // Sep 1 + 28 days
      assert.equal(estimate.confidence, 'low');
      assert.equal(estimate.isBasedOnPersonalAverage, false);
      assert.match(estimate.explanation, /Log 2\+ periods to personalize/);
    });
  });

  describe('Current Cycle Day', () => {
    test('calculates correct current cycle day (1-indexed)', () => {
      const records: CycleRecord[] = [
        { id: '1', user_id: 'u1', period_start: '2026-09-20', period_end: '2026-09-25' },
      ];
      // On Sept 20, cycle day is 1
      assert.equal(getCurrentCycleDay(records, '2026-09-20').currentCycleDay, 1);
      // On Sept 25, cycle day is 6
      assert.equal(getCurrentCycleDay(records, '2026-09-25').currentCycleDay, 6);
      // On Oct 01, cycle day is 12 (11 days after Sep 20 + 1)
      assert.equal(getCurrentCycleDay(records, '2026-10-01').currentCycleDay, 12);
    });
  });
});
