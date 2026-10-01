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
  Frown,
  Flame,
  MinusCircle,
} from 'lucide-react';

interface MoodTrackerProps {
  selected: MoodType[];
  onChange: (moods: MoodType[]) => void;
}

const MOODS: { id: MoodType; label: string; icon: React.ReactNode }[] = [
  { id: 'happy', label: 'Upbeat / Joyful', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'calm', label: 'Calm & Centered', icon: <Feather className="w-3.5 h-3.5" /> },
  { id: 'neutral', label: 'Neutral / Steady', icon: <MinusCircle className="w-3.5 h-3.5" /> },
  { id: 'balanced', label: 'Balanced', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'sensitive', label: 'Reflective / Tender', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'low_energy', label: 'Low Motivation', icon: <Cloud className="w-3.5 h-3.5" /> },
  { id: 'anxious', label: 'Anxious / Restless', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { id: 'irritable', label: 'Easily Frustrated', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'sad', label: 'Low / Melancholic', icon: <Frown className="w-3.5 h-3.5" /> },
  { id: 'stressed', label: 'Overwhelmed', icon: <Smile className="w-3.5 h-3.5" /> },
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({ selected, onChange }) => {
  const toggleMood = (id: MoodType) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            Emotional Mood & State
          </label>
          <p className="text-xs text-oviareText-secondary mt-0.5">
            Record feelings to recognize recurring emotional patterns.
          </p>
        </div>
        <span className="text-xs font-medium text-plum">
          {selected.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {MOODS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleMood(item.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
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
