'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          setErrorMessage(
            'Email request rate limit reached. Supabase built-in service allows a limited number of emails per hour. Please wait a short while or configure custom SMTP in Supabase.'
          );
        } else {
          setErrorMessage(error.message || 'Unable to request password reset. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Security practice: Always show friendly confirmation without confirming account existence
      setIsSubmitted(true);
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
          Recover your access
        </h1>
        <p className="text-xs text-oviareText-secondary mt-1">
          Enter your email to receive password reset instructions
        </p>
      </div>

      <Card variant="default" padding="lg">
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sage-subtle text-sage flex items-center justify-center mx-auto shadow-subtle">
              <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h2 className="font-serif text-lg font-medium text-oviareText-primary">
              Instructions Sent
            </h2>
            <p className="text-xs text-oviareText-secondary leading-relaxed">
              If an Oviare account is associated with <strong className="text-oviareText-primary">{email}</strong>, you will receive an email shortly with a secure link to reset your password.
            </p>
            <div className="pt-4 border-t border-oviareBorder/70">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Back to Sign In
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
                htmlFor="reset-email"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
              >
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Send Reset Link
            </Button>

            <div className="pt-4 border-t border-oviareBorder/70 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-oviareText-secondary hover:text-oviareText-primary focus-visible:outline-plum"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
