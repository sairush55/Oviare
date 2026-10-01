'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const CalendarMiniPreview: React.FC = () => {
  // 7-day strip centered on current date (using 2026-10-01 as current local anchor)
  const days = [
    { dayName: 'Mon', dayNum: 28, month: 'Sep', isPeriod: false, isPredicted: false, hasLog: false },
    { dayName: 'Tue', dayNum: 29, month: 'Sep', isPeriod: false, isPredicted: false, hasLog: true },
    { dayName: 'Wed', dayNum: 30, month: 'Sep', isPeriod: false, isPredicted: false, hasLog: false },
    { dayName: 'Thu', dayNum: 1, month: 'Oct', isPeriod: false, isPredicted: false, isToday: true, hasLog: false },
    { dayName: 'Fri', dayNum: 2, month: 'Oct', isPeriod: false, isPredicted: false, hasLog: false },
    { dayName: 'Sat', dayNum: 3, month: 'Oct', isPeriod: false, isPredicted: false, hasLog: false },
    { dayName: 'Sun', dayNum: 4, month: 'Oct', isPeriod: false, isPredicted: true, hasLog: false },
  ];

  return (
    <Card variant="default" padding="md">
      <CardHeader
        title="Weekly Rhythm Preview"
        subtitle="October 2026 • Predicted period begins Sunday"
        action={
          <Link
            href="/calendar"
            className="inline-flex items-center text-xs font-medium text-plum hover:text-plum-dark gap-1 transition-colors"
          >
            <span>Full calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
        {days.map((item, idx) => {
          let cellStyle = 'bg-white border-oviareBorder text-oviareText-primary';
          let indicator = null;

          if (item.isToday) {
            cellStyle = 'bg-mauve/40 border-plum/40 font-semibold text-plum ring-1 ring-plum/30';
          } else if (item.isPredicted) {
            cellStyle = 'bg-mauve-light border-dashed border-plum/40 text-plum';
          }

            const dateQuery = `${item.month === 'Sep' ? '2026-09-' : '2026-10-'}${String(item.dayNum).padStart(2, '0')}`;
            return (
              <Link
                key={idx}
                href={`/calendar?date=${dateQuery}`}
                className={`flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-center transition-all hover:border-plum/50 hover:shadow-subtle ${cellStyle}`}
              >
              <span className="text-[10px] sm:text-xs text-oviareText-secondary font-medium">
                {item.dayName}
              </span>
              <span className="text-sm sm:text-base font-serif font-medium my-1">
                {item.dayNum}
              </span>

              {/* Status dot */}
              <div className="h-1.5 flex items-center justify-center">
                {item.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-plum" title="Today" />
                )}
                {item.isPredicted && (
                  <span className="w-1.5 h-1.5 rounded-full border border-plum" title="Predicted period" />
                )}
                {item.hasLog && !item.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" title="Logged day" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-oviareBorder/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-oviareText-secondary">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-plum" /> Today
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-plum bg-mauve/30" /> Predicted period (Est.)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sage" /> Logged entry
          </span>
        </div>
        <span className="text-[10px] text-oviareText-muted">Sample data preview</span>
      </div>
    </Card>
  );
};
