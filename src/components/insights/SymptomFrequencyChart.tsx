'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

const SAMPLE_SYMPTOM_FREQUENCIES = [
  { symptom: 'Cramps', count: 5, phase: 'Menstrual' },
  { symptom: 'Fatigue', count: 4, phase: 'Late Luteal' },
  { symptom: 'Tender Breasts', count: 3, phase: 'Late Luteal' },
  { symptom: 'Bloating', count: 3, phase: 'Menstrual' },
  { symptom: 'Restless Sleep', count: 2, phase: 'Follicular' },
  { symptom: 'Headache', count: 2, phase: 'Pre-menstrual' },
];

export const SymptomFrequencyChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card variant="default" padding="md" className="h-80 flex items-center justify-center">
        <span className="text-xs text-oviareText-secondary">Loading symptom distribution...</span>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Observed Symptom Patterns"
        subtitle="Most recurring physical signals across recent cycles"
        action={
          <Badge variant="sample" size="sm">
            Sample Model
          </Badge>
        }
      />

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={SAMPLE_SYMPTOM_FREQUENCIES}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E1E6" />
            <XAxis
              type="number"
              domain={[0, 6]}
              tickLine={false}
              axisLine={{ stroke: '#E7E1E6' }}
              tick={{ fill: '#77717A', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="symptom"
              tickLine={false}
              axisLine={{ stroke: '#E7E1E6' }}
              tick={{ fill: '#29262B', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-oviareBorder p-2.5 rounded-xl shadow-card text-xs">
                      <p className="font-semibold text-oviareText-primary">{data.symptom}</p>
                      <p className="text-sage mt-0.5">Observed: {data.count} times</p>
                      <p className="text-oviareText-secondary text-[11px]">Dominant phase: {data.phase}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              fill="#3F5148"
              radius={[0, 6, 6, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[11px] text-oviareText-secondary text-center leading-normal">
        Signals frequently cluster around early menstrual and late luteal days.
      </p>
    </Card>
  );
};
