'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { HeartHandshake, Plus, Moon, Activity, Smile, Droplet } from 'lucide-react';

export const DailyWellnessSummary: React.FC = () => {
  const { entries, getEntryForDate } = useCycleData();

  // Reference today date string
  const todayStr = '2026-10-01';
  const todayEntry = getEntryForDate(todayStr);

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Today's Wellness"
        subtitle="Thursday, October 1 • Day 24"
        action={
          <Link href={`/log?date=${todayStr}`}>
            <Button
              variant={todayEntry ? 'outline' : 'primary'}
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {todayEntry ? 'Update today' : 'Log entry'}
            </Button>
          </Link>
        }
      />

      {todayEntry ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Droplet className="w-3.5 h-3.5 text-plum" />
                <span>Flow</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1">
                {todayEntry.flow}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Smile className="w-3.5 h-3.5 text-plum" />
                <span>Mood</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1">
                {todayEntry.moods.length > 0
                  ? todayEntry.moods.map((m) => m.replace('_', ' ')).join(', ')
                  : 'Balanced'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Moon className="w-3.5 h-3.5 text-plum" />
                <span>Sleep</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary mt-1">
                {todayEntry.sleepHours ? `${todayEntry.sleepHours} hrs` : 'Not recorded'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Activity className="w-3.5 h-3.5 text-plum" />
                <span>Energy</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1">
                {todayEntry.energy || 'Moderate'}
              </p>
            </div>
          </div>

          {todayEntry.symptoms.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-oviareText-secondary block mb-1.5 font-medium">
                Noted Symptoms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {todayEntry.symptoms.map((s) => (
                  <Badge key={s} variant="mauve" size="sm">
                    {s.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mauve/40 flex items-center justify-center text-plum shrink-0">
              <HeartHandshake className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-medium text-oviareText-primary">
                No logs recorded yet for today
              </p>
              <p className="text-xs text-oviareText-secondary mt-0.5">
                Take a quiet moment to record any physical or emotional changes.
              </p>
            </div>
          </div>
          <Link href={`/log?date=${todayStr}`} className="shrink-0 w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Record quick check-in
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
