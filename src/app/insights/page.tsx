'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CycleLengthChart } from '@/components/insights/CycleLengthChart';
import { SymptomFrequencyChart } from '@/components/insights/SymptomFrequencyChart';
import { WellnessSummaryCards } from '@/components/insights/WellnessSummaryCards';
import { EducationalInsightList } from '@/components/insights/EducationalInsightList';
import { useCycleData } from '@/context/CycleDataContext';
import { BarChart2, PlusCircle, Activity, Sparkles, ShieldAlert, LogOut } from 'lucide-react';

export default function InsightsPage() {
  const {
    dailyLogs,
    cycleRecords,
    cycleStats,
    isDemoMode,
    exitDemo,
    preferences,
  } = useCycleData();

  const hasData = dailyLogs.length > 0 || cycleRecords.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Cycle Insights & Trends"
        subtitle="Understand recurring rhythm markers, variations, and physical patterns over time"
        badge={
          isDemoMode ? (
            <Badge variant="sample" size="sm">
              Demo Model
            </Badge>
          ) : (
            <Badge variant="sage" size="sm">
              Personal Data
            </Badge>
          )
        }
        action={
          <div className="flex items-center gap-2">
            {isDemoMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={exitDemo}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Exit Demo
              </Button>
            )}
            <Link href="/log">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Log Entry
              </Button>
            </Link>
          </div>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={<BarChart2 className="w-7 h-7 text-plum" />}
          title="Insights appear after your first recorded cycle or daily entry"
          description="Oviare requires at least one logged cycle or daily check-in to calculate personal rhythm averages, symptom patterns, and duration trends. Start recording today to discover your personal rhythm."
          actionLabel="Log today's wellness"
          onAction={() => window.location.href = '/log'}
        />
      ) : (
        <>
          {/* Cycle Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Average Cycle Length
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {cycleStats.averageCycleLength ?? preferences.averageCycleLength}{' '}
                <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                {cycleStats.hasSufficientData ? 'Rolling average' : 'Standard baseline'}
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Average Period Duration
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {cycleStats.averagePeriodDuration ?? preferences.averagePeriodLength}{' '}
                <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Recorded duration
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Cycle Variation
              </span>
              <p className="font-serif text-2xl font-medium text-sage">
                {cycleStats.cycleVariabilityDays !== null
                  ? `±${cycleStats.cycleVariabilityDays}`
                  : '—'}{' '}
                <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                {cycleStats.intervalsUsedCount > 1 ? 'Standard deviation' : 'Needs 2+ cycles'}
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Tracked Cycles
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {cycleStats.completedCyclesCount}{' '}
                <span className="text-xs font-sans text-oviareText-secondary">cycles</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                {isDemoMode ? 'Sample history' : 'Personal records'}
              </span>
            </Card>
          </div>

          {/* Daily Wellness Summary Cards */}
          <WellnessSummaryCards />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CycleLengthChart />
            <SymptomFrequencyChart />
          </div>

          {/* Educational Insights List */}
          <section className="pt-2">
            <EducationalInsightList />
          </section>

          {/* Boundary Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary">
            <ShieldAlert className="w-4 h-4 text-plum shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-oviareText-primary font-medium">Informational boundary:</strong>{' '}
              Oviare analytics are designed exclusively to help you notice personal patterns and bodily rhythms. They do not constitute clinical evaluations, diagnostic findings, or fertility guarantees.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
