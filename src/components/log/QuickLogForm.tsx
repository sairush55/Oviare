'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SymptomTracker, SelectedSymptomState } from './SymptomTracker';
import { MoodTracker } from './MoodTracker';
import { SleepTracker } from './SleepTracker';
import { EnergyTracker } from './EnergyTracker';
import { IntimacyTracker } from './IntimacyTracker';
import { DeleteLogModal } from './DeleteLogModal';
import { useCycleData } from '@/context/CycleDataContext';
import { MoodType, SleepQuality } from '@/types';
import {
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Trash2,
  Lock,
} from 'lucide-react';

export const QuickLogForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    saveDailyWellness,
    removeDailyWellness,
    getDailyLog,
    customSymptoms,
    addCustomSymptomName,
    isDemoMode,
  } = useCycleData();

  // Selected date defaults to query param or reference date (2026-10-01)
  const initialDate = searchParams?.get('date') || '2026-10-01';
  const [date, setDate] = useState<string>(initialDate);

  // Form states
  const [symptoms, setSymptoms] = useState<SelectedSymptomState[]>([]);
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(480); // default 8h
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>('good');
  const [energyLevel, setEnergyLevel] = useState<number | null>(3); // moderate
  const [intimacyLogged, setIntimacyLogged] = useState<boolean>(false);
  const [intimacyNotes, setIntimacyNotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Existing entry tracking
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Synchronize state when selected date changes
  useEffect(() => {
    const existing = getDailyLog(date);
    if (existing) {
      setExistingEntryId(existing.id);
      setMoods(existing.moods || []);
      setSleepMinutes(existing.sleep_duration_minutes ?? null);
      setSleepQuality(existing.sleep_quality ?? null);
      setEnergyLevel(existing.energy_level ?? null);
      setIntimacyLogged(Boolean(existing.intimacy_logged));
      setIntimacyNotes(existing.intimacy_notes || '');
      setNotes(existing.notes || '');

      // Map symptoms with severity and notes
      const mappedSymptoms: SelectedSymptomState[] = (existing.symptoms || []).map((s) => ({
        symptom_name: s.symptom_name,
        severity: s.severity,
        notes: s.notes || undefined,
      }));
      setSymptoms(mappedSymptoms);
    } else {
      setExistingEntryId(null);
      setSymptoms([]);
      setMoods([]);
      setSleepMinutes(null);
      setSleepQuality(null);
      setEnergyLevel(null);
      setIntimacyLogged(false);
      setIntimacyNotes('');
      setNotes('');
    }
    setHasSaved(false);
    setErrorMessage(null);
  }, [date, getDailyLog]);

  const handleReset = () => {
    setSymptoms([]);
    setMoods([]);
    setSleepMinutes(null);
    setSleepQuality(null);
    setEnergyLevel(null);
    setIntimacyLogged(false);
    setIntimacyNotes('');
    setNotes('');
    setHasSaved(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!date) {
      setErrorMessage('Please specify a valid date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveDailyWellness({
        log_date: date,
        moods,
        sleep_duration_minutes: sleepMinutes,
        sleep_quality: sleepQuality,
        energy_level: energyLevel,
        intimacy_logged: intimacyLogged,
        intimacy_notes: intimacyNotes.trim() || null,
        notes: notes.trim() || null,
        symptoms: symptoms.map((s) => ({
          symptom_name: s.symptom_name,
          severity: s.severity,
          notes: s.notes?.trim() || null,
        })),
      });

      if (res.success) {
        setHasSaved(true);
      } else {
        setErrorMessage(res.error || 'Failed to save daily wellness entry.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!existingEntryId) return;
    await removeDailyWellness(existingEntryId);
    handleReset();
    setExistingEntryId(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trial banner if in demo mode */}
        {isDemoMode && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-mauve/25 border border-mauve-border text-xs text-oviareText-secondary">
            <Sparkles className="w-4 h-4 text-plum shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-oviareText-primary font-medium">Demo Trial Mode:</strong>{' '}
              All wellness logs are kept in local memory for exploratory demonstration. Real accounts persist your daily health entries securely to Supabase PostgreSQL with personal Row Level Security.
            </div>
          </div>
        )}

        {hasSaved && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-sage-subtle border border-sage/30 text-xs text-sage animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-oviareText-primary">
                  Daily wellness successfully saved for {date}!
                </p>
                <p className="text-oviareText-secondary mt-0.5">
                  Your entry is available across Dashboard, Calendar, and Insights.
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

        {errorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date Selection Card */}
        <Card variant="default" padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label
                  htmlFor="log-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary"
                >
                  Logging Date
                </label>
                {existingEntryId && (
                  <Badge variant="plum" size="sm">
                    Existing Entry
                  </Badge>
                )}
              </div>
              <p className="text-xs text-oviareText-secondary">
                {existingEntryId
                  ? 'An entry already exists for this date. Changes will update your record.'
                  : 'Record observations for today or previous dates.'}
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
              {existingEntryId && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete entry for this date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Symptoms Selection Card */}
        <Card variant="default" padding="md">
          <SymptomTracker
            symptoms={symptoms}
            onChange={(symps) => {
              setSymptoms(symps);
              setHasSaved(false);
            }}
            customSymptoms={customSymptoms}
            onAddCustomSymptom={addCustomSymptomName}
          />
        </Card>

        {/* Mood Selection Card */}
        <Card variant="default" padding="md">
          <MoodTracker
            selected={moods}
            onChange={(m) => {
              setMoods(m);
              setHasSaved(false);
            }}
          />
        </Card>

        {/* Sleep and Quality Card */}
        <Card variant="default" padding="md">
          <SleepTracker
            sleepMinutes={sleepMinutes}
            sleepQuality={sleepQuality}
            onSleepMinutesChange={(mins) => {
              setSleepMinutes(mins);
              setHasSaved(false);
            }}
            onSleepQualityChange={(q) => {
              setSleepQuality(q);
              setHasSaved(false);
            }}
          />
        </Card>

        {/* Energy Scale Card */}
        <Card variant="default" padding="md">
          <EnergyTracker
            energyLevel={energyLevel}
            onChange={(lvl) => {
              setEnergyLevel(lvl);
              setHasSaved(false);
            }}
          />
        </Card>

        {/* Optional Intimacy Tracker */}
        <IntimacyTracker
          intimacyLogged={intimacyLogged}
          intimacyNotes={intimacyNotes}
          onIntimacyLoggedChange={(logged) => {
            setIntimacyLogged(logged);
            setHasSaved(false);
          }}
          onIntimacyNotesChange={(note) => {
            setIntimacyNotes(note);
            setHasSaved(false);
          }}
        />

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
            onChange={(e) => {
              setNotes(e.target.value);
              setHasSaved(false);
            }}
            placeholder="Subtle bodily cues, activities, hydration, or reflections..."
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="px-6"
          >
            {existingEntryId ? 'Update Daily Log' : 'Save Daily Log'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteLogModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        dateStr={date}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
