'use client';

import React from 'react';
import { EnergyLevel } from '@/types';
import { Moon, Battery, BatteryMedium, BatteryFull } from 'lucide-react';

interface SleepEnergySelectorProps {
  sleepHours: number | undefined;
  energy: EnergyLevel | undefined;
  onSleepChange: (hours: number) => void;
  onEnergyChange: (energy: EnergyLevel) => void;
}

const SLEEP_OPTIONS = [5, 6, 7, 8, 9, 10];
const ENERGY_OPTIONS: { id: EnergyLevel; label: string; icon: React.ReactNode }[] = [
  { id: 'low', label: 'Low Energy', icon: <Battery className="w-3.5 h-3.5" /> },
  { id: 'moderate', label: 'Balanced / Steady', icon: <BatteryMedium className="w-3.5 h-3.5" /> },
  { id: 'high', label: 'High / Vibrant', icon: <BatteryFull className="w-3.5 h-3.5" /> },
];

export const SleepEnergySelector: React.FC<SleepEnergySelectorProps> = ({
  sleepHours,
  energy,
  onSleepChange,
  onEnergyChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sleep duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            Sleep Duration
          </label>
          <span className="text-[11px] text-oviareText-secondary">
            {sleepHours ? `${sleepHours} hours` : 'Not set'}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {SLEEP_OPTIONS.map((hours) => {
            const isSelected = sleepHours === hours;
            return (
              <button
                key={hours}
                type="button"
                onClick={() => onSleepChange(hours)}
                className={`py-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-plum text-white border-plum shadow-subtle'
                    : 'bg-white border-oviareBorder text-oviareText-primary hover:border-plum/30 hover:bg-ivory-50'
                }`}
              >
                {hours}h
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy level */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
          Energy Vitality
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map((opt) => {
            const isSelected = energy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onEnergyChange(opt.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sage text-white border-sage shadow-subtle'
                    : 'bg-white border-oviareBorder text-oviareText-primary hover:border-sage/40 hover:bg-ivory-50'
                }`}
              >
                <div className="mb-1">{opt.icon}</div>
                <span className="text-[11px]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
