'use client';

import React from 'react';
import { MoodType } from '@/types';
import {
  Sun,
  Smile,
  Compass,
  Cloud,
  Feather,
  AlertCircle,
  Heart,
} from 'lucide-react';

interface MoodSelectorProps {
  selected: MoodType[];
  onChange: (moods: MoodType[]) => void;
}

const MOODS: { id: MoodType; label: string; icon: React.ReactNode }[] = [
  { id: 'calm', label: 'Calm & Centered', icon: <Feather className="w-3.5 h-3.5" /> },
  { id: 'balanced', label: 'Balanced', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'happy', label: 'Upbeat / Joyful', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'sensitive', label: 'Reflective / Tender', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'low_energy', label: 'Low Motivation', icon: <Cloud className="w-3.5 h-3.5" /> },
  { id: 'anxious', label: 'Anxious / Restless', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { id: 'irritable', label: 'Easily Frustrated', icon: <Smile className="w-3.5 h-3.5" /> },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onChange }) => {
  const toggleMood = (id: MoodType) => {
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
          Emotional Mood & State
        </label>
        <span className="text-[11px] text-oviareText-secondary">
          {selected.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {MOODS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleMood(item.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-all duration-150 focus-visible:outline-plum ${
                isSelected
                  ? 'bg-mauve/60 border-plum text-plum font-semibold shadow-subtle'
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
