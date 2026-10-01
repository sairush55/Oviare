'use client';

import React, { useEffect } from 'react';
import { useCycleData } from '@/context/CycleDataContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useCycleData();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, hideToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 bg-white border border-oviareBorder text-oviareText-primary px-4 py-3 rounded-xl shadow-floating max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
      <span className="text-xs font-medium">{toastMessage}</span>
      <button
        onClick={hideToast}
        className="ml-auto p-1 text-oviareText-secondary hover:text-oviareText-primary rounded-lg transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
