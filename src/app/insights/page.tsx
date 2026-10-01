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
import { EducationalInsightList } from '@/components/insights/EducationalInsightList';
import { useCycleData } from '@/context/CycleDataContext';
import { BarChart2, PlusCircle, Activity, Sparkles, ShieldAlert } from 'lucide-react';

export default function InsightsPage() {
  const { entries, demoMode, setDemoMode, preferences } = useCycleData();

  const hasData = entries.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Cycle Insights & Trends"
        subtitle="Understand recurring rhythm markers, variations, and physical patterns over time"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoMode(!demoMode)}
            >
              {demoMode ? 'Hide Sample Preview' : 'Show Sample Preview'}
            </Button>
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
          title="Insights appear after your first recorded cycle"
          description="Oviare requires at least one logged cycle to calculate rhythm averages, symptom patterns, and duration trends. You can start logging or explore with sample data."
          actionLabel="Log today's symptoms"
          onAction={() => window.location.href = '/log'}
          secondaryActionLabel="Explore sample model"
          onSecondaryAction={() => setDemoMode(true)}
        />
      ) : (
        <>
          {/* Cycle Summary Stats Placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Average Cycle Length
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                28.2 <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Standard baseline
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Average Period Duration
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                {preferences.averagePeriodLength}.0 <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Consistent flow window
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Cycle Variation
              </span>
              <p className="font-serif text-2xl font-medium text-sage">
                ±1.2 <span className="text-xs font-sans text-oviareText-secondary">days</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                High regularity
              </span>
            </Card>

            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-[11px] font-medium text-oviareText-secondary">
                Tracked Cycles
              </span>
              <p className="font-serif text-2xl font-medium text-oviareText-primary">
                6 <span className="text-xs font-sans text-oviareText-secondary">cycles</span>
              </p>
              <span className="text-[10px] text-oviareText-muted block">
                Includes sample history
              </span>
            </Card>
          </div>

          {/* Sample Banner if in demo mode */}
          {demoMode && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  <strong>Sample Visualization Mode:</strong> Graphs below illustrate typical cycle variance and are not personal medical conclusions.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDemoMode(false)}
                className="underline hover:text-amber-950 font-medium shrink-0 ml-2"
              >
                Clear Sample Data
              </button>
            </div>
          )}

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
