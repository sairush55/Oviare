'use client';

import React, { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QuickLogForm } from '@/components/log/QuickLogForm';
import { Badge } from '@/components/ui/Badge';

export default function LogPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Daily Wellness Log"
        subtitle="Log observed physical sensations, flow, emotional mood, and vitality"
        badge={
          <Badge variant="neutral" size="sm">
            Temporary Session State
          </Badge>
        }
      />

      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-oviareText-secondary">
            Loading logging interface...
          </div>
        }
      >
        <QuickLogForm />
      </Suspense>
    </div>
  );
}
