/**
 * Oviare Cycle Calculation Engine
 * 
 * Independent, pure TypeScript calculation module for menstrual cycle intervals,
 * period durations, rolling averages, variability, and next-period estimations.
 * 
 * Rules:
 * - Operates on calendar dates in 'YYYY-MM-DD' format using UTC to avoid timezone drift.
 * - Cycle length = Difference in calendar days between two consecutive period start dates.
 * - Period duration = Difference in days between start and end (inclusive).
 * - Minimum valid cycle length considered physiological: 18 - 60 days.
 * - Rolling average uses up to the 6 most recent completed cycle intervals.
 * - All predictions are explicitly labeled as informational estimates, never medical guarantees.
 */

export interface CycleRecord {
  id: string;
  user_id: string;
  period_start: string; // 'YYYY-MM-DD'
  period_end: string | null; // 'YYYY-MM-DD' or null if ongoing
  created_at?: string;
  updated_at?: string;
}

export interface CycleHistoryItem {
  id: string;
  periodStart: string;
  periodEnd: string | null;
  periodDurationDays: number | null; // null if ongoing
  isOngoing: boolean;
  cycleLengthDays: number | null; // null for the most recent period (cycle not yet completed)
  nextPeriodStart: string | null;
  isPhysiologicallyPlausible: boolean; // 18-60 days
}

export interface CycleStatistics {
  recordedPeriodsCount: number;
  completedCyclesCount: number;
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  minCycleLength: number | null;
  maxCycleLength: number | null;
  cycleVariabilityDays: number | null; // Standard deviation rounded
  intervalsUsedCount: number;
  hasSufficientData: boolean; // At least 1 completed cycle interval
  dataQuality: 'insufficient' | 'emerging' | 'solid';
}

export interface NextPeriodEstimate {
  estimatedStartDate: string | null;
  estimatedEndDate: string | null;
  daysUntilEstimate: number | null;
  confidence: 'low' | 'moderate' | 'high' | null;
  explanation: string;
  isBasedOnPersonalAverage: boolean;
}

// -------------------------------------------------------------
// Date Utility Functions (Strict UTC-safe date math)
// -------------------------------------------------------------

/**
 * Parses 'YYYY-MM-DD' safely as UTC midnight timestamp
 */
export function parseISODateToUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object to 'YYYY-MM-DD' in UTC
 */
export function formatUTCToISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates calendar days between two ISO dates (dateB - dateA)
 */
export function differenceInCalendarDays(dateAStr: string, dateBStr: string): number {
  const dateA = parseISODateToUTC(dateAStr);
  const dateB = parseISODateToUTC(dateBStr);
  const diffMs = dateB.getTime() - dateA.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds integer days to an ISO date string
 */
export function addDaysToISODate(dateStr: string, daysToAdd: number): string {
  const date = parseISODateToUTC(dateStr);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return formatUTCToISODate(date);
}

/**
 * Validates whether an ISO date string is syntactically valid and real
 */
export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Period Record Validation
// -------------------------------------------------------------

export interface PeriodValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePeriodDates(
  periodStart: string,
  periodEnd: string | null,
  existingRecords: CycleRecord[] = [],
  currentRecordId?: string
): PeriodValidationResult {
  if (!isValidISODate(periodStart)) {
    return { isValid: false, error: 'Start date must be a valid date in YYYY-MM-DD format.' };
  }

  if (periodEnd !== null && !isValidISODate(periodEnd)) {
    return { isValid: false, error: 'End date must be a valid date in YYYY-MM-DD format.' };
  }

  if (periodEnd !== null) {
    const duration = differenceInCalendarDays(periodStart, periodEnd);
    if (duration < 0) {
      return { isValid: false, error: 'Period end date cannot be earlier than the start date.' };
    }
    if (duration > 30) {
      return { isValid: false, error: 'Period duration cannot exceed 30 consecutive days.' };
    }
  }

  // Filter out the record being edited if any
  const otherRecords = existingRecords.filter((r) => r.id !== currentRecordId);

  // Check for duplicate start dates
  const hasDuplicateStart = otherRecords.some((r) => r.period_start === periodStart);
  if (hasDuplicateStart) {
    return { isValid: false, error: 'A period record already starts on this date.' };
  }

  // Check for overlapping period records
  for (const r of otherRecords) {
    const rStart = r.period_start;
    const rEnd = r.period_end || r.period_start; // If ongoing, treat as at least 1 day

    // Case A: New record starts inside an existing period range
    if (periodStart >= rStart && periodStart <= rEnd) {
      return {
        isValid: false,
        error: `The start date overlaps with an existing period (${rStart} to ${r.period_end || 'ongoing'}).`,
      };
    }

    // Case B: Existing record starts inside the new period range
    if (periodEnd !== null && rStart >= periodStart && rStart <= periodEnd) {
      return {
        isValid: false,
        error: `An existing period starting on ${rStart} falls within this new period range.`,
      };
    }
  }

  return { isValid: true };
}

// -------------------------------------------------------------
// Cycle History & Interval Computation
// -------------------------------------------------------------

/**
 * Builds chronological cycle history items with interval calculations.
 * Records are sorted ascending by period_start.
 */
export function buildCycleHistory(records: CycleRecord[]): CycleHistoryItem[] {
  if (!records || records.length === 0) return [];

  // Sort chronologically ascending
  const sorted = [...records].sort((a, b) =>
    a.period_start.localeCompare(b.period_start)
  );

  const history: CycleHistoryItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1] || null;

    let periodDurationDays: number | null = null;
    if (current.period_end) {
      periodDurationDays = differenceInCalendarDays(current.period_start, current.period_end) + 1;
    }

    let cycleLengthDays: number | null = null;
    let nextPeriodStart: string | null = null;
    let isPhysiologicallyPlausible = true;

    if (next) {
      nextPeriodStart = next.period_start;
      cycleLengthDays = differenceInCalendarDays(current.period_start, next.period_start);
      // Physiologically plausible cycle lengths are typically between 18 and 60 days
      isPhysiologicallyPlausible = cycleLengthDays >= 18 && cycleLengthDays <= 60;
    }

    history.push({
      id: current.id,
      periodStart: current.period_start,
      periodEnd: current.period_end,
      periodDurationDays,
      isOngoing: current.period_end === null,
      cycleLengthDays,
      nextPeriodStart,
      isPhysiologicallyPlausible,
    });
  }

  return history;
}

// -------------------------------------------------------------
// Cycle Statistics & Averages (Rolling 6-cycle window)
// -------------------------------------------------------------

/**
 * Calculates rolling cycle statistics from history.
 * Uses up to `maxIntervals` (default 6) recent valid cycle intervals.
 */
export function calculateCycleStatistics(
  history: CycleHistoryItem[],
  maxIntervals = 6
): CycleStatistics {
  const recordedPeriodsCount = history.length;

  if (recordedPeriodsCount === 0) {
    return {
      recordedPeriodsCount: 0,
      completedCyclesCount: 0,
      averageCycleLength: null,
      averagePeriodDuration: null,
      minCycleLength: null,
      maxCycleLength: null,
      cycleVariabilityDays: null,
      intervalsUsedCount: 0,
      hasSufficientData: false,
      dataQuality: 'insufficient',
    };
  }

  // Extract completed cycles with plausible cycle lengths
  const completedCycles = history.filter(
    (h) => h.cycleLengthDays !== null && h.isPhysiologicallyPlausible
  );

  // Take the most recent `maxIntervals` completed intervals
  const recentIntervals = completedCycles
    .slice(-maxIntervals)
    .map((h) => h.cycleLengthDays as number);

  const completedCyclesCount = completedCycles.length;
  const intervalsUsedCount = recentIntervals.length;

  let averageCycleLength: number | null = null;
  let minCycleLength: number | null = null;
  let maxCycleLength: number | null = null;
  let cycleVariabilityDays: number | null = null;

  if (intervalsUsedCount > 0) {
    const sum = recentIntervals.reduce((acc, val) => acc + val, 0);
    averageCycleLength = Math.round((sum / intervalsUsedCount) * 10) / 10;
    minCycleLength = Math.min(...recentIntervals);
    maxCycleLength = Math.max(...recentIntervals);

    if (intervalsUsedCount > 1) {
      // Sample standard deviation
      const mean = sum / intervalsUsedCount;
      const variance =
        recentIntervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        (intervalsUsedCount - 1);
      cycleVariabilityDays = Math.round(Math.sqrt(variance) * 10) / 10;
    } else {
      cycleVariabilityDays = 0;
    }
  }

  // Period duration average
  const validDurations = history
    .filter((h) => h.periodDurationDays !== null && h.periodDurationDays >= 1 && h.periodDurationDays <= 15)
    .map((h) => h.periodDurationDays as number);

  let averagePeriodDuration: number | null = null;
  if (validDurations.length > 0) {
    const sumDurations = validDurations.reduce((a, b) => a + b, 0);
    averagePeriodDuration = Math.round((sumDurations / validDurations.length) * 10) / 10;
  }

  // Data quality assessment
  let dataQuality: 'insufficient' | 'emerging' | 'solid' = 'insufficient';
  if (intervalsUsedCount >= 3) {
    dataQuality = 'solid';
  } else if (intervalsUsedCount >= 1) {
    dataQuality = 'emerging';
  }

  return {
    recordedPeriodsCount,
    completedCyclesCount,
    averageCycleLength,
    averagePeriodDuration,
    minCycleLength,
    maxCycleLength,
    cycleVariabilityDays,
    intervalsUsedCount,
    hasSufficientData: intervalsUsedCount >= 1,
    dataQuality,
  };
}

// -------------------------------------------------------------
// Next Period Estimation
// -------------------------------------------------------------

/**
 * Estimates the upcoming period start and end dates based on the latest recorded period
 * and the user's personal average (or fallback baseline).
 */
export function estimateUpcomingPeriod(
  records: CycleRecord[],
  stats: CycleStatistics,
  fallbackBaselineCycleLength = 28,
  fallbackBaselinePeriodDuration = 5,
  currentDateStr = formatUTCToISODate(new Date())
): NextPeriodEstimate {
  if (!records || records.length === 0) {
    return {
      estimatedStartDate: null,
      estimatedEndDate: null,
      daysUntilEstimate: null,
      confidence: null,
      explanation: 'No period recorded yet. Log your first period start date to begin cycle estimates.',
      isBasedOnPersonalAverage: false,
    };
  }

  // Sort descending to find the latest recorded period start
  const sortedDesc = [...records].sort((a, b) =>
    b.period_start.localeCompare(a.period_start)
  );
  const latest = sortedDesc[0];

  const cycleDaysToUse = stats.averageCycleLength ?? fallbackBaselineCycleLength;
  const periodDurationToUse = stats.averagePeriodDuration ?? fallbackBaselinePeriodDuration;
  const isPersonal = stats.hasSufficientData && stats.averageCycleLength !== null;

  const estimatedStartDate = addDaysToISODate(latest.period_start, Math.round(cycleDaysToUse));
  const estimatedEndDate = addDaysToISODate(estimatedStartDate, Math.round(periodDurationToUse) - 1);
  const daysUntilEstimate = differenceInCalendarDays(currentDateStr, estimatedStartDate);

  let confidence: 'low' | 'moderate' | 'high' = 'low';
  let explanation = '';

  if (stats.dataQuality === 'solid') {
    confidence = (stats.cycleVariabilityDays ?? 0) <= 3.5 ? 'high' : 'moderate';
    explanation = `Estimated using your rolling average of ${cycleDaysToUse} days across ${stats.intervalsUsedCount} cycles (variability ±${stats.cycleVariabilityDays ?? 0} days).`;
  } else if (stats.dataQuality === 'emerging') {
    confidence = 'moderate';
    explanation = `Estimated using your initial recorded cycle interval (${cycleDaysToUse} days). Confidence will improve as more cycles are logged.`;
  } else {
    confidence = 'low';
    explanation = `Estimated using standard ${fallbackBaselineCycleLength}-day baseline from your latest logged period (${latest.period_start}). Log 2+ periods to personalize.`;
  }

  return {
    estimatedStartDate,
    estimatedEndDate,
    daysUntilEstimate,
    confidence,
    explanation,
    isBasedOnPersonalAverage: isPersonal,
  };
}

// -------------------------------------------------------------
// Current Cycle Day
// -------------------------------------------------------------

/**
 * Calculates current cycle day relative to latest period start.
 * Day 1 = period start date.
 */
export function getCurrentCycleDay(
  records: CycleRecord[],
  currentDateStr = formatUTCToISODate(new Date())
): { currentCycleDay: number | null; isLatestPeriodOngoing: boolean; latestStart: string | null } {
  if (!records || records.length === 0) {
    return { currentCycleDay: null, isLatestPeriodOngoing: false, latestStart: null };
  }

  const sortedDesc = [...records].sort((a, b) =>
    b.period_start.localeCompare(a.period_start)
  );
  const latest = sortedDesc[0];

  const diffDays = differenceInCalendarDays(latest.period_start, currentDateStr);

  if (diffDays < 0) {
    // Latest period is recorded in the future
    return { currentCycleDay: null, isLatestPeriodOngoing: latest.period_end === null, latestStart: latest.period_start };
  }

  const currentCycleDay = diffDays + 1; // 1-indexed (Day 1 is start date)

  return {
    currentCycleDay,
    isLatestPeriodOngoing: latest.period_end === null,
    latestStart: latest.period_start,
  };
}

// -------------------------------------------------------------
// Aliases for developer convenience
// -------------------------------------------------------------
export type CycleStats = CycleStatistics;
export type PredictionResult = NextPeriodEstimate;
export const calculateCycleStats = calculateCycleStatistics;
export const predictNextPeriod = estimateUpcomingPeriod;

export function hasDateConflict(
  periodStart: string,
  periodEnd: string | null = null,
  existingRecords: CycleRecord[] = [],
  currentRecordId?: string
): { hasConflict: boolean; reason?: string } {
  const result = validatePeriodDates(periodStart, periodEnd, existingRecords, currentRecordId);
  return {
    hasConflict: !result.isValid,
    reason: result.error,
  };
}

