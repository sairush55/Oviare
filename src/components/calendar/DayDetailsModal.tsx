'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DailyLogEntry, CycleRecord } from '@/types';
import { Droplet, Moon, Activity, Smile, Edit3, Calendar, Plus } from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
  entry?: DailyLogEntry;
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
  entry,
  periodRecord,
  isPeriod,
  isPredicted,
  isFertile,
  isToday,
  onEditPeriod,
  onLogPeriod,
}) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Day Overview" maxWidth="md">
      <div className="space-y-4">
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

        {/* Period Record Details if day is part of a period */}
        {periodRecord && (
          <div className="p-3.5 rounded-xl bg-plum/5 border border-plum/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-plum flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-plum" />
                Period Details
              </span>
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

        {/* Logged daily symptoms if entry exists */}
        {entry ? (
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
              Daily Wellness Check-in
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-plum" /> Daily Flow
                </span>
                <span className="text-xs font-medium text-oviareText-primary capitalize mt-0.5 block">
                  {entry.flow}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Smile className="w-3 h-3 text-plum" /> Mood
                </span>
                <span className="text-xs font-medium text-oviareText-primary capitalize mt-0.5 block">
                  {entry.moods.length > 0
                    ? entry.moods.map((m) => m.replace('_', ' ')).join(', ')
                    : 'None recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Moon className="w-3 h-3 text-plum" /> Sleep
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-0.5 block">
                  {entry.sleepHours ? `${entry.sleepHours} hours` : 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Activity className="w-3 h-3 text-plum" /> Energy
                </span>
                <span className="text-xs font-medium text-oviareText-primary capitalize mt-0.5 block">
                  {entry.energy || 'Not recorded'}
                </span>
              </div>
            </div>

            {entry.symptoms.length > 0 && (
              <div>
                <span className="text-xs text-oviareText-secondary font-medium block mb-1.5">
                  Logged Symptoms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.symptoms.map((s) => (
                    <Badge key={s} variant="mauve" size="sm">
                      {s.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {entry.notes && (
              <div className="p-3 rounded-xl bg-ivory-50 border border-oviareBorder text-xs text-oviareText-secondary italic">
                "{entry.notes}"
              </div>
            )}

            {entry.isPrototypeSample && (
              <p className="text-[11px] text-oviareText-muted italic text-center pt-1">
                This entry is demonstration sample data.
              </p>
            )}
          </div>
        ) : !periodRecord ? (
          <div className="py-6 text-center text-xs text-oviareText-secondary">
            <Calendar className="w-8 h-8 text-mauve-dark mx-auto mb-2 opacity-60" />
            <p>No period or symptoms logged for this date yet.</p>
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
                {entry ? 'Edit Symptoms' : 'Log Symptoms'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
