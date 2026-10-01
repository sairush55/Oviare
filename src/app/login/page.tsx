'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCycleData } from '@/context/CycleDataContext';
import { createClient } from '@/lib/supabase/client';
import { getProfile, ensureProfile } from '@/lib/supabase/profile';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { enterDemo, exitDemo } = useCycleData();

  const [redirectTarget, setRedirectTarget] = useState('/dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const red = params.get('redirect');
      const err = params.get('error');
      const notice = params.get('notice');
      if (red) setRedirectTarget(red);
      if (err) setErrorMessage(err);
      if (notice === 'account_required') {
        setInfoNotice('Account settings and private profile management require a real account.');
      }
    }
  }, []);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Clear any prior demo state when signing into a real account
      exitDemo();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErrorMessage(
            'Your email address has not been confirmed yet. Please check your inbox for the verification link.'
          );
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
        } else {
          setErrorMessage(error.message || 'Unable to sign in. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        let profile = await getProfile(supabase, data.user.id);
        if (!profile) {
          profile = await ensureProfile(supabase, data.user);
        }

        if (!profile.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push(redirectTarget);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleTryDemo = () => {
    enterDemo();
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block focus-visible:outline-plum">
          <Logo size="lg" showTagline={true} />
        </Link>
        <h1 className="font-serif text-2xl font-medium text-oviareText-primary mt-6 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-oviareText-secondary mt-1">
          Sign in to your private cycle sanctuary
        </p>
      </div>

      {infoNotice && (
        <div className="mb-4 p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary">
          {infoNotice}
        </div>
      )}

      <Card variant="default" padding="lg">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-oviareBorder bg-white text-xs font-medium text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum hover:border-plum/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-oviareText-secondary"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-plum hover:text-plum-dark underline focus-visible:outline-plum"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-oviareText-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-oviareBorder/70 text-center">
          <p className="text-xs text-oviareText-secondary">
            Don't have an account yet?{' '}
            <Link
              href="/signup"
              className="font-medium text-plum hover:text-plum-dark underline focus-visible:outline-plum"
            >
              Create account
            </Link>
          </p>
        </div>
      </Card>

      {/* Try Interactive Demo Card */}
      <div className="mt-4 p-4 rounded-2xl bg-white border border-oviareBorder text-center shadow-subtle animate-in fade-in">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Sparkles className="w-4 h-4 text-plum" />
          <h2 className="font-serif text-sm font-medium text-oviareText-primary">
            Curious to explore first?
          </h2>
        </div>
        <p className="text-xs text-oviareText-secondary mb-3 leading-relaxed max-w-sm mx-auto">
          Experience Oviare's calendar, cycle rhythm calculations, and daily wellness tracking with safe synthetic demo data. No account required.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTryDemo}
          className="w-full border-plum/30 text-plum hover:bg-mauve-light/40"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Try Interactive Demo
        </Button>
      </div>
    </div>
  );
}
