'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileSettingsView } from '@/components/profile/ProfileSettingsView';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Profile & Preferences"
        subtitle="Manage personal baselines, reminder cues, and review privacy architecture"
        badge={
          <Badge variant="neutral" size="sm">
            Phase 1 Settings
          </Badge>
        }
      />

      <ProfileSettingsView />
    </div>
  );
}
