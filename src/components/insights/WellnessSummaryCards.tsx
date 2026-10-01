'use client';

import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { Moon, BatteryCharging, Smile, Calendar } from 'lucide-react';

export const WellnessSummaryCards: React.FC = () => {
  const { dailyLogs, isDemoMode } = useCycleData();

  const stats = useMemo(() => {
    if (dailyLogs.length === 0) return null;

    // Average sleep duration
    const sleepLogs = dailyLogs.filter((l) => l.sleep_duration_minutes !== null);
    let avgSleepHours: number | null = null;
    if (sleepLogs.length > 0) {
      const totalMinutes = sleepLogs.reduce((acc, l) => acc + (l.sleep_duration_minutes || 0), 0);
      avgSleepHours = Math.round((totalMinutes / sleepLogs.length / 60) * 10) / 10;
    }

    // Sleep quality breakdown
    const qualityLogs = dailyLogs.filter((l) => l.sleep_quality !== null);
    const restfulLogs = qualityLogs.filter((l) => l.sleep_quality === 'good' || l.sleep_quality === 'excellent');
    const restfulPercent = qualityLogs.length > 0 ? Math.round((restfulLogs.length / qualityLogs.length) * 100) : null;

    // Average energy level (1-5)
    const energyLogs = dailyLogs.filter((l) => l.energy_level !== null);
    let avgEnergy: number | null = null;
    if (energyLogs.length > 0) {
      const sumEnergy = energyLogs.reduce((acc, l) => acc + (l.energy_level || 0), 0);
      avgEnergy = Math.round((sumEnergy / energyLogs.length) * 10) / 10;
    }

    // Dominant mood
    const moodCounts: Record<string, number> = {};
    dailyLogs.forEach((l) => {
      (l.moods || []).forEach((m) => {
        moodCounts[m] = (moodCounts[m] || 0) + 1;
      });
    });
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const topMood = sortedMoods.length > 0 ? sortedMoods[0][0].replace(/_/g, ' ') : null;

    return {
      totalDays: dailyLogs.length,
      avgSleepHours,
      restfulPercent,
      avgEnergy,
      topMood,
    };
  }, [dailyLogs]);

  if (!stats) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-oviareText-primary">
          Wellness Summary & Averages
        </h3>
        <span className="text-xs text-oviareText-secondary">
          Based on {stats.totalDays} recorded {stats.totalDays === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sleep Duration */}
        <Card variant="default" padding="sm" className="space-y-1">
          <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-plum" /> Avg Sleep Rest
          </span>
          <p className="font-serif text-2xl font-medium text-oviareText-primary">
            {stats.avgSleepHours !== null ? (
              <>
                {stats.avgSleepHours} <span className="text-xs font-sans text-oviareText-secondary">hours</span>
              </>
            ) : (
              '—'
            )}
          </p>
          <span className="text-[10px] text-oviareText-muted block">
            {stats.restfulPercent !== null ? `${stats.restfulPercent}% restful or good` : 'Self-reported duration'}
          </span>
        </Card>

        {/* Energy Vitality */}
        <Card variant="default" padding="sm" className="space-y-1">
          <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-sage" /> Average Vitality
          </span>
          <p className="font-serif text-2xl font-medium text-oviareText-primary">
            {stats.avgEnergy !== null ? (
              <>
                {stats.avgEnergy} <span className="text-xs font-sans text-oviareText-secondary">/ 5</span>
              </>
            ) : (
              '—'
            )}
          </p>
          <span className="text-[10px] text-oviareText-muted block">
            {stats.avgEnergy !== null && stats.avgEnergy >= 3.5
              ? 'Sustained energy'
              : stats.avgEnergy !== null && stats.avgEnergy <= 2.5
              ? 'Gentle rest needed'
              : 'Steady baseline'}
          </span>
        </Card>

        {/* Dominant Mood */}
        <Card variant="default" padding="sm" className="space-y-1">
          <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-plum" /> Dominant Feeling
          </span>
          <p className="font-serif text-2xl font-medium text-oviareText-primary capitalize">
            {stats.topMood || '—'}
          </p>
          <span className="text-[10px] text-oviareText-muted block">
            Most frequent reflection
          </span>
        </Card>

        {/* Logging Consistency */}
        <Card variant="default" padding="sm" className="space-y-1">
          <span className="text-[11px] font-medium text-oviareText-secondary flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-oviareText-secondary" /> Logged Check-ins
          </span>
          <p className="font-serif text-2xl font-medium text-oviareText-primary">
            {stats.totalDays} <span className="text-xs font-sans text-oviareText-secondary">check-ins</span>
          </p>
          <span className="text-[10px] text-oviareText-muted block">
            {isDemoMode ? 'Sample demonstration' : 'Personal journal'}
          </span>
        </Card>
      </div>
    </div>
  );
};
