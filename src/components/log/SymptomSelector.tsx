'use client';

import React from 'react';
import { SymptomCategory } from '@/types';
import {
  Activity,
  Sparkles,
  Wind,
  BatteryLow,
  Shield,
  HelpCircle,
  Moon,
  Flame,
  Zap,
} from 'lucide-react';

interface SymptomSelectorProps {
  selected: SymptomCategory[];
  onChange: (symptoms: SymptomCategory[]) => void;
}

const SYMPTOMS: { id: SymptomCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'cramps', label: 'Cramps', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'headache', label: 'Headache', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'tender_breasts', label: 'Tender Breasts', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'bloating', label: 'Bloating', icon: <Wind className="w-3.5 h-3.5" /> },
  { id: 'fatigue', label: 'Fatigue', icon: <BatteryLow className="w-3.5 h-3.5" /> },
  { id: 'acne', label: 'Skin Changes', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'backache', label: 'Lower Backache', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'nausea', label: 'Nausea', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'insomnia', label: 'Restless Sleep', icon: <Moon className="w-3.5 h-3.5" /> },
];

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({ selected, onChange }) => {
  const toggleSymptom = (id: SymptomCategory) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
          Physical Symptoms
        </label>
        <span className="text-[11px] text-oviareText-secondary">
          {selected.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {SYMPTOMS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSymptom(item.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-all duration-150 focus-visible:outline-plum ${
                isSelected
                  ? 'bg-plum/10 border-plum text-plum font-semibold shadow-subtle'
                  : 'bg-white border-oviareBorder text-oviareText-primary hover:border-plum/30 hover:bg-ivory-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isSelected ? 'bg-plum text-white' : 'bg-ivory text-oviareText-secondary'
                }`}
              >
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
