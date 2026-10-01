'use client';

import React, { useState } from 'react';
import { SymptomSeverity } from '@/types';
import {
  Flame,
  Zap,
  Shield,
  Wind,
  BatteryLow,
  Sparkles,
  Activity,
  HelpCircle,
  Utensils,
  Moon,
  Plus,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SelectedSymptomState {
  symptom_name: string;
  severity: SymptomSeverity;
  notes?: string;
}

interface SymptomTrackerProps {
  symptoms: SelectedSymptomState[];
  onChange: (symptoms: SelectedSymptomState[]) => void;
  customSymptoms?: string[];
  onAddCustomSymptom?: (name: string) => Promise<void>;
}

const DEFAULT_SYMPTOMS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'cramps', label: 'Cramps', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'headache', label: 'Headache', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'bloating', label: 'Bloating', icon: <Wind className="w-3.5 h-3.5" /> },
  { id: 'tender_breasts', label: 'Tender Breasts', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'fatigue', label: 'Fatigue', icon: <BatteryLow className="w-3.5 h-3.5" /> },
  { id: 'acne', label: 'Skin Changes', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'backache', label: 'Back Pain', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'nausea', label: 'Nausea', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { id: 'appetite_changes', label: 'Appetite Changes', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'insomnia', label: 'Restless Sleep', icon: <Moon className="w-3.5 h-3.5" /> },
];

const SEVERITY_LEVELS: { id: SymptomSeverity; label: string; bg: string; text: string }[] = [
  { id: 'mild', label: 'Mild', bg: 'bg-mauve-light/50', text: 'text-oviareText-primary' },
  { id: 'moderate', label: 'Moderate', bg: 'bg-mauve/60', text: 'text-plum font-medium' },
  { id: 'severe', label: 'Severe', bg: 'bg-plum/15', text: 'text-plum font-semibold' },
];

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({
  symptoms,
  onChange,
  customSymptoms = [],
  onAddCustomSymptom,
}) => {
  const [newCustomName, setNewCustomName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const isSelected = (name: string) => symptoms.some((s) => s.symptom_name === name);

  const toggleSymptom = (name: string) => {
    if (isSelected(name)) {
      onChange(symptoms.filter((s) => s.symptom_name !== name));
    } else {
      onChange([...symptoms, { symptom_name: name, severity: 'moderate' }]);
    }
  };

  const updateSeverity = (name: string, severity: SymptomSeverity) => {
    onChange(
      symptoms.map((s) => (s.symptom_name === name ? { ...s, severity } : s))
    );
  };

  const updateNotes = (name: string, notes: string) => {
    onChange(
      symptoms.map((s) => (s.symptom_name === name ? { ...s, notes } : s))
    );
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const trimmed = newCustomName.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed.length > 40) {
      setCustomError('Custom symptom name must be 40 characters or fewer.');
      return;
    }
    if (DEFAULT_SYMPTOMS.some((s) => s.id === trimmed) || customSymptoms.includes(trimmed)) {
      setCustomError('This symptom already exists in your list.');
      return;
    }

    if (onAddCustomSymptom) {
      await onAddCustomSymptom(trimmed);
    }
    // Auto-select the newly added custom symptom
    onChange([...symptoms, { symptom_name: trimmed, severity: 'moderate' }]);
    setNewCustomName('');
    setIsAddingCustom(false);
  };

  // Combine default with user custom symptoms
  const allSymptomCards = [
    ...DEFAULT_SYMPTOMS,
    ...customSymptoms.map((c) => ({
      id: c,
      label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' '),
      icon: <Sparkles className="w-3.5 h-3.5 text-sage" />,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            Physical Sensations & Symptoms
          </label>
          <p className="text-xs text-oviareText-secondary mt-0.5">
            Select any observed sensations. Leave empty if none experienced.
          </p>
        </div>
        <span className="text-xs font-medium text-plum">
          {symptoms.length} selected
        </span>
      </div>

      {/* Symptom Grid Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allSymptomCards.map((item) => {
          const selected = isSelected(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleSymptom(item.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                selected
                  ? 'bg-plum/10 border-plum text-plum font-semibold shadow-subtle'
                  : 'bg-white border-oviareBorder text-oviareText-primary hover:border-plum/30 hover:bg-ivory-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  selected ? 'bg-plum text-white' : 'bg-ivory text-oviareText-secondary'
                }`}
              >
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Symptom Input */}
      <div>
        {!isAddingCustom ? (
          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="inline-flex items-center gap-1.5 text-xs text-plum hover:text-plum-dark font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add custom symptom
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="p-3 rounded-xl bg-ivory-50 border border-oviareBorder space-y-2">
            <span className="text-xs font-medium text-oviareText-primary block">
              Add Personal Symptom Label
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                placeholder="E.g., Migraine, joint tenderness..."
                maxLength={40}
                className="flex-1 px-3 py-1.5 rounded-lg border border-oviareBorder bg-white text-xs text-oviareText-primary focus-visible:outline-plum"
              />
              <Button type="submit" variant="primary" size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingCustom(false);
                  setCustomError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            {customError && (
              <span className="text-[11px] text-red-600 block">{customError}</span>
            )}
          </form>
        )}
      </div>

      {/* Severity Details for Selected Symptoms */}
      {symptoms.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] text-oviareText-secondary">
            <Info className="w-3.5 h-3.5 text-plum shrink-0" />
            <span>
              Self-reported severity scale: Mild, Moderate, or Severe (not a clinical diagnostic metric).
            </span>
          </div>

          <div className="space-y-2">
            {symptoms.map((s) => {
              const itemDef = allSymptomCards.find((c) => c.id === s.symptom_name);
              const label = itemDef ? itemDef.label : s.symptom_name;

              return (
                <div
                  key={s.symptom_name}
                  className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-oviareText-primary">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSymptom(s.symptom_name)}
                      className="p-1 rounded text-oviareText-secondary hover:text-red-600"
                      title="Remove symptom"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Severity Pill Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-oviareText-secondary mr-1">
                      Severity:
                    </span>
                    {SEVERITY_LEVELS.map((lvl) => {
                      const isActive = s.severity === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => updateSeverity(s.symptom_name, lvl.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                            isActive
                              ? 'bg-plum text-white border-plum shadow-subtle'
                              : 'bg-white border-oviareBorder text-oviareText-secondary hover:border-plum/30'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Note */}
                  <input
                    type="text"
                    value={s.notes || ''}
                    onChange={(e) => updateNotes(s.symptom_name, e.target.value)}
                    placeholder="Specific location or context (optional)..."
                    maxLength={100}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-oviareBorder bg-white text-xs text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
