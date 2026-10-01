'use client';

import React, { Suspense, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QuickLogForm } from '@/components/log/QuickLogForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PeriodLogModal } from '@/components/cycle/PeriodLogModal';
import { useCycleData } from '@/context/CycleDataContext';
import { Droplet, Lock } from 'lucide-react';

export default function LogPage() {
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState<boolean>(false);
  const { isDemoMode } = useCycleData();

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Daily Wellness Log"
        subtitle="Log observed physical sensations, emotional state, sleep quality, and vitality"
        badge={
          isDemoMode ? (
            <Badge variant="sample" size="sm">
              Demo Trial
            </Badge>
          ) : (
            <Badge variant="sage" size="sm" className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private & RLS Protected
            </Badge>
          )
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPeriodModalOpen(true)}
            leftIcon={<Droplet className="w-3.5 h-3.5 text-plum" />}
          >
            Log Menstrual Period
          </Button>
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

      <PeriodLogModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
      />
    </div>
  );
}
