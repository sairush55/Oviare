'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import {
  Sliders,
  Activity,
  Smile,
  Moon,
  Zap,
  FileText,
  Heart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const PersonalizationSettingsCard: React.FC = () => {
  const { trackingPreferences, updateTrackingPreferences, isDemoMode } = useCycleData();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (
    key: keyof typeof trackingPreferences,
    currentValue: boolean
  ) => {
    setIsUpdating(true);
    await updateTrackingPreferences({
      [key]: !currentValue,
    });
    setIsUpdating(false);
  };

  const categories = [
    {
      key: 'symptoms_enabled' as const,
      label: 'Physical Symptoms',
      description: 'Cramps, headaches, breast tenderness, bloating, fatigue, and other bodily sensations.',
      icon: Activity,
      enabled: trackingPreferences.symptoms_enabled,
    },
    {
      key: 'mood_enabled' as const,
      label: 'Emotional State & Mood',
      description: 'Daily emotional reflections (calm, happy, sensitive, irritable, balanced, etc.).',
      icon: Smile,
      enabled: trackingPreferences.mood_enabled,
    },
    {
      key: 'sleep_enabled' as const,
      label: 'Sleep Duration & Rest Quality',
      description: 'Hours rested and qualitative rating (poor, fair, good, excellent).',
      icon: Moon,
      enabled: trackingPreferences.sleep_enabled,
    },
    {
      key: 'energy_enabled' as const,
      label: 'Vitality & Energy Scale',
      description: '1 to 5 scale tracking physical and mental stamina throughout the day.',
      icon: Zap,
      enabled: trackingPreferences.energy_enabled,
    },
    {
      key: 'notes_enabled' as const,
      label: 'Gentle Daily Notes',
      description: 'Free-form contextual reflections, food, hydration, or lifestyle notes.',
      icon: FileText,
      enabled: trackingPreferences.notes_enabled,
    },
    {
      key: 'intimacy_enabled' as const,
      label: 'Intimacy Tracking (Optional)',
      description: 'Private, non-diagnostic log of intimacy occasions. Disabled by default.',
      icon: Heart,
      enabled: trackingPreferences.intimacy_enabled,
    },
  ];

  return (
    <Card variant="default" padding="md" className="space-y-5">
      <CardHeader
        title="Personalized Tracking Categories"
        subtitle="Choose which dimensions appear in your daily check-in interface"
        action={
          <Badge variant="plum" size="sm">
            {categories.filter((c) => c.enabled).length} of {categories.length} Active
          </Badge>
        }
      />

      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <label
              key={cat.key}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                cat.enabled
                  ? 'border-oviareBorder bg-white hover:bg-ivory-50/50'
                  : 'border-oviareBorder/60 bg-ivory-100/50 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    cat.enabled
                      ? 'bg-mauve/40 text-plum'
                      : 'bg-ivory-200 text-oviareText-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-oviareText-primary block">
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-oviareText-secondary leading-relaxed block">
                    {cat.description}
                  </span>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={cat.enabled}
                  disabled={isUpdating}
                  onChange={() => handleToggle(cat.key, cat.enabled)}
                  className="w-4 h-4 rounded text-plum focus:ring-plum cursor-pointer"
                />
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-oviareText-primary block mb-0.5">
            Historical Data Preservation
          </span>
          <p className="text-[11px]">
            Disabling any category purely hides its input card on the Daily Wellness Log screen. Your past entries are never deleted and will automatically reappear if you re-enable the category later.
          </p>
        </div>
      </div>
    </Card>
  );
};
