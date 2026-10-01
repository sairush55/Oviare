'use client';

import React from 'react';
import { BatteryLow, Battery, BatteryMedium, BatteryFull, Zap } from 'lucide-react';

interface EnergyTrackerProps {
  energyLevel: number | null;
  onChange: (level: number | null) => void;
}

const ENERGY_SCALE: { level: number; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { level: 1, label: '1 — Very Low', sublabel: 'Exhausted', icon: <BatteryLow className="w-3.5 h-3.5" /> },
  { level: 2, label: '2 — Low', sublabel: 'Sluggish', icon: <Battery className="w-3.5 h-3.5" /> },
  { level: 3, label: '3 — Moderate', sublabel: 'Steady', icon: <BatteryMedium className="w-3.5 h-3.5" /> },
  { level: 4, label: '4 — High', sublabel: 'Energized', icon: <BatteryFull className="w-3.5 h-3.5" /> },
  { level: 5, label: '5 — Very High', sublabel: 'Vibrant', icon: <Zap className="w-3.5 h-3.5" /> },
];

export const EnergyTracker: React.FC<EnergyTrackerProps> = ({ energyLevel, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            Daily Energy Level
          </label>
          <p className="text-xs text-oviareText-secondary mt-0.5">
            Perceived vitality rating from 1 (Very low) to 5 (Very high).
          </p>
        </div>
        {energyLevel !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-oviareText-secondary hover:text-plum underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ENERGY_SCALE.map((item) => {
          const isSelected = energyLevel === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(isSelected ? null : item.level)}
              aria-pressed={isSelected}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                isSelected
                  ? 'bg-sage/15 border-sage text-sage font-medium shadow-subtle'
                  : 'bg-white border-oviareBorder text-oviareText-secondary hover:border-sage/40 hover:bg-ivory-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mb-1.5 ${
                  isSelected ? 'bg-sage text-white' : 'bg-ivory text-oviareText-secondary'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium text-oviareText-primary">
                {item.label}
              </span>
              <span className="text-[10px] text-oviareText-secondary mt-0.5">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
