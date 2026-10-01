'use client';

import React, { useState } from 'react';
import { Heart, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface IntimacyTrackerProps {
  intimacyLogged: boolean;
  intimacyNotes: string | null;
  onIntimacyLoggedChange: (logged: boolean) => void;
  onIntimacyNotesChange: (notes: string) => void;
}

export const IntimacyTracker: React.FC<IntimacyTrackerProps> = ({
  intimacyLogged,
  intimacyNotes,
  onIntimacyLoggedChange,
  onIntimacyNotesChange,
}) => {
  const [isOpen, setIsOpen] = useState(intimacyLogged || Boolean(intimacyNotes));

  return (
    <div className="rounded-xl border border-oviareBorder bg-white overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-ivory-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-ivory text-oviareText-secondary">
            <Heart className="w-3.5 h-3.5 text-plum" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
              Intimacy & Sexual Activity (Optional)
            </span>
            <span className="text-[11px] text-oviareText-secondary">
              Strictly private and optional category
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {intimacyLogged && (
            <span className="text-[11px] font-medium text-plum bg-mauve/40 px-2 py-0.5 rounded-md">
              Logged
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-oviareText-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-oviareText-secondary" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-oviareBorder/60 space-y-3 bg-ivory-50/40">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-ivory-100 border border-oviareBorder text-[11px] text-oviareText-secondary">
            <Lock className="w-3.5 h-3.5 text-plum shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Privacy Protection:</strong> All intimacy records are protected with your personal Row Level Security policy. This information is purely for your personal tracking awareness and is never shared, used for diagnostics, or presented in public demo mode.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="intimacy-occurred"
              type="checkbox"
              checked={intimacyLogged}
              onChange={(e) => onIntimacyLoggedChange(e.target.checked)}
              className="w-4 h-4 rounded text-plum focus:ring-plum border-oviareBorder cursor-pointer accent-plum"
            />
            <label
              htmlFor="intimacy-occurred"
              className="text-xs font-medium text-oviareText-primary cursor-pointer select-none"
            >
              Intimate activity occurred on this date
            </label>
          </div>

          {intimacyLogged && (
            <div className="pt-1">
              <label
                htmlFor="intimacy-note"
                className="block text-[11px] font-medium text-oviareText-secondary mb-1"
              >
                Optional Private Observations
              </label>
              <input
                id="intimacy-note"
                type="text"
                value={intimacyNotes || ''}
                onChange={(e) => onIntimacyNotesChange(e.target.value)}
                placeholder="E.g. Protected, contraception note, high libido..."
                maxLength={100}
                className="w-full px-3 py-1.5 rounded-lg border border-oviareBorder bg-white text-xs text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
