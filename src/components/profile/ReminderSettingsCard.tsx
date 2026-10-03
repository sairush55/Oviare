'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useReminders } from '@/context/ReminderContext';
import { useCycleData } from '@/context/CycleDataContext';
import {
  Bell,
  BellOff,
  Clock,
  ShieldCheck,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  HeartHandshake,
  Sparkles,
  Share,
  Download,
} from 'lucide-react';
import { ReminderType } from '@/types';
import { useInstallPrompt } from '@/context/InstallPromptContext';

const COMMON_HOURS = [
  { value: '08:00', label: '8:00 AM (Morning)' },
  { value: '12:00', label: '12:00 PM (Midday)' },
  { value: '18:00', label: '6:00 PM (Early Evening)' },
  { value: '20:00', label: '8:00 PM (Evening — Recommended)' },
  { value: '21:30', label: '9:30 PM (Night)' },
];

export const ReminderSettingsCard: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    pushPermissionStatus,
    isPushSubscribed,
    isPushSupported,
    enableWebPush,
    disableWebPush,
    simulateNotificationPreview,
  } = useReminders();
  const { isDemoMode } = useCycleData();
  const { isInstalled, openInstallModal, promptInstall } = useInstallPrompt();

  const [isUpdatingPush, setIsUpdatingPush] = useState(false);
  const [pushErrorMessage, setPushErrorMessage] = useState<string | null>(null);

  const handleMasterToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    await updatePreferences({ master_enabled: enabled });
  };

  const handleToggleWellness = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updatePreferences({ wellness_reminder_enabled: e.target.checked });
  };

  const handleTogglePeriodLogging = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updatePreferences({ period_logging_reminder_enabled: e.target.checked });
  };

  const handleToggleEstimatedPeriod = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updatePreferences({ estimated_period_reminder_enabled: e.target.checked });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updatePreferences({ preferred_time: e.target.value });
  };

  const handleLeadDaysChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const days = parseInt(e.target.value, 10) as 1 | 2 | 3;
    await updatePreferences({ estimated_period_lead_days: days });
  };

  const handleEnablePush = async () => {
    setIsUpdatingPush(true);
    setPushErrorMessage(null);
    const res = await enableWebPush();
    if (!res.success && res.error) {
      setPushErrorMessage(res.error);
    }
    setIsUpdatingPush(false);
  };

  const handleDisablePush = async () => {
    setIsUpdatingPush(true);
    setPushErrorMessage(null);
    await disableWebPush();
    setIsUpdatingPush(false);
  };

  return (
    <Card variant="default" padding="md" className="space-y-6">
      <CardHeader
        title="Reminders & Notifications"
        subtitle="Discreet, privacy-first cues based on your rhythm timing"
        action={
          <Badge
            variant={preferences.master_enabled ? 'sage' : 'neutral'}
            size="sm"
          >
            {preferences.master_enabled ? 'Reminders Active' : 'All Muted'}
          </Badge>
        }
      />

      {isDemoMode && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-100 border border-mauve/40 text-xs text-oviareText-secondary">
          <Sparkles className="w-4 h-4 text-plum shrink-0 mt-0.5" />
          <span>
            <strong className="text-oviareText-primary">Demo Mode Active:</strong> You can customize reminder options and test simulated previews in this temporary sandbox without registering real browser subscriptions.
          </span>
        </div>
      )}

      {/* 1. Master Toggle */}
      <div className="p-4 rounded-xl border border-oviareBorder bg-white flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {preferences.master_enabled ? (
              <Bell className="w-4 h-4 text-plum" />
            ) : (
              <BellOff className="w-4 h-4 text-oviareText-secondary" />
            )}
            <span className="text-sm font-medium text-oviareText-primary">
              Allow Rhythm Reminders
            </span>
          </div>
          <p className="text-xs text-oviareText-secondary">
            Master control. When disabled, all reminder channels and scheduled deliveries are silenced.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={preferences.master_enabled}
            onChange={handleMasterToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum"></div>
        </label>
      </div>

      {/* 2. Individual Categories */}
      <div
        className={`space-y-3 transition-opacity ${
          preferences.master_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
          Reminder Categories
        </span>

        {/* Daily Wellness */}
        <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-oviareBorder hover:bg-ivory-50/50 cursor-pointer transition-colors">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-oviareText-primary block">
              Daily Wellness Check-in
            </span>
            <span className="text-[11px] text-oviareText-secondary block">
              Discreet evening cue: <em>&ldquo;A little time for your Oviare check-in.&rdquo;</em> Automatically silenced if already logged for the day.
            </span>
          </div>
          <input
            type="checkbox"
            checked={preferences.wellness_reminder_enabled}
            onChange={handleToggleWellness}
            disabled={!preferences.master_enabled}
            className="w-4 h-4 rounded text-plum focus:ring-plum mt-1 shrink-0"
          />
        </label>

        {/* Period Logging */}
        <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-oviareBorder hover:bg-ivory-50/50 cursor-pointer transition-colors">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-oviareText-primary block">
              Period Logging Cue
            </span>
            <span className="text-[11px] text-oviareText-secondary block">
              Discreet log update cue: <em>&ldquo;Would you like to update your Oviare log?&rdquo;</em> Silenced when an active period is already recorded.
            </span>
          </div>
          <input
            type="checkbox"
            checked={preferences.period_logging_reminder_enabled}
            onChange={handleTogglePeriodLogging}
            disabled={!preferences.master_enabled}
            className="w-4 h-4 rounded text-plum focus:ring-plum mt-1 shrink-0"
          />
        </label>

        {/* Upcoming Estimated Period */}
        <div className="p-3.5 rounded-xl border border-oviareBorder space-y-3">
          <label className="flex items-start justify-between gap-3 cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-oviareText-primary block">
                Upcoming Estimated Period Notice
              </span>
              <span className="text-[11px] text-oviareText-secondary block">
                Subtle reminder before an estimated period window: <em>&ldquo;Your Oviare cycle reminder is coming up.&rdquo;</em> Only active when sufficient cycle history exists.
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.estimated_period_reminder_enabled}
              onChange={handleToggleEstimatedPeriod}
              disabled={!preferences.master_enabled}
              className="w-4 h-4 rounded text-plum focus:ring-plum mt-1 shrink-0"
            />
          </label>

          {preferences.estimated_period_reminder_enabled && (
            <div className="pt-2 border-t border-oviareBorder/60 flex items-center justify-between text-xs">
              <span className="text-oviareText-secondary">Advance Notice Lead Time:</span>
              <select
                value={preferences.estimated_period_lead_days}
                onChange={handleLeadDaysChange}
                disabled={!preferences.master_enabled}
                className="px-2.5 py-1.5 rounded-lg border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus:outline-plum"
              >
                <option value={1}>1 day before estimated date</option>
                <option value={2}>2 days before (Recommended)</option>
                <option value={3}>3 days before</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Preferred Time & Local Timezone */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${
          preferences.master_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <div className="p-3.5 rounded-xl border border-oviareBorder bg-ivory-50/30 space-y-1.5">
          <label
            htmlFor="preferred-reminder-time"
            className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary"
          >
            Preferred Reminder Time
          </label>
          <select
            id="preferred-reminder-time"
            value={preferences.preferred_time}
            onChange={handleTimeChange}
            disabled={!preferences.master_enabled}
            className="w-full px-3 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum"
          >
            {COMMON_HOURS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-oviareText-secondary block">
            Timed to your local clock schedule.
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-oviareBorder bg-ivory-50/30 space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            Active Timezone
          </span>
          <div className="px-3 py-2 rounded-xl border border-oviareBorder/80 bg-white/70 text-xs font-medium text-oviareText-primary truncate">
            {preferences.timezone || 'UTC'}
          </div>
          <span className="text-[11px] text-oviareText-secondary block">
            Synchronized with your profile preferences.
          </span>
        </div>
      </div>

      {/* 4. Web Push Notification Device Controls */}
      <div className="p-4 rounded-xl border border-oviareBorder bg-white space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-plum" />
              <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
                Browser Web Push (Optional)
              </span>
            </div>
            <p className="text-xs text-oviareText-primary font-medium">
              Deliver discreet notifications to this browser even when the application is closed.
            </p>
          </div>

          <Badge
            variant={
              isPushSubscribed
                ? 'sage'
                : pushPermissionStatus === 'denied'
                ? 'neutral'
                : 'mauve'
            }
            size="sm"
          >
            {isPushSubscribed
              ? 'Push Active'
              : pushPermissionStatus === 'denied'
              ? 'Permission Denied'
              : pushPermissionStatus === 'needs_install'
              ? 'PWA Install Needed'
              : pushPermissionStatus === 'unsupported'
              ? 'Unsupported Browser'
              : 'Push Inactive'}
          </Badge>
        </div>

        {pushErrorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pushErrorMessage}</span>
          </div>
        )}

        {/* Device-specific explanations */}
        {pushPermissionStatus === 'needs_install' && (
          <div className="p-3.5 rounded-xl bg-mauve/20 border border-mauve/50 text-xs text-oviareText-primary space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-plum">
              <Share className="w-3.5 h-3.5" />
              <span>Apple iOS / iPadOS Setup Required</span>
            </div>
            <p className="text-[11px] text-oviareText-secondary leading-relaxed">
              Safari on iOS 16.4+ requires Web Push apps to be added to the Home Screen. Tap the <strong>Share button</strong> (⎋) in Safari and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>, then launch Oviare from your Home Screen to enable push notifications.
            </p>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openInstallModal}
                className="text-xs bg-white text-plum border-mauve-border hover:bg-mauve/20"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                View 3-Step iOS Guide
              </Button>
            </div>
          </div>
        )}

        {pushPermissionStatus === 'denied' && (
          <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary space-y-1">
            <p className="text-oviareText-primary font-medium">
              Notifications are currently blocked by browser permissions.
            </p>
            <p className="text-[11px]">
              To enable: Click the site settings icon in your browser address bar, reset notification permissions to &ldquo;Allow&rdquo;, and refresh the page. In-app reminders will continue working normally.
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isPushSubscribed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isUpdatingPush}
              onClick={handleDisablePush}
              leftIcon={<BellOff className="w-3.5 h-3.5" />}
            >
              Disable Web Push on this Device
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isUpdatingPush}
              onClick={handleEnablePush}
              disabled={pushPermissionStatus === 'unsupported' || pushPermissionStatus === 'needs_install'}
              leftIcon={<Bell className="w-3.5 h-3.5" />}
            >
              Enable Web Push Notifications
            </Button>
          )}

          {!isInstalled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={promptInstall}
              className="text-xs bg-white text-plum border-mauve-border hover:bg-mauve/20"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Install App on Device
            </Button>
          )}

          <div className="flex items-center gap-1 text-[11px] text-oviareText-secondary ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
            <span>In-app reminders always active as fallback</span>
          </div>
        </div>
      </div>

      {/* 5. Notification Preview & Verification */}
      <div className="p-4 rounded-xl border border-oviareBorder/80 bg-ivory-50/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-oviareText-secondary">
            <Eye className="w-3.5 h-3.5 text-sage" />
            <span>Test Discreet Preview</span>
          </div>
          <span className="text-[11px] text-oviareText-secondary">
            Lock-screen wording verification
          </span>
        </div>

        <p className="text-xs text-oviareText-secondary">
          Click below to test how Oviare&apos;s privacy-conscious notification text appears:
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => simulateNotificationPreview('wellness')}
            className="text-xs py-1 px-2.5 h-8 bg-white"
          >
            Check-in Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => simulateNotificationPreview('period_logging')}
            className="text-xs py-1 px-2.5 h-8 bg-white"
          >
            Period Cue Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => simulateNotificationPreview('estimated_period')}
            className="text-xs py-1 px-2.5 h-8 bg-white"
          >
            Upcoming Cycle Preview
          </Button>
        </div>
      </div>

      {/* 6. Privacy & Medical Non-Diagnostic Statement */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-oviareText-primary">
            Privacy & Non-Diagnostic Boundary
          </p>
          <p className="text-[11px]">
            Oviare reminders are completely optional and designed for personal awareness. Notification payloads never include symptoms, mood, sleep, intimacy records, or notes. Reminders are calculated purely from your logged dates and do not provide clinical diagnosis or contraceptive certainty.
          </p>
        </div>
      </div>
    </Card>
  );
};
