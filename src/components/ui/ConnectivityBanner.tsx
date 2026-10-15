'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const ConnectivityBanner: React.FC = () => {
  const { isOnline, wasOffline, isReconnecting, checkRealConnectivity } = useOnlineStatus();

  // If online and was not recently offline, don't show anything
  if (isOnline && !wasOffline) {
    return null;
  }

  // Brief "Connection Restored" confirmation banner
  if (isOnline && wasOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full bg-sage/15 border-b border-sage/30 px-4 py-2 text-xs transition-all animate-in fade-in duration-300"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start gap-2 text-sage-dark font-medium">
          <Wifi className="w-3.5 h-3.5 shrink-0 text-sage" />
          <span>Connection restored. Cloud sync is active.</span>
        </div>
      </div>
    );
  }

  // "You're Offline" status banner
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-ivory-100 border-b border-oviareBorder px-4 py-2 text-xs transition-all animate-in fade-in duration-300 shadow-subtle"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-oviareText-primary">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-plum/10 text-plum flex items-center justify-center shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-oviareText-primary">You are currently offline.</span>{' '}
            <span className="text-oviareText-secondary">
              Viewing cached views is supported. Changes require an internet connection to sync.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => checkRealConnectivity()}
          disabled={isReconnecting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-oviareBorder bg-white hover:bg-ivory-50 text-[11px] font-medium text-oviareText-primary transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-3 h-3 text-plum ${isReconnecting ? 'animate-spin' : ''}`} />
          <span>{isReconnecting ? 'Checking...' : 'Check Connection'}</span>
        </button>
      </div>
    </div>
  );
};
