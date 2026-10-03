'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Bell, BellOff, Check, Clock, ArrowRight, Settings } from 'lucide-react';
import { useReminders } from '@/context/ReminderContext';
import { useCycleData } from '@/context/CycleDataContext';

export const UpcomingReminders: React.FC = () => {
  const { preferences, activeInAppReminders, dismissReminder } = useReminders();
  const { showToast } = useCycleData();

  const handleDismiss = (id: string, title: string) => {
    dismissReminder(id);
    showToast(`Dismissed: "${title}" for today`);
  };

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Upcoming Reminders"
        subtitle="Gentle in-app rhythm cues and check-in prompts"
        action={
          <div className="flex items-center gap-2">
            <Badge
              variant={preferences.master_enabled ? 'sage' : 'neutral'}
              size="sm"
            >
              <div className="flex items-center gap-1">
                {preferences.master_enabled ? (
                  <>
                    <Bell className="w-3 h-3 text-sage" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3 h-3 text-oviareText-secondary" />
                    <span>Muted</span>
                  </>
                )}
              </div>
            </Badge>

            <Link
              href="/profile"
              className="text-xs text-oviareText-secondary hover:text-plum p-1 rounded-md hover:bg-ivory-100 transition-colors"
              title="Manage Reminder Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {!preferences.master_enabled ? (
        <div className="p-4 rounded-xl border border-dashed border-oviareBorder bg-ivory-50/50 text-center space-y-2">
          <p className="text-xs text-oviareText-secondary">
            Rhythm reminders are currently silenced.
          </p>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-xs text-plum font-medium">
              Configure Reminders in Profile →
            </Button>
          </Link>
        </div>
      ) : activeInAppReminders.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-oviareBorder bg-ivory-50/50 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-sage text-xs font-medium">
            <Check className="w-4 h-4" />
            <span>All Cues Up to Date</span>
          </div>
          <p className="text-[11px] text-oviareText-secondary">
            No pending check-ins or rhythm notices for today.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeInAppReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl border bg-white border-oviareBorder hover:border-plum/30 transition-all shadow-sm"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleDismiss(reminder.id, reminder.title)}
                  className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border border-oviareBorder hover:border-sage hover:bg-sage/10 text-oviareText-secondary hover:text-sage transition-colors shrink-0"
                  title="Dismiss reminder for today"
                  aria-label={`Dismiss "${reminder.title}"`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-oviareText-primary">
                    {reminder.title}
                  </p>
                  <p className="text-[11px] text-oviareText-secondary mt-0.5">
                    {reminder.description}
                  </p>
                  <span className="text-[10px] text-oviareText-secondary flex items-center gap-1 mt-1">
                    <Clock className="w-2.5 h-2.5 text-sage" />
                    {reminder.timingLabel}
                  </span>
                </div>
              </div>

              <Link href={reminder.actionUrl} className="shrink-0 pt-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-2.5 py-1 h-7 text-plum border-plum/30 hover:bg-mauve/20"
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                >
                  {reminder.actionLabel}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
