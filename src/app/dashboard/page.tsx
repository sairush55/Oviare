'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CycleOverviewCard } from '@/components/dashboard/CycleOverviewCard';
import { CalendarMiniPreview } from '@/components/dashboard/CalendarMiniPreview';
import { DailyWellnessSummary } from '@/components/dashboard/DailyWellnessSummary';
import { UpcomingReminders } from '@/components/dashboard/UpcomingReminders';
import { EducationalCard } from '@/components/dashboard/EducationalCard';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Welcome to your rhythm"
        subtitle="Today is Thursday, October 1, 2026 • Cycle Day 24 (Estimated Luteal Phase)"
        action={
          <div className="flex items-center gap-2">
            <Link href="/calendar">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CalendarIcon className="w-3.5 h-3.5" />}
              >
                Calendar
              </Button>
            </Link>
            <Link href="/log">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Log Today
              </Button>
            </Link>
          </div>
        }
      />

      {/* Hero Cycle Overview */}
      <section aria-label="Cycle Overview">
        <CycleOverviewCard />
      </section>

      {/* Main Grid: Calendar preview & Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: 7 columns on desktop */}
        <div className="lg:col-span-7 space-y-6">
          <CalendarMiniPreview />
          <DailyWellnessSummary />
        </div>

        {/* Right column: 5 columns on desktop */}
        <div className="lg:col-span-5 space-y-6">
          <UpcomingReminders />
          <EducationalCard />
        </div>
      </div>
    </div>
  );
}
