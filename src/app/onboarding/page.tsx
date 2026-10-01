'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { updateProfile, getProfile, ensureProfile } from '@/lib/supabase/profile';
import {
  User,
  Calendar,
  Globe,
  Clock,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

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

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [reminderNotifications, setReminderNotifications] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Detect system timezone
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTz) {
      setTimezone(detectedTz);
    }

    if (profile) {
      if (profile.display_name) setDisplayName(profile.display_name);
      if (profile.date_of_birth) setDateOfBirth(profile.date_of_birth);
      if (profile.language) setLanguage(profile.language);
      if (profile.timezone) setTimezone(profile.timezone);
    } else if (user) {
      const fallbackName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        (user.email ? user.email.split('@')[0] : '');
      setDisplayName(fallbackName);
    }
  }, [profile, user]);

  const handleCompleteOnboarding = async (skipOptional = false) => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Ensure profile exists
      let existingProfile = profile;
      if (!existingProfile) {
        existingProfile = await ensureProfile(supabase, user);
      }

      await updateProfile(supabase, user.id, {
        display_name: displayName.trim() || existingProfile.display_name || 'Member',
        date_of_birth: !skipOptional && dateOfBirth ? dateOfBirth : null,
        language: language || 'en',
        timezone: timezone || 'UTC',
        onboarding_completed: true,
      });

      await refreshProfile();
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save onboarding settings. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Please provide a preferred name to continue.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Logo size="md" showTagline={true} />
        <h1 className="font-serif text-2xl font-medium text-oviareText-primary mt-6 tracking-tight">
          Personalize your experience
        </h1>
        <p className="text-xs text-oviareText-secondary mt-1">
          A gentle foundation tailored to your rhythm
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentStep === 1 ? 'w-10 bg-plum' : 'w-6 bg-plum/40'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentStep === 2 ? 'w-10 bg-plum' : 'w-6 bg-oviareBorder'
            }`}
          />
        </div>
      </div>

      <Card variant="default" padding="lg">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Basic Identity */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-5">
            <div className="border-b border-oviareBorder/70 pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sage block">
                Step 1 of 2
              </span>
              <h2 className="font-serif text-lg font-medium text-oviareText-primary mt-0.5">
                How should Oviare address you?
              </h2>
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="onboarding-display-name"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                Preferred Display Name <span className="text-plum">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
                />
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="onboarding-dob"
                  className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary"
                >
                  Date of Birth
                </label>
                <Badge variant="neutral" size="sm">
                  Optional
                </Badge>
              </div>
              <div className="relative">
                <input
                  id="onboarding-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                />
              </div>
              <div className="flex items-start gap-1.5 mt-2 text-[11px] text-oviareText-secondary leading-relaxed">
                <Info className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                <span>
                  Allows Oviare to provide age-appropriate rhythm literacy. Your birthday is kept strictly private.
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCompleteOnboarding(true)}
                className="text-xs text-oviareText-secondary hover:text-oviareText-primary underline focus-visible:outline-plum"
              >
                Skip optional setup
              </button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Preferences
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Preferences & Timing */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-oviareBorder/70 pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sage block">
                Step 2 of 2
              </span>
              <h2 className="font-serif text-lg font-medium text-oviareText-primary mt-0.5">
                Preferences & Timezone
              </h2>
            </div>

            {/* Language */}
            <div>
              <label
                htmlFor="onboarding-language"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                Preferred Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <Globe className="w-4 h-4" />
                </div>
                <select
                  id="onboarding-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label
                htmlFor="onboarding-timezone"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                Timezone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <Clock className="w-4 h-4" />
                </div>
                <select
                  id="onboarding-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary focus-visible:outline-plum hover:border-plum/40"
                >
                  {!COMMON_TIMEZONES.includes(timezone) && (
                    <option value={timezone}>{timezone} (Detected)</option>
                  )}
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cycle reminder opt-in */}
            <div className="p-3.5 rounded-xl bg-ivory-100 border border-oviareBorder">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderNotifications}
                  onChange={(e) => setReminderNotifications(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-plum focus:ring-plum"
                />
                <div>
                  <span className="text-xs font-medium text-oviareText-primary block">
                    Enable gentle rhythm reminders
                  </span>
                  <span className="text-[11px] text-oviareText-secondary block mt-0.5">
                    Receive quiet cues before estimated period starts and check-in reminders.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isLoading}
                onClick={() => handleCompleteOnboarding(false)}
                rightIcon={<Check className="w-3.5 h-3.5" />}
              >
                Complete & Enter Oviare
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
