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
} from 'lucide-react';

import { useCycleData } from '@/context/CycleDataContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Log', href: '/log', icon: PlusCircle, isPrimary: true },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Profile', href: '/profile', icon: User },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { isDemoMode } = useCycleData();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-oviareBorder pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && pathname === '/');

          const linkHref = isDemoMode && item.href === '/profile' ? '/login?notice=account_required' : item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.name}
                href={linkHref}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label="Quick Log"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-floating transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-plum text-white ring-4 ring-mauve/40'
                      : 'bg-plum text-white hover:bg-plum-dark'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isActive ? 'text-plum font-semibold' : 'text-oviareText-secondary'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={linkHref}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors min-h-[44px] ${
                isActive ? 'text-plum' : 'text-oviareText-secondary hover:text-oviareText-primary'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.6]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
