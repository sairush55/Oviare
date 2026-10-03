'use client';

import React, { useState } from 'react';
import { useInstallPrompt } from '@/context/InstallPromptContext';
import { Smartphone, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const InstallAppBanner: React.FC = () => {
  const { isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="md:hidden w-full bg-ivory-100 border-b border-oviareBorder/80 px-4 py-2 text-xs transition-all">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-plum/10 text-plum flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="truncate text-oviareText-primary">
            <span className="font-semibold">Install App:</span>{' '}
            <span className="text-oviareText-secondary">Add to Home Screen for reminders</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={promptInstall}
            className="text-xs px-2.5 py-1 h-7"
            leftIcon={<Download className="w-3 h-3" />}
          >
            Install
          </Button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-oviareText-secondary hover:text-oviareText-primary p-1 rounded-md hover:bg-ivory-200 transition-colors"
            title="Dismiss installation banner"
            aria-label="Dismiss installation banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
