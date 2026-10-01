'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { MailCheck, ArrowRight, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const e = params.get('email');
      if (e) setEmail(e);
    }
  }, []);

  const supabase = createClient();

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('No email address was provided. Please return to login.');
      return;
    }

    setIsResending(true);
    setResendStatus(null);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Unable to resend verification email.');
      } else {
        setResendStatus('A fresh verification link has been sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block focus-visible:outline-plum">
          <Logo size="lg" showTagline={true} />
        </Link>
      </div>

      <Card variant="default" padding="lg" className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-mauve/40 text-plum flex items-center justify-center mx-auto mb-4 shadow-subtle">
          <MailCheck className="w-7 h-7 stroke-[1.5]" />
        </div>

        <h1 className="font-serif text-2xl font-medium text-oviareText-primary tracking-tight">
          Check your inbox
        </h1>
        <p className="text-xs text-oviareText-secondary mt-2 leading-relaxed max-w-sm mx-auto">
          We have sent a secure verification link to{' '}
          {email ? (
            <strong className="text-oviareText-primary font-semibold">{email}</strong>
          ) : (
            'your registered email'
          )}
          . Click the link inside to verify your account and begin your journey.
        </p>

        {resendStatus && (
          <div className="my-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-sage-subtle border border-sage/30 text-xs text-sage">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="my-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-oviareBorder/70 flex flex-col gap-3">
          {email && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isResending}
              onClick={handleResend}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Resend verification email
            </Button>
          )}

          <Link href="/login">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
