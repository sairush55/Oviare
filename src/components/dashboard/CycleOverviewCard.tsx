'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, Plus, Calendar, Clock } from 'lucide-react';
import { useCycleData } from '@/context/CycleDataContext';

export const CycleOverviewCard: React.FC = () => {
  const { entries, preferences, demoMode } = useCycleData();

  const hasData = entries.length > 0;
  const isDemo = demoMode && entries.some((e) => e.isPrototypeSample);

  // In demo mode or with entries, compute mock cycle position
  const cycleLength = preferences.averageCycleLength;
  const currentCycleDay = 24; // Representative sample day in luteal phase
  const daysUntilNextPeriod = cycleLength - currentCycleDay;
  const percentage = Math.round((currentCycleDay / cycleLength) * 100);

  if (!hasData) {
    return (
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
              Oviare starts learning your personal baseline once you log your first period day or daily symptoms.
            </p>
          </div>
          <Link href="/log">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Log first entry
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
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
                {currentCycleDay}
              </span>
              <span className="text-[11px] text-oviareText-secondary">
                of {cycleLength} days
              </span>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-oviareText-secondary">
              <span className="w-2 h-2 rounded-full bg-plum" />
              Luteal Phase <span className="text-[10px] text-oviareText-muted">(Est.)</span>
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
              Next period estimated in {daysUntilNextPeriod} days
            </h2>
            <p className="text-xs text-oviareText-secondary mt-1">
              Estimated window begins ~October 5. Calculations are informational estimates, not medical predictions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Cycle Length
              </span>
              <span className="font-medium text-sm text-oviareText-primary mt-0.5 block">
                {cycleLength} days average
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Period Duration
              </span>
              <span className="font-medium text-sm text-oviareText-primary mt-0.5 block">
                {preferences.averagePeriodLength} days average
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder col-span-2 sm:col-span-1">
              <span className="text-[11px] text-oviareText-secondary block">
                Fertile Window
              </span>
              <span className="font-medium text-sm text-sage mt-0.5 block">
                Past for this cycle
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/log">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Log Today's Symptoms
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                View Monthly Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
