'use client';

import React, { useState } from 'react';
import { Info, ShieldAlert, X } from 'lucide-react';

interface MedicalDisclaimerBadgeProps {
  compact?: boolean;
}

export const MedicalDisclaimerBadge: React.FC<MedicalDisclaimerBadgeProps> = ({
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group inline-flex items-center gap-1.5 rounded-full border border-oviareBorder bg-white/70 px-2.5 py-1 text-xs text-oviareText-secondary hover:border-plum/40 hover:text-oviareText-primary transition-colors focus-visible:outline-plum ${
          compact ? 'text-[11px] py-0.5 px-2' : ''
        }`}
        aria-label="Read medical and privacy boundary notice"
      >
        <Info className="w-3.5 h-3.5 text-sage" aria-hidden="true" />
        <span className="font-medium">Informational tool • Not diagnostic</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oviareText-primary/20 backdrop-blur-[2px]"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating border border-oviareBorder transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5 text-sage">
                <ShieldAlert className="w-5 h-5 text-plum" />
                <h3
                  id="disclaimer-title"
                  className="font-serif font-medium text-lg text-oviareText-primary"
                >
                  Health & Privacy Boundaries
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-oviareText-secondary hover:bg-ivory hover:text-oviareText-primary transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-oviareText-secondary">
              <p>
                <strong className="text-oviareText-primary font-medium">Informational only:</strong>{' '}
                Oviare is an intuitive wellness and cycle logging tool. It does not provide medical diagnoses, medical advice, or clinical evaluations.
              </p>
              <p>
                <strong className="text-oviareText-primary font-medium">Estimated rhythms:</strong>{' '}
                All cycle stages, ovulation estimates, and period windows shown in Oviare are algorithmic estimates based on historical averages. They should never be used as a method of contraception or family planning guarantee.
              </p>
              <p>
                <strong className="text-oviareText-primary font-medium">Phase 1 prototype state:</strong>{' '}
                Currently running in prototype mode. Logged entries exist only in your current browser session and are not transmitted to any remote server or database.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-plum px-4 py-2 text-xs font-medium text-white hover:bg-plum-dark transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
