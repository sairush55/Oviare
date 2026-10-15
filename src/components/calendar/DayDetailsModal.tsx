'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DailyLogRecord, CycleRecord } from '@/types';
import { useCycleData } from '@/context/CycleDataContext';
import {
  Droplet,
  Moon,
  Activity,
  Smile,
  Edit3,
  Calendar,
  Lock,
  Heart,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
  dailyLog?: DailyLogRecord | null;
  periodRecord?: CycleRecord | null;
  isPeriod?: boolean;
  isPredicted?: boolean;
  isFertile?: boolean;
  isToday?: boolean;
  onEditPeriod?: (record: CycleRecord) => void;
  onLogPeriod?: (dateStr: string) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dailyLog,
  periodRecord,
  isPeriod,
  isPredicted,
  isFertile,
  isToday,
  onEditPeriod,
  onLogPeriod,
}) => {
  const { removeDailyWellness, deletePeriod } = useCycleData();

  const [isDeletingLog, setIsDeletingLog] = useState(false);
  const [isConfirmingDeleteLog, setIsConfirmingDeleteLog] = useState(false);

  const [isDeletingPeriod, setIsDeletingPeriod] = useState(false);
  const [isConfirmingDeletePeriod, setIsConfirmingDeletePeriod] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!dateStr) return null;

  // Format date display
  const parsedDate = new Date(`${dateStr}T12:00:00Z`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const sleepHours = dailyLog?.sleep_duration_minutes
    ? Math.round((dailyLog.sleep_duration_minutes / 60) * 10) / 10
    : null;

  const handleDeleteLog = async () => {
    if (!dailyLog) return;
    setIsDeletingLog(true);
    setActionError(null);
    try {
      const res = await removeDailyWellness(dailyLog.id);
      if (res.success) {
        setIsConfirmingDeleteLog(false);
      } else {
        setActionError(res.error || 'Failed to remove daily log');
      }
    } catch {
      setActionError('An unexpected error occurred while deleting check-in');
    } finally {
      setIsDeletingLog(false);
    }
  };

  const handleDeletePeriod = async () => {
    if (!periodRecord) return;
    setIsDeletingPeriod(true);
    setActionError(null);
    try {
      const res = await deletePeriod(periodRecord.id);
      if (res.success) {
        setIsConfirmingDeletePeriod(false);
      } else {
        setActionError(res.error || 'Failed to remove period record');
      }
    } catch {
      setActionError('An unexpected error occurred while deleting period');
    } finally {
      setIsDeletingPeriod(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Day Overview" maxWidth="md">
      <div className="space-y-4">
        {actionError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}
        {/* Date header */}
        <div className="flex items-center justify-between pb-2 border-b border-oviareBorder">
          <div>
            <span className="text-xs text-oviareText-secondary block">Selected Date</span>
            <h4 className="font-serif text-lg font-medium text-oviareText-primary">
              {formattedDate}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isToday && <Badge variant="plum">Today</Badge>}
            {isPeriod && <Badge variant="plum">Recorded Period</Badge>}
            {isPredicted && <Badge variant="mauve">Predicted Period (Est.)</Badge>}
            {isFertile && <Badge variant="sage">Fertile Window (Est.)</Badge>}
          </div>
        </div>

        {/* Estimated Projection Notice (distinguishes estimates from actuals) */}
        {(isPredicted || isFertile) && !periodRecord && (
          <div className="p-3 rounded-xl bg-mauve/15 border border-mauve/30 text-xs text-oviareText-secondary space-y-1">
            <span className="font-semibold text-oviareText-primary block">
              {isPredicted ? 'Estimated Period Window' : 'Estimated Fertile Window'}
            </span>
            <p className="text-[11px] leading-relaxed">
              This window is an algorithmic projection based on your historical cycle rhythm. It is not an actual recorded period event.
            </p>
          </div>
        )}

        {/* Period Record Details if day is part of a recorded period */}
        {periodRecord && (
          <div className="p-3.5 rounded-xl bg-plum/5 border border-plum/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-plum flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-plum" />
                Period Details
              </span>
              <div className="flex items-center gap-1">
                {isConfirmingDeletePeriod ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-red-600 font-medium">Delete?</span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="h-6 text-[10px] px-2 bg-red-600 hover:bg-red-700 text-white"
                      isLoading={isDeletingPeriod}
                      onClick={handleDeletePeriod}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-1.5"
                      onClick={() => setIsConfirmingDeletePeriod(false)}
                      disabled={isDeletingPeriod}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    {onEditPeriod && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onClose();
                          onEditPeriod(periodRecord);
                        }}
                        className="h-7 text-xs text-plum hover:bg-plum/10"
                      >
                        Edit Period
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmingDeletePeriod(true)}
                      className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 p-1.5"
                      title="Delete this period record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-oviareText-secondary block text-[11px]">Start Date</span>
                <span className="font-medium text-oviareText-primary">{periodRecord.period_start}</span>
              </div>
              <div>
                <span className="text-oviareText-secondary block text-[11px]">End Date</span>
                <span className="font-medium text-oviareText-primary">
                  {periodRecord.period_end ? periodRecord.period_end : 'Ongoing'}
                </span>
              </div>
            </div>

            {periodRecord.flow_intensity && (
              <div className="text-xs">
                <span className="text-oviareText-secondary text-[11px] block">Flow Intensity</span>
                <span className="capitalize font-medium text-oviareText-primary">{periodRecord.flow_intensity}</span>
              </div>
            )}

            {periodRecord.notes && (
              <p className="text-xs text-oviareText-secondary italic bg-white/60 p-2 rounded-lg border border-plum/10">
                "{periodRecord.notes}"
              </p>
            )}
          </div>
        )}

        {/* Logged daily wellness entry */}
        {dailyLog ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
                Daily Wellness Check-in
              </span>
              {isConfirmingDeleteLog ? (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-red-600 font-medium">Delete check-in?</span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-red-600 hover:bg-red-700 text-white"
                    isLoading={isDeletingLog}
                    onClick={handleDeleteLog}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-1.5"
                    onClick={() => setIsConfirmingDeleteLog(false)}
                    disabled={isDeletingLog}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirmingDeleteLog(true)}
                  className="h-6 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 px-2"
                  leftIcon={<Trash2 className="w-3 h-3 text-red-600" />}
                >
                  Delete Log
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Smile className="w-3 h-3 text-plum" /> Mood
                </span>
                <span className="text-xs font-medium text-oviareText-primary capitalize mt-0.5 block truncate">
                  {dailyLog.moods.length > 0
                    ? dailyLog.moods.map((m) => m.replace(/_/g, ' ')).join(', ')
                    : 'None recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Moon className="w-3 h-3 text-plum" /> Sleep Rest
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-0.5 block">
                  {sleepHours !== null ? `${sleepHours} hrs` : 'Not recorded'}
                  {dailyLog.sleep_quality && (
                    <span className="text-[11px] text-oviareText-secondary capitalize block font-normal">
                      {dailyLog.sleep_quality} quality
                    </span>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Activity className="w-3 h-3 text-plum" /> Energy Vitality
                </span>
                <span className="text-xs font-medium text-oviareText-primary capitalize mt-0.5 block">
                  {dailyLog.energy_level !== null ? `${dailyLog.energy_level} / 5` : 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Heart className="w-3 h-3 text-plum" /> Intimacy
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-0.5 block">
                  {dailyLog.intimacy_logged ? 'Logged (Private)' : 'None recorded'}
                </span>
              </div>
            </div>

            {dailyLog.symptoms && dailyLog.symptoms.length > 0 && (
              <div>
                <span className="text-xs text-oviareText-secondary font-medium block mb-1.5">
                  Logged Symptoms ({dailyLog.symptoms.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dailyLog.symptoms.map((s) => (
                    <Badge key={s.symptom_name} variant="mauve" size="sm" className="capitalize">
                      {s.symptom_name.replace(/_/g, ' ')} ({s.severity})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {dailyLog.notes && (
              <div className="p-3 rounded-xl bg-ivory-50 border border-oviareBorder text-xs text-oviareText-secondary italic">
                "{dailyLog.notes}"
              </div>
            )}
          </div>
        ) : !periodRecord ? (
          <div className="py-6 text-center text-xs text-oviareText-secondary">
            <Calendar className="w-8 h-8 text-mauve-dark mx-auto mb-2 opacity-60" />
            <p>No period or wellness logs recorded for this date yet.</p>
          </div>
        ) : null}

        {/* Modal footer actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-oviareBorder">
          <div>
            {!periodRecord && onLogPeriod && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onLogPeriod(dateStr);
                }}
                leftIcon={<Droplet className="w-3.5 h-3.5 text-plum" />}
              >
                Log Period
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link href={`/log?date=${dateStr}`} onClick={onClose}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                {dailyLog ? 'Edit Daily Log' : 'Log This Day'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
