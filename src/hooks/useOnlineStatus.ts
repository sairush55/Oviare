'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  isReconnecting: boolean;
  checkRealConnectivity: () => Promise<boolean>;
}

export function useOnlineStatus(): OnlineStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  // Probe real connectivity beyond navigator.onLine
  const checkRealConnectivity = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;

    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    try {
      setIsReconnecting(true);
      // Fetch small static asset with cache-buster
      const response = await fetch(`/icons/badge-72.svg?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const reachable = response.ok;
      setIsOnline(reachable);
      return reachable;
    } catch {
      setIsOnline(false);
      return false;
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let restoredTimer: NodeJS.Timeout | null = null;

    const handleOnline = async () => {
      // Browser reports online, verify actual reachability
      const reachable = await checkRealConnectivity();
      if (reachable) {
        setIsOnline(true);
        setWasOffline(true);
        if (restoredTimer) clearTimeout(restoredTimer);
        restoredTimer = setTimeout(() => {
          setWasOffline(false);
        }, 3500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (restoredTimer) clearTimeout(restoredTimer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (restoredTimer) clearTimeout(restoredTimer);
    };
  }, [checkRealConnectivity]);

  return {
    isOnline,
    wasOffline,
    isReconnecting,
    checkRealConnectivity,
  };
}
