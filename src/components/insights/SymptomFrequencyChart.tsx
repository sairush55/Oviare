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
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { Activity } from 'lucide-react';

const SAMPLE_SYMPTOM_FREQUENCIES = [
  { symptom: 'Cramps', count: 5 },
  { symptom: 'Fatigue', count: 4 },
  { symptom: 'Tender Breasts', count: 3 },
  { symptom: 'Bloating', count: 3 },
  { symptom: 'Restless Sleep', count: 2 },
  { symptom: 'Headache', count: 2 },
];

export const SymptomFrequencyChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { dailyLogs, isDemoMode } = useCycleData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const symptomData = useMemo(() => {
    if (isDemoMode) {
      return SAMPLE_SYMPTOM_FREQUENCIES;
    }

    const counts: Record<string, number> = {};
    dailyLogs.forEach((log) => {
      (log.symptoms || []).forEach((s) => {
        const cleanName = s.symptom_name.replace(/_/g, ' ');
        const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        counts[capitalized] = (counts[capitalized] || 0) + 1;
      });
    });

    const items = Object.entries(counts).map(([symptom, count]) => ({
      symptom,
      count,
    }));

    return items.sort((a, b) => b.count - a.count).slice(0, 6);
  }, [dailyLogs, isDemoMode]);

  if (!mounted) {
    return (
      <Card variant="default" padding="md" className="h-80 flex items-center justify-center">
        <span className="text-xs text-oviareText-secondary">Loading symptom distribution...</span>
      </Card>
    );
  }

  if (symptomData.length === 0) {
    return (
      <Card variant="default" padding="md" className="h-80 flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 rounded-full bg-ivory-100 text-oviareText-secondary flex items-center justify-center mb-2">
          <Activity className="w-5 h-5 text-sage" />
        </div>
        <h4 className="font-serif text-sm font-medium text-oviareText-primary">
          No symptoms logged yet
        </h4>
        <p className="text-xs text-oviareText-secondary max-w-xs mt-1 leading-relaxed">
          As you record daily wellness check-ins, your recurring physical sensations will appear here.
        </p>
      </Card>
    );
  }

  const maxCount = Math.max(...symptomData.map((d) => d.count), 5);

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Observed Symptom Frequency"
        subtitle={`Most recurring physical signals across ${dailyLogs.length} logged days`}
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
          <BarChart
            data={symptomData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E1E6" />
            <XAxis
              type="number"
              domain={[0, maxCount + 1]}
              allowDecimals={false}
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
                      <p className="text-sage mt-0.5">Observed: {data.count} day(s)</p>
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
        Based on personal self-reported logs. Does not represent a clinical diagnosis.
      </p>
    </Card>
  );
};
