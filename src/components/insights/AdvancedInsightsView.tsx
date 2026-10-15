'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useCycleData } from '@/context/CycleDataContext';
import { InsightDateRange } from '@/types';
import {
  generateAdvancedInsights,
  AdvancedInsightsSummary,
} from '@/lib/insights/advancedInsights';
import {
  Calendar,
  Flame,
  Award,
  Smile,
  Moon,
  Zap,
  Activity,
  ArrowRightLeft,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const DATE_RANGE_OPTIONS: { id: InsightDateRange; label: string }[] = [
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '180d', label: 'Last 6 Months' },
  { id: 'all', label: 'All History' },
];

export const AdvancedInsightsView: React.FC = () => {
  const { dailyLogs, isDemoMode } = useCycleData();
  const [selectedRange, setSelectedRange] = useState<InsightDateRange>('30d');

  // In demo mode use simulated date, in real mode use today's actual date
  const referenceDate = useMemo(() => {
    return isDemoMode ? '2026-10-01' : new Date().toISOString().slice(0, 10);
  }, [isDemoMode]);

  // Compute insights dynamically based on selected date range
  const insights: AdvancedInsightsSummary = useMemo(() => {
    return generateAdvancedInsights(dailyLogs, selectedRange, referenceDate);
  }, [dailyLogs, selectedRange, referenceDate]);

  const hasLogs = dailyLogs.length > 0;
  const hasRangeLogs = insights.recordsUsedCount > 0;

  if (!hasLogs) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-oviareBorder shadow-subtle">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-plum shrink-0" />
          <div>
            <span className="text-xs font-semibold text-oviareText-primary block">
              Analysis Window
            </span>
            <span className="text-[11px] text-oviareText-secondary">
              {insights.rangeBounds.label} ({insights.rangeBounds.startDate} &rarr; {insights.rangeBounds.endDate})
            </span>
          </div>
        </div>

        {/* Range Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedRange(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedRange === opt.id
                  ? 'bg-plum text-white shadow-subtle'
                  : 'bg-ivory-100 text-oviareText-secondary hover:text-oviareText-primary hover:bg-ivory-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Used Summary Tag */}
      <div className="flex items-center justify-between text-xs text-oviareText-secondary px-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sage" />
          <span>
            Calculated from <strong>{insights.recordsUsedCount}</strong> check-in {insights.recordsUsedCount === 1 ? 'entry' : 'entries'} across {insights.rangeBounds.totalDays} calendar days
          </span>
        </span>
        {isDemoMode && (
          <span className="text-[11px] text-plum font-medium">Demo Model Dataset</span>
        )}
      </div>

      {!hasRangeLogs ? (
        <Card variant="default" padding="lg" className="text-center py-8">
          <p className="text-xs text-oviareText-secondary max-w-md mx-auto leading-relaxed">
            No daily check-ins recorded within the selected window ({insights.rangeBounds.label}). Try selecting &ldquo;All History&rdquo; or record a new daily check-in.
          </p>
        </Card>
      ) : (
        <>
          {/* 1. Logging Consistency & Habits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage" /> Logged Days
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {insights.consistency.totalLoggedDays}
                <span className="text-xs font-sans text-oviareText-secondary ml-1">
                  / {insights.rangeBounds.totalDays}d
                </span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Total recorded check-ins
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-plum" /> Consistency Rate
              </span>
              <p className="font-serif text-2xl font-medium text-plum">
                {insights.consistency.consistencyPercentage}%
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Check-in frequency
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" /> Current Streak
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {insights.consistency.currentStreakDays}
                <span className="text-xs font-sans text-oviareText-secondary ml-1">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Consecutive check-ins
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-sage" /> Longest Streak
              </span>
              <p className="font-serif text-2xl font-medium text-sage">
                {insights.consistency.longestStreakDays}
                <span className="text-xs font-sans text-oviareText-secondary ml-1">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Personal best streak
              </span>
            </Card>
          </div>

          {/* 2. Mood & Emotional Trends */}
          <Card variant="default" padding="md" className="space-y-4">
            <CardHeader
              title="Emotional Distribution"
              subtitle="Observed mood patterns across the selected window"
              action={
                <Badge variant="mauve" size="sm">
                  {insights.moods.length} Mood Types
                </Badge>
              }
            />

            {insights.moods.length === 0 ? (
              <p className="text-xs text-oviareText-secondary py-2">
                No moods logged in this time range.
              </p>
            ) : (
              <div className="space-y-2.5">
                {insights.moods.slice(0, 6).map((m) => (
                  <div key={m.mood} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-medium text-oviareText-primary">
                        {m.label}
                      </span>
                      <span className="text-oviareText-secondary">
                        {m.count} {m.count === 1 ? 'time' : 'times'} ({m.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-ivory-200 overflow-hidden">
                      <div
                        className="h-full bg-plum rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, m.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 3. Sleep & Vitality Trends Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sleep Summary */}
            <Card variant="default" padding="md" className="space-y-4">
              <CardHeader
                title="Sleep Duration & Rest Quality"
                subtitle="Self-reported sleep hours and restfulness"
              />

              <div className="flex items-baseline gap-3">
                <div className="font-serif text-3xl font-medium text-oviareText-primary">
                  {insights.sleep.averageDurationHours !== null
                    ? `${insights.sleep.averageDurationHours} hrs`
                    : '—'}
                </div>
                <span className="text-xs text-oviareText-secondary">
                  average nightly rest ({insights.sleep.totalLoggedSleepDays} logs)
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-oviareBorder/70">
                <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
                  Quality Breakdown
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block uppercase">Poor</span>
                    <span className="font-serif text-sm font-semibold text-oviareText-primary">
                      {insights.sleep.qualityBreakdown.poor}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block uppercase">Fair</span>
                    <span className="font-serif text-sm font-semibold text-oviareText-primary">
                      {insights.sleep.qualityBreakdown.fair}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block uppercase">Good</span>
                    <span className="font-serif text-sm font-semibold text-oviareText-primary">
                      {insights.sleep.qualityBreakdown.good}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block uppercase">Excellent</span>
                    <span className="font-serif text-sm font-semibold text-oviareText-primary">
                      {insights.sleep.qualityBreakdown.excellent}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vitality Summary */}
            <Card variant="default" padding="md" className="space-y-4">
              <CardHeader
                title="Vitality & Energy Scale"
                subtitle="Daily self-reported energy ratings (1 to 5)"
              />

              <div className="flex items-baseline gap-3">
                <div className="font-serif text-3xl font-medium text-sage">
                  {insights.energy.averageScore !== null
                    ? `${insights.energy.averageScore} / 5`
                    : '—'}
                </div>
                <span className="text-xs text-oviareText-secondary">
                  average vitality score ({insights.energy.totalLoggedEnergyDays} logs)
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-oviareBorder/70">
                <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
                  Energy Distribution
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block">1: Low</span>
                    <span className="font-semibold text-oviareText-primary">
                      {insights.energy.distribution.score1}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block">2</span>
                    <span className="font-semibold text-oviareText-primary">
                      {insights.energy.distribution.score2}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block">3: Mod</span>
                    <span className="font-semibold text-oviareText-primary">
                      {insights.energy.distribution.score3}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block">4</span>
                    <span className="font-semibold text-oviareText-primary">
                      {insights.energy.distribution.score4}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
                    <span className="text-[10px] text-oviareText-muted block">5: High</span>
                    <span className="font-semibold text-oviareText-primary">
                      {insights.energy.distribution.score5}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 4. Top Reported Symptoms with Severity Breakdown */}
          <Card variant="default" padding="md" className="space-y-4">
            <CardHeader
              title="Symptom Frequencies & Severity Distribution"
              subtitle="Physical sensations logged in this window with severity levels"
              action={
                <Badge variant="sage" size="sm">
                  {insights.symptoms.length} Symptoms Recorded
                </Badge>
              }
            />

            {insights.symptoms.length === 0 ? (
              <p className="text-xs text-oviareText-secondary py-2">
                No symptoms recorded in this selected window.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.symptoms.slice(0, 8).map((s) => (
                  <div
                    key={s.symptomName}
                    className="p-3.5 rounded-xl border border-oviareBorder bg-white space-y-2 hover:bg-ivory-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize text-oviareText-primary">
                        {s.symptomName.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-medium text-plum">
                        {s.totalOccurrences} {s.totalOccurrences === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    {/* Severity chips */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {s.severityBreakdown.mild > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-sage-subtle text-sage font-medium">
                          Mild: {s.severityBreakdown.mild}
                        </span>
                      )}
                      {s.severityBreakdown.moderate > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-mauve/50 text-plum font-medium">
                          Mod: {s.severityBreakdown.moderate}
                        </span>
                      )}
                      {s.severityBreakdown.severe > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-medium">
                          Sev: {s.severityBreakdown.severe}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 5. Comparative Period Analysis */}
          <Card variant="default" padding="md" className="space-y-4">
            <CardHeader
              title="Comparative Period Trends"
              subtitle="Notice subtle changes between this time period and the preceding window"
              action={
                <div className="flex items-center gap-1.5 text-xs text-plum font-medium">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Comparative Window</span>
                </div>
              }
            />

            {!insights.comparison.hasSufficientComparativeData ? (
              <div className="p-4 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary space-y-1 leading-relaxed">
                <span className="font-medium text-oviareText-primary block">
                  Comparative analysis requires observations in both windows
                </span>
                <p>
                  Oviare compares your current {insights.rangeBounds.totalDays}-day window against the immediately preceding {insights.rangeBounds.totalDays}-day period. As you continue your daily tracking, comparative trends in sleep, energy, and symptoms will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-oviareBorder bg-white space-y-1">
                  <span className="text-[11px] font-semibold text-oviareText-secondary block uppercase">
                    Check-in Count
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-oviareText-muted block">Current</span>
                      <span className="font-serif text-lg font-medium text-oviareText-primary">
                        {insights.comparison.currentCheckinsCount}d
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-oviareText-muted block">Previous</span>
                      <span className="font-serif text-lg font-medium text-oviareText-secondary">
                        {insights.comparison.previousCheckinsCount}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-oviareBorder bg-white space-y-1">
                  <span className="text-[11px] font-semibold text-oviareText-secondary block uppercase">
                    Average Rest
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-oviareText-muted block">Current</span>
                      <span className="font-serif text-lg font-medium text-oviareText-primary">
                        {insights.comparison.averageSleepHoursCurrent !== null
                          ? `${insights.comparison.averageSleepHoursCurrent}h`
                          : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-oviareText-muted block">Previous</span>
                      <span className="font-serif text-lg font-medium text-oviareText-secondary">
                        {insights.comparison.averageSleepHoursPrevious !== null
                          ? `${insights.comparison.averageSleepHoursPrevious}h`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-oviareBorder bg-white space-y-1">
                  <span className="text-[11px] font-semibold text-oviareText-secondary block uppercase">
                    Average Energy
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-oviareText-muted block">Current</span>
                      <span className="font-serif text-lg font-medium text-sage">
                        {insights.comparison.averageEnergyCurrent !== null
                          ? `${insights.comparison.averageEnergyCurrent}/5`
                          : '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-oviareText-muted block">Previous</span>
                      <span className="font-serif text-lg font-medium text-oviareText-secondary">
                        {insights.comparison.averageEnergyPrevious !== null
                          ? `${insights.comparison.averageEnergyPrevious}/5`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
