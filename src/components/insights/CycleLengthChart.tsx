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
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

const SAMPLE_CYCLE_DATA = [
  { cycle: 'May', length: 28, periodDays: 5 },
  { cycle: 'Jun', length: 29, periodDays: 5 },
  { cycle: 'Jul', length: 27, periodDays: 4 },
  { cycle: 'Aug', length: 28, periodDays: 5 },
  { cycle: 'Sep', length: 29, periodDays: 5 },
  { cycle: 'Oct (Current)', length: 28, periodDays: 5 },
];

export const CycleLengthChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card variant="default" padding="md" className="h-80 flex items-center justify-center">
        <span className="text-xs text-oviareText-secondary">Loading cycle chart...</span>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Cycle Length History"
        subtitle="Distribution across recent months (Sample preview)"
        action={
          <Badge variant="sample" size="sm">
            Sample Model
          </Badge>
        }
      />

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SAMPLE_CYCLE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1E6" />
            <XAxis
              dataKey="cycle"
              tickLine={false}
              axisLine={{ stroke: '#E7E1E6' }}
              tick={{ fill: '#77717A', fontSize: 11 }}
            />
            <YAxis
              domain={[20, 36]}
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
                      <p className="font-semibold text-oviareText-primary">{data.cycle}</p>
                      <p className="text-plum mt-1">Cycle length: {data.length} days</p>
                      <p className="text-oviareText-secondary">Period duration: {data.periodDays} days</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={28} stroke="#76566F" strokeDasharray="4 4" label={{ value: '28d Average', fill: '#76566F', fontSize: 10, position: 'insideTopRight' }} />
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
        Average duration: 28.2 days • Variation: ±1.2 days (Sample baseline data)
      </p>
    </Card>
  );
};
