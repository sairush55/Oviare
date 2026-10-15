import { DailyLogRecord, InsightDateRange, SymptomSeverity, MoodType, SleepQuality } from '@/types';

export interface DateRangeBounds {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  label: string;
}

export interface LoggingConsistency {
  totalLoggedDays: number;
  totalDaysInRange: number;
  consistencyPercentage: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface SymptomFrequencyItem {
  symptomName: string;
  totalOccurrences: number;
  percentageOfLoggedDays: number;
  severityBreakdown: {
    mild: number;
    moderate: number;
    severe: number;
  };
}

export interface MoodDistributionItem {
  mood: MoodType;
  label: string;
  count: number;
  percentage: number;
}

export interface SleepQualityDistribution {
  poor: number;
  fair: number;
  good: number;
  excellent: number;
}

export interface SleepInsights {
  totalLoggedSleepDays: number;
  averageDurationHours: number | null;
  averageDurationMinutes: number | null;
  qualityBreakdown: SleepQualityDistribution;
  mostCommonQuality: SleepQuality | null;
}

export interface EnergyInsights {
  totalLoggedEnergyDays: number;
  averageScore: number | null; // 1.0 - 5.0
  distribution: {
    score1: number;
    score2: number;
    score3: number;
    score4: number;
    score5: number;
  };
}

export interface ComparativePeriodComparison {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentCheckinsCount: number;
  previousCheckinsCount: number;
  topSymptomCurrent: string | null;
  topSymptomPrevious: string | null;
  averageSleepHoursCurrent: number | null;
  averageSleepHoursPrevious: number | null;
  averageEnergyCurrent: number | null;
  averageEnergyPrevious: number | null;
  hasSufficientComparativeData: boolean;
}

export interface AdvancedInsightsSummary {
  dateRange: InsightDateRange;
  rangeBounds: DateRangeBounds;
  recordsUsedCount: number;
  consistency: LoggingConsistency;
  symptoms: SymptomFrequencyItem[];
  moods: MoodDistributionItem[];
  sleep: SleepInsights;
  energy: EnergyInsights;
  comparison: ComparativePeriodComparison;
}

/**
 * Compute the date boundaries for a selected range relative to a reference date.
 * Uses UTC date calculations to avoid local midnight shifts.
 */
export function getDateRangeBounds(
  range: InsightDateRange,
  referenceDateStr: string = '2026-10-01',
  customStart?: string,
  customEnd?: string
): DateRangeBounds {
  if (range === 'custom' && customStart && customEnd) {
    const startMs = Date.parse(`${customStart}T00:00:00Z`);
    const endMs = Date.parse(`${customEnd}T00:00:00Z`);
    const days = Math.max(1, Math.round((endMs - startMs) / (86400 * 1000)) + 1);
    return {
      startDate: customStart,
      endDate: customEnd,
      totalDays: days,
      label: `${customStart} to ${customEnd}`,
    };
  }

  const ref = new Date(`${referenceDateStr}T00:00:00Z`);
  let daysBack = 30;
  let label = 'Last 30 Days';

  if (range === '90d') {
    daysBack = 90;
    label = 'Last 90 Days';
  } else if (range === '180d') {
    daysBack = 180;
    label = 'Last 6 Months';
  } else if (range === 'all') {
    daysBack = 365;
    label = 'All Recorded History';
  }

  const start = new Date(ref.getTime() - (daysBack - 1) * 86400 * 1000);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = referenceDateStr;

  return {
    startDate,
    endDate,
    totalDays: daysBack,
    label,
  };
}

/**
 * Filter daily logs to those occurring within the specified date boundaries (inclusive).
 */
export function filterLogsByDateRange(
  logs: DailyLogRecord[],
  startDate: string,
  endDate: string
): DailyLogRecord[] {
  return logs.filter((log) => log.log_date >= startDate && log.log_date <= endDate);
}

/**
 * Calculate logging consistency and streaks.
 */
export function calculateLoggingConsistency(
  filteredLogs: DailyLogRecord[],
  totalDaysInRange: number,
  referenceDateStr: string = '2026-10-01'
): LoggingConsistency {
  const uniqueDates = Array.from(new Set(filteredLogs.map((l) => l.log_date))).sort();
  const totalLoggedDays = uniqueDates.length;
  const consistencyPercentage =
    totalDaysInRange > 0
      ? Math.min(100, Math.round((totalLoggedDays / totalDaysInRange) * 100))
      : 0;

  if (uniqueDates.length === 0) {
    return {
      totalLoggedDays: 0,
      totalDaysInRange,
      consistencyPercentage: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
    };
  }

  // Calculate streaks across consecutive days
  const dateSet = new Set(uniqueDates);
  let longestStreak = 0;
  let currentRun = 0;

  // Compute longest streak
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prev = new Date(`${uniqueDates[i - 1]}T00:00:00Z`).getTime();
      const curr = new Date(`${uniqueDates[i]}T00:00:00Z`).getTime();
      const diffDays = Math.round((curr - prev) / (86400 * 1000));
      if (diffDays === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // Calculate current streak backwards from reference date
  let currentStreak = 0;
  let checkTime = new Date(`${referenceDateStr}T00:00:00Z`).getTime();

  while (true) {
    const checkDateStr = new Date(checkTime).toISOString().slice(0, 10);
    if (dateSet.has(checkDateStr)) {
      currentStreak += 1;
      checkTime -= 86400 * 1000;
    } else {
      break;
    }
  }

  return {
    totalLoggedDays,
    totalDaysInRange,
    consistencyPercentage,
    currentStreakDays: currentStreak,
    longestStreakDays: Math.max(longestStreak, currentStreak),
  };
}

/**
 * Compute symptom frequencies and severity breakdowns.
 */
export function calculateSymptomInsights(
  logs: DailyLogRecord[]
): SymptomFrequencyItem[] {
  const map: Record<
    string,
    { total: number; mild: number; moderate: number; severe: number }
  > = {};
  const totalLogs = logs.length;

  for (const log of logs) {
    for (const symp of log.symptoms || []) {
      const name = symp.symptom_name;
      if (!map[name]) {
        map[name] = { total: 0, mild: 0, moderate: 0, severe: 0 };
      }
      map[name].total += 1;
      if (symp.severity === 'mild') map[name].mild += 1;
      else if (symp.severity === 'moderate') map[name].moderate += 1;
      else if (symp.severity === 'severe') map[name].severe += 1;
    }
  }

  const results: SymptomFrequencyItem[] = Object.entries(map).map(([symptomName, stats]) => ({
    symptomName,
    totalOccurrences: stats.total,
    percentageOfLoggedDays:
      totalLogs > 0 ? Math.round((stats.total / totalLogs) * 100) : 0,
    severityBreakdown: {
      mild: stats.mild,
      moderate: stats.moderate,
      severe: stats.severe,
    },
  }));

  // Sort descending by total occurrences
  return results.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

/**
 * Compute mood distribution.
 */
export function calculateMoodInsights(logs: DailyLogRecord[]): MoodDistributionItem[] {
  const counts: Record<string, number> = {};
  let totalMoodOccurrences = 0;

  for (const log of logs) {
    for (const mood of log.moods || []) {
      counts[mood] = (counts[mood] || 0) + 1;
      totalMoodOccurrences += 1;
    }
  }

  const results: MoodDistributionItem[] = Object.entries(counts).map(([mood, count]) => ({
    mood: mood as MoodType,
    label: mood.replace(/_/g, ' '),
    count,
    percentage:
      totalMoodOccurrences > 0
        ? Math.round((count / totalMoodOccurrences) * 100)
        : 0,
  }));

  return results.sort((a, b) => b.count - a.count);
}

/**
 * Compute sleep metrics and quality distribution.
 */
export function calculateSleepInsights(logs: DailyLogRecord[]): SleepInsights {
  const sleepLogs = logs.filter((l) => l.sleep_duration_minutes !== null && l.sleep_duration_minutes !== undefined);
  const totalLoggedSleepDays = sleepLogs.length;

  if (totalLoggedSleepDays === 0) {
    return {
      totalLoggedSleepDays: 0,
      averageDurationHours: null,
      averageDurationMinutes: null,
      qualityBreakdown: { poor: 0, fair: 0, good: 0, excellent: 0 },
      mostCommonQuality: null,
    };
  }

  const totalMinutes = sleepLogs.reduce(
    (sum, l) => sum + (l.sleep_duration_minutes || 0),
    0
  );
  const averageDurationMinutes = Math.round(totalMinutes / totalLoggedSleepDays);
  const averageDurationHours = Math.round((averageDurationMinutes / 60) * 10) / 10;

  const qualityBreakdown: SleepQualityDistribution = {
    poor: 0,
    fair: 0,
    good: 0,
    excellent: 0,
  };

  for (const log of logs) {
    if (log.sleep_quality && qualityBreakdown[log.sleep_quality] !== undefined) {
      qualityBreakdown[log.sleep_quality] += 1;
    }
  }

  let mostCommonQuality: SleepQuality | null = null;
  let maxQualityCount = 0;
  for (const [q, count] of Object.entries(qualityBreakdown) as [SleepQuality, number][]) {
    if (count > maxQualityCount) {
      maxQualityCount = count;
      mostCommonQuality = q;
    }
  }

  return {
    totalLoggedSleepDays,
    averageDurationHours,
    averageDurationMinutes,
    qualityBreakdown,
    mostCommonQuality,
  };
}

/**
 * Compute energy metrics and distribution.
 */
export function calculateEnergyInsights(logs: DailyLogRecord[]): EnergyInsights {
  const energyLogs = logs.filter((l) => l.energy_level !== null && l.energy_level !== undefined);
  const totalLoggedEnergyDays = energyLogs.length;

  const distribution = {
    score1: 0,
    score2: 0,
    score3: 0,
    score4: 0,
    score5: 0,
  };

  if (totalLoggedEnergyDays === 0) {
    return {
      totalLoggedEnergyDays: 0,
      averageScore: null,
      distribution,
    };
  }

  let totalScore = 0;
  for (const log of energyLogs) {
    const lvl = log.energy_level!;
    totalScore += lvl;
    if (lvl === 1) distribution.score1 += 1;
    else if (lvl === 2) distribution.score2 += 1;
    else if (lvl === 3) distribution.score3 += 1;
    else if (lvl === 4) distribution.score4 += 1;
    else if (lvl === 5) distribution.score5 += 1;
  }

  const averageScore = Math.round((totalScore / totalLoggedEnergyDays) * 10) / 10;

  return {
    totalLoggedEnergyDays,
    averageScore,
    distribution,
  };
}

/**
 * Compute comparative insights comparing the current time period with the immediately preceding equal period.
 */
export function calculateComparativeInsights(
  allLogs: DailyLogRecord[],
  currentBounds: DateRangeBounds
): ComparativePeriodComparison {
  const days = currentBounds.totalDays;

  // Calculate prior period boundaries of identical length
  const currentStartMs = Date.parse(`${currentBounds.startDate}T00:00:00Z`);
  const priorEndMs = currentStartMs - 86400 * 1000;
  const priorStartMs = priorEndMs - (days - 1) * 86400 * 1000;

  const priorStartDate = new Date(priorStartMs).toISOString().slice(0, 10);
  const priorEndDate = new Date(priorEndMs).toISOString().slice(0, 10);

  const currentLogs = filterLogsByDateRange(allLogs, currentBounds.startDate, currentBounds.endDate);
  const previousLogs = filterLogsByDateRange(allLogs, priorStartDate, priorEndDate);

  const currentCheckinsCount = currentLogs.length;
  const previousCheckinsCount = previousLogs.length;

  const hasSufficientComparativeData = currentCheckinsCount > 0 && previousCheckinsCount > 0;

  // Top symptoms
  const currentSymptoms = calculateSymptomInsights(currentLogs);
  const previousSymptoms = calculateSymptomInsights(previousLogs);

  // Sleep
  const currentSleep = calculateSleepInsights(currentLogs);
  const previousSleep = calculateSleepInsights(previousLogs);

  // Energy
  const currentEnergy = calculateEnergyInsights(currentLogs);
  const previousEnergy = calculateEnergyInsights(previousLogs);

  return {
    currentPeriodLabel: currentBounds.label,
    previousPeriodLabel: `Previous ${days} Days`,
    currentCheckinsCount,
    previousCheckinsCount,
    topSymptomCurrent: currentSymptoms[0]?.symptomName || null,
    topSymptomPrevious: previousSymptoms[0]?.symptomName || null,
    averageSleepHoursCurrent: currentSleep.averageDurationHours,
    averageSleepHoursPrevious: previousSleep.averageDurationHours,
    averageEnergyCurrent: currentEnergy.averageScore,
    averageEnergyPrevious: previousEnergy.averageScore,
    hasSufficientComparativeData,
  };
}

/**
 * Aggregator: Compute complete advanced personal insights for a date range.
 */
export function generateAdvancedInsights(
  allLogs: DailyLogRecord[],
  range: InsightDateRange,
  referenceDateStr: string = '2026-10-01',
  customStart?: string,
  customEnd?: string
): AdvancedInsightsSummary {
  const rangeBounds = getDateRangeBounds(range, referenceDateStr, customStart, customEnd);
  const filteredLogs = filterLogsByDateRange(allLogs, rangeBounds.startDate, rangeBounds.endDate);

  const consistency = calculateLoggingConsistency(filteredLogs, rangeBounds.totalDays, referenceDateStr);
  const symptoms = calculateSymptomInsights(filteredLogs);
  const moods = calculateMoodInsights(filteredLogs);
  const sleep = calculateSleepInsights(filteredLogs);
  const energy = calculateEnergyInsights(filteredLogs);
  const comparison = calculateComparativeInsights(allLogs, rangeBounds);

  return {
    dateRange: range,
    rangeBounds,
    recordsUsedCount: filteredLogs.length,
    consistency,
    symptoms,
    moods,
    sleep,
    energy,
    comparison,
  };
}
