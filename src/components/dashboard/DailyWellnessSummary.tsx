'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { HeartHandshake, Plus, Moon, Activity, Smile, Droplet, Star } from 'lucide-react';

export const DailyWellnessSummary: React.FC = () => {
  const { getDailyLog, currentCycleDay, cycleRecords } = useCycleData();

  // Reference today date string
  const todayStr = '2026-10-01';
  const todayLog = getDailyLog(todayStr);

  // Check if today is a recorded period day
  const isPeriodToday = cycleRecords.some((r) => {
    const start = r.period_start;
    const end = r.period_end || r.period_start;
    return todayStr >= start && todayStr <= end;
  });

  const subtitle = currentCycleDay !== null
    ? `Thursday, October 1 • Cycle Day ${currentCycleDay}`
    : 'Thursday, October 1 • Listening to your rhythm';

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Today's Wellness"
        subtitle={subtitle}
        action={
          <Link href={`/log?date=${todayStr}`}>
            <Button
              variant={todayLog ? 'outline' : 'primary'}
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {todayLog ? 'Update Today' : 'Log Entry'}
            </Button>
          </Link>
        }
      />

      {todayLog ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Period Status */}
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Droplet className="w-3.5 h-3.5 text-plum" />
                <span>Period Flow</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1">
                {isPeriodToday ? 'Active bleeding' : 'None today'}
              </p>
            </div>

            {/* Mood */}
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Smile className="w-3.5 h-3.5 text-plum" />
                <span>Mood</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1 truncate">
                {todayLog.moods.length > 0
                  ? todayLog.moods.map((m) => m.replace(/_/g, ' ')).join(', ')
                  : 'Balanced'}
              </p>
            </div>

            {/* Sleep */}
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Moon className="w-3.5 h-3.5 text-plum" />
                <span>Sleep</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary mt-1">
                {todayLog.sleep_duration_minutes !== null
                  ? `${Math.round((todayLog.sleep_duration_minutes / 60) * 10) / 10} hrs`
                  : 'Not set'}
                {todayLog.sleep_quality && (
                  <span className="text-[11px] text-oviareText-secondary block capitalize font-normal">
                    {todayLog.sleep_quality} quality
                  </span>
                )}
              </p>
            </div>

            {/* Energy */}
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
                <Activity className="w-3.5 h-3.5 text-plum" />
                <span>Energy</span>
              </div>
              <p className="font-medium text-sm text-oviareText-primary capitalize mt-1">
                {todayLog.energy_level !== null ? `${todayLog.energy_level} / 5` : 'Not set'}
              </p>
            </div>
          </div>

          {todayLog.symptoms && todayLog.symptoms.length > 0 && (
            <div className="pt-1">
              <span className="text-xs text-oviareText-secondary block mb-1.5 font-medium">
                Noted Symptoms ({todayLog.symptoms.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {todayLog.symptoms.map((s) => (
                  <Badge key={s.symptom_name} variant="mauve" size="sm" className="capitalize">
                    {s.symptom_name.replace(/_/g, ' ')} ({s.severity})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {todayLog.notes && (
            <p className="text-xs text-oviareText-secondary italic bg-ivory-50 p-2.5 rounded-xl border border-oviareBorder/60">
              "{todayLog.notes}"
            </p>
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
                Take a quiet moment to record any physical sensations or emotional reflections.
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
