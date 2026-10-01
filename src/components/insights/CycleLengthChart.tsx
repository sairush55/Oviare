'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { Calendar } from 'lucide-react';

const SAMPLE_CYCLE_DATA = [
  { cycle: 'May', length: 28, periodDays: 5 },
  { cycle: 'Jun', length: 29, periodDays: 5 },
  { cycle: 'Jul', length: 27, periodDays: 4 },
  { cycle: 'Aug', length: 28, periodDays: 5 },
  { cycle: 'Sep', length: 26, periodDays: 5 },
];

export const CycleLengthChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { cycleHistory, cycleStats, isDemoMode } = useCycleData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (isDemoMode) {
      return SAMPLE_CYCLE_DATA;
    }

    const completed = cycleHistory.filter((h) => h.cycleLengthDays !== null);
    if (completed.length === 0) return [];

    return completed.map((item) => {
      let label = item.periodStart;
      try {
        const [y, m, d] = item.periodStart.split('-').map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      } catch {
        label = item.periodStart;
      }

      return {
        cycle: label,
        length: item.cycleLengthDays as number,
        periodDays: item.periodDurationDays ?? 5,
      };
    });
  }, [cycleHistory, isDemoMode]);

  if (!mounted) {
    return (
      <Card variant="default" padding="md" className="h-80 flex items-center justify-center">
        <span className="text-xs text-oviareText-secondary">Loading cycle chart...</span>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card variant="default" padding="md" className="h-80 flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 rounded-full bg-ivory-100 text-oviareText-secondary flex items-center justify-center mb-2">
          <Calendar className="w-5 h-5 text-plum" />
        </div>
        <h4 className="font-serif text-sm font-medium text-oviareText-primary">
          Insufficient cycle history
        </h4>
        <p className="text-xs text-oviareText-secondary max-w-xs mt-1 leading-relaxed">
          Log at least 2 consecutive period start dates to calculate and visualize your personal cycle length distribution.
        </p>
      </Card>
    );
  }

  const avgLength = cycleStats.averageCycleLength ?? 28;

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Cycle Length History"
        subtitle={`Intervals measured between consecutive period start dates (${chartData.length} cycles)`}
        action={
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
      />

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1E6" />
            <XAxis
              dataKey="cycle"
              tickLine={false}
              axisLine={{ stroke: '#E7E1E6' }}
              tick={{ fill: '#77717A', fontSize: 11 }}
            />
            <YAxis
              domain={[18, 45]}
              tickLine={false}
              axisLine={{ stroke: '#E7E1E6' }}
              tick={{ fill: '#77717A', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-oviareBorder p-2.5 rounded-xl shadow-card text-xs">
                      <p className="font-semibold text-oviareText-primary">Period starting {data.cycle}</p>
                      <p className="text-plum mt-1">Cycle length: {data.length} days</p>
                      <p className="text-oviareText-secondary">Period duration: {data.periodDays} days</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={avgLength}
              stroke="#76566F"
              strokeDasharray="4 4"
              label={{
                value: `${avgLength}d Average`,
                fill: '#76566F',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Bar
              dataKey="length"
              fill="#76566F"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[11px] text-oviareText-secondary text-center leading-normal">
        Average: {avgLength} days • Variation: {cycleStats.cycleVariabilityDays !== null ? `±${cycleStats.cycleVariabilityDays} days` : '—'}
      </p>
    </Card>
  );
};
