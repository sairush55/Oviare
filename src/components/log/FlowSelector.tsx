'use client';

import React from 'react';
import { FlowLevel } from '@/types';
import { Droplet, Droplets, MinusCircle, CircleSlash } from 'lucide-react';

interface FlowSelectorProps {
  value: FlowLevel;
  onChange: (flow: FlowLevel) => void;
}

const FLOW_OPTIONS: { id: FlowLevel; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'none',
    label: 'None',
    description: 'No flow observed',
    icon: <CircleSlash className="w-4 h-4" />,
  },
  {
    id: 'spotting',
    label: 'Spotting',
    description: 'Very light or faint drops',
    icon: <Droplet className="w-3.5 h-3.5 stroke-[1.5]" />,
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Minimal flow',
    icon: <Droplet className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Moderate regular flow',
    icon: <Droplets className="w-4 h-4 stroke-[2]" />,
  },
  {
    id: 'heavy',
    label: 'Heavy',
    description: 'Substantial flow',
    icon: <Droplets className="w-5 h-5 fill-plum/20 stroke-[2.5]" />,
  },
];

export const FlowSelector: React.FC<FlowSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
        Period Flow
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {FLOW_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 focus-visible:outline-plum ${
                isSelected
                  ? 'bg-mauve/60 border-plum text-plum font-medium shadow-subtle ring-1 ring-plum/40'
                  : 'bg-white border-oviareBorder text-oviareText-primary hover:border-plum/30 hover:bg-ivory-50'
              }`}
            >
              <div
                className={`mb-2 p-2 rounded-full transition-colors ${
                  isSelected ? 'bg-plum text-white' : 'bg-ivory text-oviareText-secondary'
                }`}
              >
                {opt.icon}
              </div>
              <span className="text-xs font-medium">{opt.label}</span>
              <span className="text-[10px] text-oviareText-secondary mt-0.5 line-clamp-1">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
