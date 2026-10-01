'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Check if recovery session is active
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setHasValidSession(false);
        setErrorMessage(
          'Your password reset session has expired or is invalid. Please request a new reset link.'
        );
      } else {
        setHasValidSession(true);
      }
    };

    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Unable to update password. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block focus-visible:outline-plum">
          <Logo size="lg" showTagline={true} />
        </Link>
        <h1 className="font-serif text-2xl font-medium text-oviareText-primary mt-6 tracking-tight">
          Set new password
        </h1>
        <p className="text-xs text-oviareText-secondary mt-1">
          Create a secure, private password for your Oviare account
        </p>
      </div>

      <Card variant="default" padding="lg">
        {hasValidSession === false ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-subtle">
              <ShieldAlert className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h2 className="font-serif text-lg font-medium text-oviareText-primary">
              Session Expired
            </h2>
            <p className="text-xs text-oviareText-secondary leading-relaxed">
              This recovery link is no longer valid or has already been used. Please request a new password reset email.
            </p>
            <div className="pt-4 border-t border-oviareBorder/70">
              <Link href="/forgot-password">
                <Button variant="primary" size="sm" className="w-full">
                  Request New Link
                </Button>
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sage-subtle text-sage flex items-center justify-center mx-auto shadow-subtle">
              <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h2 className="font-serif text-lg font-medium text-oviareText-primary">
              Password Updated
            </h2>
            <p className="text-xs text-oviareText-secondary leading-relaxed">
              Your password has been successfully updated. Redirecting you to your sanctuary...
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
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

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
