'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Bell, Check, Clock, ShieldCheck } from 'lucide-react';
import { useCycleData } from '@/context/CycleDataContext';

interface ReminderItem {
  id: string;
  title: string;
  timing: string;
  type: 'cycle' | 'wellness' | 'checkin';
  completed?: boolean;
}

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'r1',
    title: 'Estimated period window begins in ~4 days',
    timing: 'Sunday, Oct 5',
    type: 'cycle',
  },
  {
    id: 'r2',
    title: 'Late luteal self-care: hydrate and rest earlier',
    timing: 'Daily wellness reminder',
    type: 'wellness',
  },
  {
    id: 'r3',
    title: 'Record evening mood or sleep observations',
    timing: 'Evening check-in (8:00 PM)',
    type: 'checkin',
  },
];

export const UpcomingReminders: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const { showToast } = useCycleData();

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.completed;
          if (nextState) {
            showToast('Reminder marked as completed');
          }
          return { ...r, completed: nextState };
        }
        return r;
      })
    );
  };

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Upcoming Reminders"
        subtitle="Gentle cues based on your cycle timing"
        action={
          <div className="flex items-center gap-1.5 text-xs text-oviareText-secondary">
            <Bell className="w-3.5 h-3.5 text-sage" />
            <span>Active</span>
          </div>
        }
      />

      <div className="space-y-2.5">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
              reminder.completed
                ? 'bg-ivory-50 border-oviareBorder/60 opacity-60'
                : 'bg-white border-oviareBorder hover:border-plum/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggleReminder(reminder.id)}
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  reminder.completed
                    ? 'bg-sage text-white border-sage'
                    : 'border-oviareBorder hover:border-plum text-transparent'
                }`}
                aria-label={`Mark reminder "${reminder.title}" as ${
                  reminder.completed ? 'incomplete' : 'completed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <div>
                <p
                  className={`text-xs font-medium text-oviareText-primary ${
                    reminder.completed ? 'line-through text-oviareText-secondary' : ''
                  }`}
                >
                  {reminder.title}
                </p>
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {reminder.timing}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
