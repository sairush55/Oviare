'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { MedicalDisclaimerBadge } from '../brand/MedicalDisclaimerBadge';
import { Plus, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCycleData } from '@/context/CycleDataContext';
import { useInstallPrompt } from '@/context/InstallPromptContext';

export const MobileHeader: React.FC = () => {
  const { user, profile } = useAuth();
  const { isDemoMode } = useCycleData();
  const { isInstalled, promptInstall } = useInstallPrompt();
  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OV';

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-oviareBorder">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Logo size="sm" showTagline={false} />
      </Link>
      <div className="flex items-center gap-2">
        <MedicalDisclaimerBadge compact={true} />
        {!isInstalled && (
          <button
            type="button"
            onClick={promptInstall}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-mauve/50 text-plum hover:bg-mauve transition-colors border border-mauve-border shadow-subtle"
            aria-label="Install App"
            title="Install Oviare App"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        <Link
          href="/log"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-plum text-white hover:bg-plum-dark transition-colors shadow-subtle"
          aria-label="Quick Log"
        >
          <Plus className="w-4 h-4" />
        </Link>
        <Link
          href={isDemoMode ? '/login?notice=account_required' : '/profile'}
          className="w-8 h-8 rounded-full bg-mauve text-plum font-serif text-xs font-medium flex items-center justify-center border border-mauve-border shadow-subtle"
          aria-label={isDemoMode ? 'Demo trial' : 'View Profile'}
        >
          {isDemoMode ? 'DM' : initials}
        </Link>
      </div>
    </header>
  );
};
