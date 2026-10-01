'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FlowSelector } from './FlowSelector';
import { SymptomSelector } from './SymptomSelector';
import { MoodSelector } from './MoodSelector';
import { SleepEnergySelector } from './SleepEnergySelector';
import { useCycleData } from '@/context/CycleDataContext';
import { FlowLevel, SymptomCategory, MoodType, EnergyLevel } from '@/types';
import { CheckCircle2, Calendar, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';

export const QuickLogForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addLogEntry, getEntryForDate } = useCycleData();

  // Selected date defaults to query param or today (2026-10-01)
  const initialDate = searchParams?.get('date') || '2026-10-01';
  const [date, setDate] = useState<string>(initialDate);

  // Form states
  const [flow, setFlow] = useState<FlowLevel>('none');
  const [symptoms, setSymptoms] = useState<SymptomCategory[]>([]);
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [sleepHours, setSleepHours] = useState<number | undefined>(7);
  const [energy, setEnergy] = useState<EnergyLevel | undefined>('moderate');
  const [notes, setNotes] = useState<string>('');

  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if selected date has existing log entry
  useEffect(() => {
    const existing = getEntryForDate(date);
    if (existing) {
      setFlow(existing.flow);
      setSymptoms(existing.symptoms);
      setMoods(existing.moods);
      setSleepHours(existing.sleepHours ?? 7);
      setEnergy(existing.energy ?? 'moderate');
      setNotes(existing.notes ?? '');
    }
  }, [date, getEntryForDate]);

  const handleReset = () => {
    setFlow('none');
    setSymptoms([]);
    setMoods([]);
    setSleepHours(7);
    setEnergy('moderate');
    setNotes('');
    setHasSaved(false);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setErrorMsg('Please specify a valid date.');
      return;
    }

    addLogEntry({
      date,
      flow,
      symptoms,
      moods,
      sleepHours,
      energy,
      notes: notes.trim() || undefined,
    });

    setHasSaved(true);
    setErrorMsg(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prototype Privacy Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-mauve/25 border border-mauve-border text-xs text-oviareText-secondary">
        <Sparkles className="w-4 h-4 text-plum shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-oviareText-primary font-medium">Phase 1 Prototype Notice:</strong>{' '}
          All logged symptoms and notes are kept in local, temporary browser session state only. No data is stored on remote servers or synced to external databases.
        </div>
      </div>

      {hasSaved && (
        <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-sage-subtle border border-sage/30 text-xs text-sage animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-oviareText-primary">
                Daily log successfully saved for {date}!
              </p>
              <p className="text-oviareText-secondary mt-0.5">
                Session state updated. You can view these entries across Dashboard, Calendar, and Insights.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Date Selection Card */}
      <Card variant="default" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label
              htmlFor="log-date"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Logging Date
            </label>
            <p className="text-xs text-oviareText-secondary">
              Record retrospective observations or today's check-in
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setHasSaved(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
              />
            </div>
            {date === '2026-10-01' && (
              <Badge variant="plum" size="sm">
                Today
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Flow Selection Card */}
      <Card variant="default" padding="md">
        <FlowSelector value={flow} onChange={(f) => { setFlow(f); setHasSaved(false); }} />
      </Card>

      {/* Symptoms Selection Card */}
      <Card variant="default" padding="md">
        <SymptomSelector selected={symptoms} onChange={(s) => { setSymptoms(s); setHasSaved(false); }} />
      </Card>

      {/* Mood Selection Card */}
      <Card variant="default" padding="md">
        <MoodSelector selected={moods} onChange={(m) => { setMoods(m); setHasSaved(false); }} />
      </Card>

      {/* Sleep and Energy */}
      <Card variant="default" padding="md">
        <SleepEnergySelector
          sleepHours={sleepHours}
          energy={energy}
          onSleepChange={(h) => { setSleepHours(h); setHasSaved(false); }}
          onEnergyChange={(e) => { setEnergy(e); setHasSaved(false); }}
        />
      </Card>

      {/* Notes Card */}
      <Card variant="default" padding="md">
        <label
          htmlFor="log-notes"
          className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1.5"
        >
          Gentle Notes (Optional)
        </label>
        <textarea
          id="log-notes"
          rows={3}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setHasSaved(false); }}
          placeholder="Any subtle sensations, medications taken, lifestyle changes, or thoughts..."
          className="w-full p-3 rounded-xl border border-oviareBorder bg-white text-xs text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum resize-none leading-relaxed"
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset form
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="px-6"
          >
            Save Session Entry
          </Button>
        </div>
      </div>
    </form>
  );
};
