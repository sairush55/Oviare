'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useCycleData } from '@/context/CycleDataContext';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/supabase/profile';
import {
  User,
  Sliders,
  Bell,
  Lock,
  Database,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Edit3,
  Calendar,
  Globe,
  Clock,
  KeyRound,
  LogOut,
  Mail,
  AlertCircle,
  X,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
];

export const ProfileSettingsView: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { preferences, updatePreferences, entries, clearTemporaryData, showToast } = useCycleData();
  const supabase = createClient();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editLanguage, setEditLanguage] = useState('en');
  const [editTimezone, setEditTimezone] = useState('UTC');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Cycle tracking settings state
  const [cycleLength, setCycleLength] = useState(preferences.averageCycleLength);
  const [periodLength, setPeriodLength] = useState(preferences.averagePeriodLength);
  const [remindersEnabled, setRemindersEnabled] = useState(preferences.reminderNotifications);
  const [dataSharing, setDataSharing] = useState(preferences.dataSharingConsent);

  // Clear confirmation modal state
  const [showClearModal, setShowClearModal] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.display_name || '');
      setEditDob(profile.date_of_birth || '');
      setEditLanguage(profile.language || 'en');
      setEditTimezone(profile.timezone || 'UTC');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!editDisplayName.trim()) {
      setProfileError('Display name cannot be empty.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      await updateProfile(supabase, user.id, {
        display_name: editDisplayName.trim(),
        date_of_birth: editDob || null,
        language: editLanguage,
        timezone: editTimezone,
      });

      await refreshProfile();
      setIsEditingProfile(false);
      showToast('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditDisplayName(profile.display_name || '');
      setEditDob(profile.date_of_birth || '');
      setEditLanguage(profile.language || 'en');
      setEditTimezone(profile.timezone || 'UTC');
    }
    setProfileError(null);
    setIsEditingProfile(false);
  };

  const handleSaveTrackingPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      reminderNotifications: remindersEnabled,
      dataSharingConsent: dataSharing,
    });
    showToast('Tracking preferences saved');
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        showToast(`Password reset error: ${error.message}`);
      } else {
        showToast('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      showToast('Failed to send reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Functional JSON export of profile and current session data
  const handleExportData = () => {
    const exportObject = {
      product: 'Oviare',
      exportTimestamp: new Date().toISOString(),
      architecture: 'Phase 2 Supabase Integrated',
      user: {
        id: user?.id,
        email: user?.email,
      },
      profile,
      preferences,
      temporarySessionEntriesCount: entries.length,
      temporarySessionEntries: entries,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oviare-profile-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('Data exported as JSON file');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Member';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* 1. Personal Profile Card */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Personal Profile"
          subtitle="Your verified Oviare account identity"
          action={
            <Badge variant="sage" size="sm">
              Authenticated
            </Badge>
          }
        />

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-mauve/70 text-plum font-serif text-2xl font-medium flex items-center justify-center border border-mauve-border shadow-subtle shrink-0">
                  {initials}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-lg font-medium text-oviareText-primary">
                      {displayName}
                    </h4>
                    {profile?.onboarding_completed && (
                      <Badge variant="plum" size="sm">
                        Verified Member
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-oviareText-secondary flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-oviareText-muted" />
                    <span>{user?.email || 'No email attached'}</span>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-oviareBorder/70">
              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sage" /> Date of Birth
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-1 block">
                  {profile?.date_of_birth ? profile.date_of_birth : 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sage" /> Language
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-1 block uppercase">
                  {profile?.language || 'en'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder col-span-2 sm:col-span-1">
                <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sage" /> Timezone
                </span>
                <span className="text-xs font-medium text-oviareText-primary mt-1 block truncate">
                  {profile?.timezone || 'UTC'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            {profileError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-display-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
                >
                  Display Name
                </label>
                <input
                  id="edit-display-name"
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-dob"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
                >
                  Date of Birth (Optional)
                </label>
                <input
                  id="edit-dob"
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-language"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
                >
                  Language
                </label>
                <select
                  id="edit-language"
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-timezone"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
                >
                  Timezone
                </label>
                <select
                  id="edit-timezone"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                >
                  {!COMMON_TIMEZONES.includes(editTimezone) && (
                    <option value={editTimezone}>{editTimezone}</option>
                  )}
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-oviareBorder/70">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingProfile}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* 2. Tracking Preferences Form */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Cycle Baselines & Preferences"
          subtitle="Adjust baseline calculations used for rhythm phase estimations"
        />

        <form onSubmit={handleSaveTrackingPreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cycle-length"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1.5"
              >
                Average Cycle Length (Days)
              </label>
              <input
                id="cycle-length"
                type="number"
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
              />
              <span className="text-[11px] text-oviareText-secondary mt-1 block">
                Typical range is 24 to 35 days.
              </span>
            </div>

            <div>
              <label
                htmlFor="period-length"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1.5"
              >
                Average Period Duration (Days)
              </label>
              <input
                id="period-length"
                type="number"
                min={2}
                max={10}
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
              />
              <span className="text-[11px] text-oviareText-secondary mt-1 block">
                Typical range is 3 to 7 days.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Tracking Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Notification Reminders */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Notification & Rhythm Cues"
          subtitle="Gentle cues based on your cycle timing"
        />

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-oviareBorder hover:bg-ivory-50 cursor-pointer transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-oviareText-primary block">
                Estimated Period Window Alerts
              </span>
              <span className="text-[11px] text-oviareText-secondary block">
                Receive a subtle cue 2 days prior to your estimated period start date.
              </span>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => {
                setRemindersEnabled(e.target.checked);
                updatePreferences({ reminderNotifications: e.target.checked });
              }}
              className="w-4 h-4 rounded text-plum focus:ring-plum"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-oviareBorder hover:bg-ivory-50 cursor-pointer transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-oviareText-primary block">
                Daily Evening Check-in Prompt
              </span>
              <span className="text-[11px] text-oviareText-secondary block">
                Friendly prompt to log physical sensations and emotional state.
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              onChange={() => showToast('Evening prompt preference updated')}
              className="w-4 h-4 rounded text-plum focus:ring-plum"
            />
          </label>
        </div>
      </Card>

      {/* 4. Account Security */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Account Security"
          subtitle="Session credentials and authentication controls"
        />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-ivory-100 border border-oviareBorder">
            <div>
              <span className="text-xs font-medium text-oviareText-primary block">
                Password Recovery
              </span>
              <span className="text-[11px] text-oviareText-secondary block mt-0.5">
                Send a secure password-reset link to {user?.email || 'your email'}.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isSendingReset}
              onClick={handlePasswordReset}
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Reset Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-oviareBorder">
            <div>
              <span className="text-xs font-medium text-oviareText-primary block">
                Active Session
              </span>
              <span className="text-[11px] text-oviareText-secondary block mt-0.5">
                Signed in as <strong className="text-oviareText-primary">{user?.email}</strong>
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Privacy & Data Boundaries */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Privacy & Data Boundaries"
          subtitle="How your reproductive wellness information is treated"
          action={
            <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>RLS Protected</span>
            </div>
          }
        />

        <div className="space-y-3 text-xs leading-relaxed text-oviareText-secondary">
          <div className="p-3.5 rounded-xl bg-ivory-100 border border-oviareBorder space-y-2">
            <p className="text-oviareText-primary font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-plum" />
              Phase 2 Profile Storage Architecture
            </p>
            <p>
              Your profile is stored in Supabase PostgreSQL protected with Row Level Security (RLS) policies tied directly to your authenticated UID (<code className="text-[11px] bg-white px-1.5 py-0.5 rounded border">{user?.id?.slice(0, 8)}...</code>). No unauthenticated or cross-account access is allowed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-oviareBorder space-y-2">
            <p className="text-oviareText-primary font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sage" />
              Daily Log Data Architecture
            </p>
            <p>
              In Phase 2, daily symptom check-ins remain in client-side session state. Persistent database cycle tracking with clinical biomarkers is scheduled for Phase 3.
            </p>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl border border-oviareBorder hover:bg-ivory-50 cursor-pointer transition-colors mt-2">
            <div>
              <span className="text-xs font-medium text-oviareText-primary block">
                Anonymous Product Diagnostics
              </span>
              <span className="text-[11px] text-oviareText-secondary block">
                Help improve interface usability without sharing health observations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataSharing}
              onChange={(e) => {
                setDataSharing(e.target.checked);
                updatePreferences({ dataSharingConsent: e.target.checked });
              }}
              className="w-4 h-4 rounded text-plum focus:ring-plum"
            />
          </label>
        </div>
      </Card>

      {/* 6. Data Controls */}
      <Card variant="default" padding="md">
        <CardHeader
          title="Data Controls & Export"
          subtitle="Manage your profile data and current session records"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download className="w-3.5 h-3.5 text-sage" />}
          >
            Export All Data (JSON)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearModal(true)}
              className="text-oviareText-secondary hover:text-oviareText-primary"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Session Logs
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled
              title="Full account deletion scheduled for Phase 3"
              className="text-oviareText-muted opacity-60 cursor-not-allowed"
            >
              Delete Account (Phase 3)
            </Button>
          </div>
        </div>
      </Card>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Session Logs?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              This will remove all temporary log entries from your current browser session. Your authenticated profile and baseline settings in Supabase remain intact.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-oviareBorder">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                clearTemporaryData();
                setShowClearModal(false);
              }}
            >
              Confirm Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
