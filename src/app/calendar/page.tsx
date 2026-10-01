'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarLegend } from '@/components/calendar/CalendarLegend';
import { Button } from '@/components/ui/Button';
import { PlusCircle, ShieldAlert } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Cycle Calendar"
        subtitle="Track observed patterns and view estimated cycle phases across each month"
        action={
          <Link href="/log">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Log Symptoms
            </Button>
          </Link>
        }
      />

      {/* Legend */}
      <CalendarLegend />

      {/* Main Interactive Monthly View with Suspense */}
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-oviareText-secondary">
            Loading monthly calendar...
          </div>
        }
      >
        <CalendarMonthView />
      </Suspense>

      {/* Health Boundaries Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary">
        <ShieldAlert className="w-4 h-4 text-plum shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-oviareText-primary font-medium">Important note:</strong>{' '}
          All ovulation windows and predicted period dates shown in the calendar are estimated algorithmic calculations based on standard cycle variations. They are provided solely for personal rhythm awareness and should not be used as contraception or medical guidance.
        </p>
      </div>
    </div>
  );
}
