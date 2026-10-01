'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { ensureProfile } from '@/lib/supabase/profile';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!displayName.trim()) {
      setErrorMessage('Please enter your preferred display name.');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please acknowledge the terms and privacy boundary notice.');
      return;
    }

    setIsLoading(true);

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Unable to register. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // If session exists immediately (e.g. email confirmation disabled in Supabase)
        if (data.session) {
          try {
            await ensureProfile(supabase, data.user);
          } catch (profileErr) {
            console.warn('Initial profile creation queued:', profileErr);
          }
          router.push('/onboarding');
        } else {
          // Email confirmation is required by Supabase
          router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block focus-visible:outline-plum">
          <Logo size="lg" showTagline={true} />
        </Link>
        <h1 className="font-serif text-2xl font-medium text-oviareText-primary mt-6 tracking-tight">
          Begin your rhythm
        </h1>
        <p className="text-xs text-oviareText-secondary mt-1">
          Create your private Oviare account to personalize your journey
        </p>
      </div>

      <Card variant="default" padding="lg">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label
              htmlFor="display-name"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Preferred Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <User className="w-4 h-4" />
              </div>
              <input
                id="display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Maya"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-oviareText-secondary hover:text-oviareText-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-oviareText-secondary hover:text-oviareText-primary"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms & Privacy Notice */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-plum focus:ring-plum"
              />
              <span className="text-[11px] leading-relaxed text-oviareText-secondary">
                I understand Oviare is an informational cycle tracking tool, not a diagnostic or contraception service, and agree to the Terms of Service.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-oviareBorder/70 text-center">
          <p className="text-xs text-oviareText-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-plum hover:text-plum-dark underline focus-visible:outline-plum"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
