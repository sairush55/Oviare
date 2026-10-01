'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { DemoModeBanner } from './DemoModeBanner';
import { Toast } from '../ui/Toast';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isAuthOrOnboarding =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding');

  if (isAuthOrOnboarding) {
    return (
      <div className="min-h-screen bg-ivory text-oviareText-primary flex flex-col justify-between">
        <main className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 max-w-lg mx-auto w-full">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-oviareText-secondary">
          <p>Oviare • Understand your rhythm</p>
        </footer>
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-oviareText-primary">
      {/* Persistent Demo Trial Banner */}
      <DemoModeBanner />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Top Header */}
        <MobileHeader />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-24 md:pb-12 pt-4 md:pt-8 px-4 sm:px-6 md:px-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* App-wide Toast feedback */}
      <Toast />
    </div>
  );
};
