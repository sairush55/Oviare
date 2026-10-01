'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CycleRecord } from '@/types';
import { useCycleData } from '@/context/CycleDataContext';
import { Droplet, Calendar, AlertCircle, Check } from 'lucide-react';

interface PeriodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecord?: CycleRecord | null;
  defaultDate?: string;
}

const FLOW_OPTIONS: { id: 'light' | 'medium' | 'heavy' | 'spotting'; label: string; desc: string }[] = [
  { id: 'spotting', label: 'Spotting', desc: 'Minimal drops, pantyliner' },
  { id: 'light', label: 'Light', desc: 'Light flow, change 2-3 times/day' },
  { id: 'medium', label: 'Medium', desc: 'Regular flow, standard protection' },
  { id: 'heavy', label: 'Heavy', desc: 'Substantial flow, frequent changes' },
];

export const PeriodLogModal: React.FC<PeriodLogModalProps> = ({
  isOpen,
  onClose,
  initialRecord,
  defaultDate,
}) => {
  const { addPeriod, editPeriod } = useCycleData();

  const isEditing = Boolean(initialRecord);

  // Form states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isOngoing, setIsOngoing] = useState<boolean>(false);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy' | 'spotting' | null>(null);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state on open
  useEffect(() => {
    if (!isOpen) return;

    if (initialRecord) {
      setStartDate(initialRecord.period_start);
      setEndDate(initialRecord.period_end || '');
      setIsOngoing(initialRecord.period_end === null);
      setFlowIntensity(initialRecord.flow_intensity || null);
      setNotes(initialRecord.notes || '');
    } else {
      const initialStart = defaultDate || new Date().toISOString().split('T')[0];
      setStartDate(initialStart);
      setEndDate('');
      setIsOngoing(true);
      setFlowIntensity('medium');
      setNotes('');
    }
    setErrorMessage(null);
  }, [isOpen, initialRecord, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!startDate) {
      setErrorMessage('Please select a period start date.');
      return;
    }

    const finalEndDate = isOngoing ? null : endDate || null;

    if (!isOngoing && endDate && endDate < startDate) {
      setErrorMessage('Period end date cannot be earlier than the start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      let result;

      if (isEditing && initialRecord) {
        result = await editPeriod(initialRecord.id, {
          period_start: startDate,
          period_end: finalEndDate,
          flow_intensity: flowIntensity,
          notes: notes.trim() || null,
        });
      } else {
        result = await addPeriod({
          period_start: startDate,
          period_end: finalEndDate,
          flow_intensity: flowIntensity,
          notes: notes.trim() || null,
        });
      }

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to save period record.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Period Record' : 'Log Menstrual Period'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label
            htmlFor="period-start-date"
            className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
          >
            Period Start Date <span className="text-plum">*</span>
          </label>
          <div className="relative">
            <input
              id="period-start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
            />
          </div>
        </div>

        {/* Ongoing toggle */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="period-ongoing"
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => {
              setIsOngoing(e.target.checked);
              if (e.target.checked) {
                setEndDate('');
              }
              setErrorMessage(null);
            }}
            className="w-4 h-4 rounded text-plum focus:ring-plum border-oviareBorder cursor-pointer accent-plum"
          />
          <label htmlFor="period-ongoing" className="text-xs text-oviareText-primary select-none cursor-pointer">
            This period is currently ongoing
          </label>
        </div>

        {/* End Date (if not ongoing) */}
        {!isOngoing && (
          <div className="animate-in fade-in duration-200">
            <label
              htmlFor="period-end-date"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Period End Date (Last Day of Bleeding)
            </label>
            <input
              id="period-end-date"
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
            />
            <p className="text-[11px] text-oviareText-secondary mt-1">
              Leave blank or check "ongoing" if your period has not concluded yet.
            </p>
          </div>
        )}

        {/* Flow Intensity Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1.5">
            Flow Intensity (Optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FLOW_OPTIONS.map((opt) => {
              const isSelected = flowIntensity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFlowIntensity(isSelected ? null : opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-plum/10 border-plum text-plum font-medium shadow-subtle'
                      : 'bg-white border-oviareBorder text-oviareText-secondary hover:border-plum/30'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Droplet className={`w-3.5 h-3.5 ${isSelected ? 'text-plum' : 'text-oviareText-secondary'}`} />
                    <span>{opt.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-plum" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="period-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
          >
            Observations or Notes (Optional)
          </label>
          <textarea
            id="period-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., arrived early, mild cramping on day 1..."
            className="w-full p-2.5 rounded-xl border border-oviareBorder bg-white text-xs text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum resize-none"
          />
        </div>

        {/* Informational Disclaimer */}
        <p className="text-[11px] text-oviareText-secondary leading-relaxed bg-ivory-50 p-2.5 rounded-xl border border-oviareBorder/60">
          Oviare calculates cycle lengths strictly between consecutive period start dates. All interval estimates are personal averages, not medical predictions.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-oviareBorder">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Record Period'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
