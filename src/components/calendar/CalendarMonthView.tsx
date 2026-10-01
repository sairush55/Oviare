'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useCycleData } from '@/context/CycleDataContext';
import { DayDetailsModal } from './DayDetailsModal';
import { DailyLogEntry } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarMonthView: React.FC = () => {
  const searchParams = useSearchParams();
  const dateParam = searchParams?.get('date');

  // We anchor default view at October 2026 (matching system reference date)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const [y, m] = dateParam.split('-').map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
      setSelectedDateStr(dateParam);
      setIsModalOpen(true);
    }
  }, [dateParam]);

  const { entries, demoMode } = useCycleData();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October
  };

  // Month metadata
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', {
    month: 'long',
  });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Helpers to evaluate day states
  const getDayDateString = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  // Predetermined sample rhythm windows (for demo demonstration)
  const isSamplePeriod = (dateStr: string) => {
    if (!demoMode) return false;
    // September 8-12 was previous period
    return ['2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'].includes(dateStr);
  };

  const isSamplePredicted = (dateStr: string) => {
    if (!demoMode) return false;
    // October 5-9 is predicted period
    return ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'].includes(dateStr);
  };

  const isSampleFertile = (dateStr: string) => {
    if (!demoMode) return false;
    // September 21-24 and October 18-21
    return [
      '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24',
      '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21',
    ].includes(dateStr);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
  };

  // Selected day entry & attributes for modal
  const selectedEntry = selectedDateStr ? entries.find((e) => e.date === selectedDateStr) : undefined;
  const isSelectedPeriod = selectedDateStr ? (selectedEntry?.flow && selectedEntry.flow !== 'none') || isSamplePeriod(selectedDateStr) : false;
  const isSelectedPredicted = selectedDateStr ? isSamplePredicted(selectedDateStr) : false;
  const isSelectedFertile = selectedDateStr ? isSampleFertile(selectedDateStr) : false;
  const isSelectedToday = selectedDateStr === '2026-10-01';

  return (
    <>
      <Card variant="default" padding="none" className="overflow-hidden">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-oviareBorder bg-white">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-oviareText-primary">
              {monthName} <span className="text-oviareText-secondary font-normal">{currentYear}</span>
            </h2>
            {currentYear === 2026 && currentMonth === 9 && (
              <Badge variant="neutral" size="sm">
                Current
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToToday}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Return to October 2026"
            >
              <span className="hidden sm:inline">Today</span>
            </Button>
            <div className="flex items-center border border-oviareBorder rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 text-oviareText-secondary hover:text-oviareText-primary hover:bg-ivory transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-oviareBorder" />
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 text-oviareText-secondary hover:text-oviareText-primary hover:bg-ivory transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="p-3 sm:p-6 bg-white/40">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-oviareText-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-[58px] sm:min-h-[84px] p-1 rounded-xl bg-ivory-50/40 border border-transparent opacity-30 select-none"
                aria-hidden="true"
              />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = getDayDateString(day);
              const isToday = dateStr === '2026-10-01';

              // Entry lookup
              const entry = entries.find((e) => e.date === dateStr);
              const isLoggedPeriod = entry?.flow && entry.flow !== 'none';
              const isPeriod = isLoggedPeriod || isSamplePeriod(dateStr);
              const isPredicted = isSamplePredicted(dateStr);
              const isFertile = isSampleFertile(dateStr);
              const hasLogs = entry && (entry.symptoms.length > 0 || entry.moods.length > 0 || entry.notes);

              let cellBg = 'bg-white hover:bg-ivory-50 border-oviareBorder/80';
              let textStyle = 'text-oviareText-primary';

              if (isToday) {
                cellBg = 'bg-mauve-light/60 border-plum/40 ring-1 ring-plum/30';
                textStyle = 'font-semibold text-plum';
              } else if (isPeriod) {
                cellBg = 'bg-plum/10 border-plum/30';
              } else if (isPredicted) {
                cellBg = 'bg-mauve-light/40 border-dashed border-plum/30';
              } else if (isFertile) {
                cellBg = 'bg-sage-subtle/30 border-sage/20';
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(dateStr)}
                  className={`min-h-[58px] sm:min-h-[84px] p-1.5 sm:p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-150 hover:shadow-subtle hover:border-plum/40 focus-visible:outline-plum ${cellBg}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isToday
                          ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-plum text-white flex items-center justify-center text-[11px] sm:text-xs'
                          : textStyle
                      }`}
                    >
                      {day}
                    </span>

                    {/* Today label on larger screens */}
                    {isToday && (
                      <span className="hidden sm:inline-block text-[10px] font-medium text-plum">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Indicators bar */}
                  <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
                    {isPeriod && (
                      <span
                        className="w-2 h-2 rounded-full bg-plum"
                        title="Logged period"
                      />
                    )}
                    {isPredicted && (
                      <span
                        className="w-2 h-2 rounded-full border border-plum"
                        title="Predicted period (Est.)"
                      />
                    )}
                    {isFertile && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-sage"
                        title="Estimated fertile window"
                      />
                    )}
                    {hasLogs && (
                      <span
                        className="w-1 h-1 rounded-full bg-oviareText-secondary"
                        title="Symptoms or notes logged"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dateStr={selectedDateStr}
        entry={selectedEntry}
        isPeriod={isSelectedPeriod}
        isPredicted={isSelectedPredicted}
        isFertile={isSelectedFertile}
        isToday={isSelectedToday}
      />
    </>
  );
};
