'use client';

import React from 'react';
import Link from 'next/link';
import { useReminders } from '@/context/ReminderContext';
import { Bell, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const InAppReminderBanner: React.FC = () => {
  const { preferences, activeInAppReminders, dismissReminder } = useReminders();

  if (!preferences.master_enabled || activeInAppReminders.length === 0) {
    return null;
  }

  // Display the top priority active reminder
  const topReminder = activeInAppReminders[0];

  return (
    <div className="w-full bg-mauve/30 border-b border-mauve/50 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-plum/10 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-plum" />
          </div>
          <div className="truncate">
            <span className="font-semibold text-oviareText-primary mr-1.5">
              In-App Reminder:
            </span>
            <span className="text-oviareText-secondary">
              {topReminder.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={topReminder.actionUrl}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2.5 py-1 h-7 bg-white text-plum border-plum/30 hover:bg-white/80"
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              {topReminder.actionLabel}
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => dismissReminder(topReminder.id)}
            className="text-oviareText-secondary hover:text-oviareText-primary p-1 rounded-md hover:bg-mauve/40 transition-colors"
            title="Dismiss in-app reminder"
            aria-label="Dismiss in-app reminder"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
