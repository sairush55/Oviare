'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker after window load to prevent contention with initial page render
    const handleRegister = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for service worker updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new service worker version is available in the background
              console.log('Oviare: New version available in background.');
            }
          });
        });
      } catch (err) {
        console.warn('Oviare: ServiceWorker registration skipped or failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      handleRegister();
    } else {
      window.addEventListener('load', handleRegister);
      return () => window.removeEventListener('load', handleRegister);
    }
  }, []);

  return null;
};
