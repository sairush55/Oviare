'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Plus, Calendar, Droplet, Sparkles } from 'lucide-react';
import { useCycleData } from '@/context/CycleDataContext';
import { PeriodLogModal } from '@/components/cycle/PeriodLogModal';

export const CycleOverviewCard: React.FC = () => {
  const {
    cycleRecords,
    currentCycleDay,
    cycleStats,
    nextPeriodPrediction,
    preferences,
    demoMode,
  } = useCycleData();

  const [isLogPeriodOpen, setIsLogPeriodOpen] = useState<boolean>(false);

  const hasRecords = cycleRecords.length > 0;
  const isDemo = demoMode && cycleRecords.some((r) => r.user_id === 'demo-user');

  // Cycle and period lengths (personal average or fallback baseline)
  const cycleLength = Math.round(cycleStats.averageCycleLength ?? preferences.averageCycleLength);
  const periodDuration = Math.round(cycleStats.averagePeriodDuration ?? preferences.averagePeriodLength);

  // Active cycle day & percentage for circular indicator
  const activeDay = currentCycleDay ?? 1;
  const percentage = Math.min(100, Math.max(0, Math.round((activeDay / cycleLength) * 100)));

  // Countdown to next period
  const daysUntilNext = nextPeriodPrediction.daysUntilEstimate;

  // Estimated Phase
  let phaseName = 'Follicular Phase';
  if (currentCycleDay !== null) {
    if (currentCycleDay <= periodDuration) {
      phaseName = 'Menstrual Phase';
    } else if (currentCycleDay >= cycleLength - 16 && currentCycleDay <= cycleLength - 12) {
      phaseName = 'Ovulation Window';
    } else if (currentCycleDay > cycleLength - 12) {
      phaseName = 'Luteal Phase';
    }
  }

  // Format estimated date
  const formatEstimatedDate = (iso: string | null) => {
    if (!iso) return '';
    try {
      const [y, m, d] = iso.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return iso;
    }
  };

  if (!hasRecords) {
    return (
      <>
        <Card variant="subtle-mauve" padding="lg" className="relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-md">
              <Badge variant="neutral" size="sm" className="mb-2">
                New Cycle Journey
              </Badge>
              <h2 className="font-serif text-2xl text-oviareText-primary font-medium tracking-tight">
                Begin listening to your body's rhythm
              </h2>
              <p className="mt-2 text-sm text-oviareText-secondary leading-relaxed">
                Oviare begins personalizing your rhythm calculations once you record your first period start date.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsLogPeriodOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Log First Period
              </Button>
            </div>
          </div>
        </Card>

        <PeriodLogModal
          isOpen={isLogPeriodOpen}
          onClose={() => setIsLogPeriodOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Card variant="default" padding="lg" className="relative overflow-hidden">
        {/* Sample data banner tag if showing demo data */}
        {isDemo && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <Badge variant="sample" size="sm">
              Sample Data
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left circular rhythm indicator */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG Cycle Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-mauve/50"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-plum transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs uppercase font-medium tracking-wider text-oviareText-secondary">
                  Day
                </span>
                <span className="font-serif text-3xl font-medium text-oviareText-primary">
                  {currentCycleDay !== null ? currentCycleDay : '—'}
                </span>
                <span className="text-[11px] text-oviareText-secondary">
                  of ~{cycleLength} days
                </span>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <span className="w-2 h-2 rounded-full bg-plum" />
                {phaseName} <span className="text-[10px] text-oviareText-muted">(Est.)</span>
              </span>
            </div>
          </div>

          {/* Right info & contextual metrics */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Current Cycle Status
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-oviareText-primary font-medium">
                {daysUntilNext !== null ? (
                  daysUntilNext > 0 ? (
                    `Next period estimated in ${daysUntilNext} days`
                  ) : daysUntilNext === 0 ? (
                    'Next period estimated today'
                  ) : (
                    `Period estimated ${Math.abs(daysUntilNext)} days ago`
                  )
                ) : (
                  'Next period estimated soon'
                )}
              </h2>
              <p className="text-xs text-oviareText-secondary mt-1">
                {nextPeriodPrediction.estimatedStartDate ? (
                  <>
                    Estimated window begins ~{formatEstimatedDate(nextPeriodPrediction.estimatedStartDate)}. {nextPeriodPrediction.explanation}
                  </>
                ) : (
                  nextPeriodPrediction.explanation
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary block">
                  Cycle Length
                </span>
                <span className="font-medium text-sm text-oviareText-primary mt-0.5 block">
                  {cycleStats.averageCycleLength
                    ? `${cycleStats.averageCycleLength} days avg`
                    : `${preferences.averageCycleLength} days (baseline)`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary block">
                  Period Duration
                </span>
                <span className="font-medium text-sm text-oviareText-primary mt-0.5 block">
                  {cycleStats.averagePeriodDuration
                    ? `${cycleStats.averagePeriodDuration} days avg`
                    : `${preferences.averagePeriodLength} days avg`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder col-span-2 sm:col-span-1">
                <span className="text-[11px] text-oviareText-secondary block">
                  Data Quality
                </span>
                <span className="font-medium text-sm text-sage capitalize mt-0.5 block">
                  {cycleStats.dataQuality} ({cycleStats.completedCyclesCount} cycles)
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLogPeriodOpen(true)}
                leftIcon={<Droplet className="w-3.5 h-3.5" />}
              >
                Log Period
              </Button>
              <Link href="/log">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Log Daily Symptoms
                </Button>
              </Link>
              <Link href="/calendar">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                >
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <PeriodLogModal
        isOpen={isLogPeriodOpen}
        onClose={() => setIsLogPeriodOpen(false)}
      />
    </>
  );
};
