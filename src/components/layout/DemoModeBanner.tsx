'use client';

import React from 'react';
import Link from 'next/link';
import { useCycleData } from '@/context/CycleDataContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, LogOut, UserPlus } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, exitDemo } = useCycleData();

  if (!isDemoMode) return null;

  return (
    <div className="bg-mauve-light/90 border-b border-mauve-border px-4 py-2.5 text-xs text-oviareText-primary sticky top-0 z-40 backdrop-blur-sm shadow-subtle">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Badge variant="sample" size="sm" className="shrink-0">
            Demo Trial
          </Badge>
          <span className="text-[11px] sm:text-xs text-oviareText-secondary">
            This demo uses fictional sample data and does not represent a real person's health information.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exitDemo}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-oviareBorder bg-white/80 hover:bg-white text-oviareText-secondary hover:text-oviareText-primary text-[11px] font-medium transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Exit Demo
          </button>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-plum text-white hover:bg-plum-dark text-[11px] font-medium transition-colors shadow-subtle"
          >
            <UserPlus className="w-3 h-3" />
            Create Real Account
          </Link>
        </div>
      </div>
    </div>
  );
};
