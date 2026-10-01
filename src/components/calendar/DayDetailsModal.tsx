'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DailyLogEntry } from '@/types';
import { Droplet, Moon, Activity, Smile, Edit3, Calendar } from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
  entry?: DailyLogEntry;
  isPeriod?: boolean;
  isPredicted?: boolean;
  isFertile?: boolean;
  isToday?: boolean;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  entry,
  isPeriod,
  isPredicted,
  isFertile,
  isToday,
}) => {
  if (!dateStr) return null;

  // Format date display
  const parsedDate = new Date(`${dateStr}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
          <div className="flex items-center gap-1.5">
            {isToday && <Badge variant="plum">Today</Badge>}
            {isPeriod && <Badge variant="plum">Logged Period</Badge>}
            {isPredicted && <Badge variant="mauve">Predicted Period (Est.)</Badge>}
            {isFertile && <Badge variant="sage">Fertile Window (Est.)</Badge>}
          </div>
        </div>

        {/* Logged details if entry exists */}
        {entry ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-plum" /> Flow
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
        ) : (
          <div className="py-6 text-center text-xs text-oviareText-secondary">
            <Calendar className="w-8 h-8 text-mauve-dark mx-auto mb-2 opacity-60" />
            <p>No symptoms or flow logged for this date yet.</p>
          </div>
        )}

        {/* Modal footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-oviareBorder">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link href={`/log?date=${dateStr}`} onClick={onClose}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              {entry ? 'Edit Log' : 'Log This Day'}
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
