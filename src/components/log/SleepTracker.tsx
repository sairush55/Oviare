'use client';

import React from 'react';
import { SleepQuality } from '@/types';
import { Moon, Star, Frown, Meh, Smile, Sparkles } from 'lucide-react';

interface SleepTrackerProps {
  sleepMinutes: number | null;
  sleepQuality: SleepQuality | null;
  onSleepMinutesChange: (minutes: number | null) => void;
  onSleepQualityChange: (quality: SleepQuality | null) => void;
}

const QUALITY_OPTIONS: { id: SleepQuality; label: string; icon: React.ReactNode }[] = [
  { id: 'poor', label: 'Poor', icon: <Frown className="w-3.5 h-3.5" /> },
  { id: 'fair', label: 'Fair', icon: <Meh className="w-3.5 h-3.5" /> },
  { id: 'good', label: 'Good', icon: <Smile className="w-3.5 h-3.5" /> },
  { id: 'excellent', label: 'Restful', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const PRESET_HOURS = [5, 6, 7, 7.5, 8, 8.5, 9, 10];

export const SleepTracker: React.FC<SleepTrackerProps> = ({
  sleepMinutes,
  sleepQuality,
  onSleepMinutesChange,
  onSleepQualityChange,
}) => {
  const currentHours = sleepMinutes !== null ? Math.round((sleepMinutes / 60) * 10) / 10 : null;

  const handleHoursInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onSleepMinutesChange(null);
    } else {
      const clamped = Math.max(0, Math.min(24, val));
      onSleepMinutesChange(Math.round(clamped * 60));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
          Sleep Duration & Quality
        </label>
        <p className="text-xs text-oviareText-secondary mt-0.5">
          Record self-reported rest duration and perceived sleep quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duration */}
        <div className="space-y-2 p-3 rounded-xl bg-ivory-50 border border-oviareBorder">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-oviareText-primary flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-plum" />
              Duration
            </span>
            <span className="text-xs font-serif font-medium text-plum">
              {currentHours !== null ? `${currentHours} hours` : 'Not recorded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={currentHours !== null ? currentHours : ''}
              onChange={handleHoursInput}
              placeholder="e.g. 7.5"
              className="w-24 px-3 py-1.5 rounded-lg border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum"
            />
            <span className="text-xs text-oviareText-secondary">hours</span>
            {currentHours !== null && (
              <button
                type="button"
                onClick={() => onSleepMinutesChange(null)}
                className="ml-auto text-[11px] text-oviareText-secondary hover:text-plum underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_HOURS.map((h) => {
              const active = currentHours === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => onSleepMinutesChange(Math.round(h * 60))}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors border ${
                    active
                      ? 'bg-plum text-white border-plum shadow-subtle'
                      : 'bg-white border-oviareBorder text-oviareText-secondary hover:border-plum/30'
                  }`}
                >
                  {h}h
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-2 p-3 rounded-xl bg-ivory-50 border border-oviareBorder">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-oviareText-primary flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-plum" />
              Perceived Quality
            </span>
            {sleepQuality && (
              <button
                type="button"
                onClick={() => onSleepQualityChange(null)}
                className="text-[11px] text-oviareText-secondary hover:text-plum underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUALITY_OPTIONS.map((opt) => {
              const active = sleepQuality === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSleepQualityChange(active ? null : opt.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                    active
                      ? 'bg-plum/10 border-plum text-plum font-semibold shadow-subtle'
                      : 'bg-white border-oviareBorder text-oviareText-secondary hover:border-plum/30'
                  }`}
                >
                  <div className={`p-1 rounded-md ${active ? 'bg-plum text-white' : 'bg-ivory'}`}>
                    {opt.icon}
                  </div>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
