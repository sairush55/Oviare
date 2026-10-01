'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  BarChart2,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { MedicalDisclaimerBadge } from '../brand/MedicalDisclaimerBadge';
import { useCycleData } from '@/context/CycleDataContext';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Log', href: '/log', icon: PlusCircle },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isDemoMode, exitDemo } = useCycleData();
  const { user, profile, signOut } = useAuth();

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r border-oviareBorder bg-white/80 backdrop-blur-md h-screen sticky top-0 px-5 py-6 select-none"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="pb-6 border-b border-oviareBorder/60">
        <Link href="/dashboard" className="block focus-visible:outline-plum">
          <Logo size="md" showTagline={true} />
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="mt-6 flex-1 space-y-1.5" aria-label="Sidebar Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && pathname === '/');

          // If in demo mode and user clicks Profile, note that it requires an account
          const linkHref = isDemoMode && item.href === '/profile' ? '/login?notice=account_required' : item.href;

          return (
            <Link
              key={item.name}
              href={linkHref}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-mauve/70 text-plum font-semibold shadow-subtle'
                  : 'text-oviareText-secondary hover:text-oviareText-primary hover:bg-ivory-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-plum stroke-[2.2]' : 'text-oviareText-secondary'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Account / Demo Status in Bottom Area */}
      <div className="mt-auto pt-4 border-t border-oviareBorder/70 space-y-3">
        {isDemoMode ? (
          /* Demo Trial Account Box */
          <div className="p-3 rounded-xl bg-mauve/25 border border-mauve-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-plum flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Guest
              </span>
              <button
                type="button"
                onClick={exitDemo}
                className="text-[11px] text-oviareText-secondary hover:text-plum font-medium underline"
                title="Exit Demo"
              >
                Exit Demo
              </button>
            </div>
            <p className="text-[11px] text-oviareText-secondary leading-snug">
              Trial uses synthetic sample records.
            </p>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-plum text-white hover:bg-plum-dark text-xs font-medium transition-colors shadow-subtle"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Real Account
            </Link>
          </div>
        ) : user ? (
          /* Real Authenticated User Box */
          <div className="flex items-center justify-between p-2 rounded-xl bg-ivory-100 border border-oviareBorder">
            <Link href="/profile" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-8 h-8 rounded-full bg-mauve text-plum font-serif font-medium text-xs flex items-center justify-center shrink-0 border border-mauve-border group-hover:bg-mauve-dark transition-colors">
                {profile?.display_name
                  ? profile.display_name.slice(0, 2).toUpperCase()
                  : user?.email
                  ? user.email.slice(0, 2).toUpperCase()
                  : 'OV'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-oviareText-primary truncate group-hover:text-plum transition-colors">
                  {profile?.display_name || user?.email?.split('@')[0] || 'Member'}
                </p>
                <p className="text-[10px] text-oviareText-secondary truncate">
                  {user?.email || 'Authenticated'}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="p-1.5 rounded-lg text-oviareText-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Security boundary badge */}
        <div className="px-2.5 py-1.5 rounded-xl bg-sage-subtle/50 border border-sage/20 text-[11px] leading-relaxed text-oviareText-secondary">
          <div className="flex items-center gap-1.5 font-medium text-sage mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage" />
            <span>PostgreSQL & RLS Enforced</span>
          </div>
          <span>Sensitive health data isolated to your account.</span>
        </div>

        {/* Medical disclaimer badge */}
        <div className="pt-0.5">
          <MedicalDisclaimerBadge compact={true} />
        </div>
      </div>
    </aside>
  );
};
