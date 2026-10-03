import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CycleDataProvider } from '@/context/CycleDataContext';
import { ReminderProvider } from '@/context/ReminderContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Oviare — Understand your rhythm',
  description:
    'An intentional, calm, and private reproductive health and menstrual cycle tracking web application.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Oviare',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F7F4F0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans bg-ivory text-oviareText-primary antialiased selection:bg-mauve selection:text-plum">
        <AuthProvider>
          <CycleDataProvider>
            <ReminderProvider>
              <AppShell>{children}</AppShell>
            </ReminderProvider>
          </CycleDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
