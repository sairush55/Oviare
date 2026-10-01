'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { MedicalDisclaimerBadge } from '../brand/MedicalDisclaimerBadge';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const MobileHeader: React.FC = () => {
  const { user, profile } = useAuth();
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
        <Link
          href="/log"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-plum text-white hover:bg-plum-dark transition-colors shadow-subtle"
          aria-label="Quick Log"
        >
          <Plus className="w-4 h-4" />
        </Link>
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-mauve text-plum font-serif text-xs font-medium flex items-center justify-center border border-mauve-border shadow-subtle"
          aria-label="View Profile"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
};
