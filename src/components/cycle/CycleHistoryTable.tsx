'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCycleData } from '@/context/CycleDataContext';
import { CycleRecord } from '@/types';
import { PeriodLogModal } from './PeriodLogModal';
import { DeleteRecordModal } from './DeleteRecordModal';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Info,
  Droplet,
  FileText,
  Sparkles,
} from 'lucide-react';

export const CycleHistoryTable: React.FC = () => {
  const {
    cycleRecords,
    cycleHistory,
    cycleStats,
    demoMode,
  } = useCycleData();

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<CycleRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CycleRecord | null>(null);

  const formatDate = (iso: string) => {
    try {
      const [y, m, d] = iso.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return iso;
    }
  };

  // Map history item calculations by record ID
  const historyMap = new Map(cycleHistory.map((h) => [h.id, h]));

  // Display records most recent first
  const displayRecords = [...cycleRecords].sort((a, b) =>
    b.period_start.localeCompare(a.period_start)
  );

  return (
    <>
      <Card variant="default" padding="lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-oviareBorder">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-oviareText-primary">
                Recorded Periods & Cycle Intervals
              </h3>
              {demoMode && (
                <Badge variant="sample" size="sm">
                  Sample Data
                </Badge>
              )}
            </div>
            <p className="text-xs text-oviareText-secondary mt-0.5">
              Cycle lengths are measured between consecutive period start dates.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setIsLogModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Period
          </Button>
        </div>

        {/* Rolling Statistics Quick Cards */}
        {cycleRecords.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-oviareBorder/60">
            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Recorded Periods
              </span>
              <span className="font-serif text-lg font-medium text-oviareText-primary mt-0.5 block">
                {cycleStats.recordedPeriodsCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Completed Cycles
              </span>
              <span className="font-serif text-lg font-medium text-oviareText-primary mt-0.5 block">
                {cycleStats.completedCyclesCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Average Cycle
              </span>
              <span className="font-serif text-lg font-medium text-oviareText-primary mt-0.5 block">
                {cycleStats.averageCycleLength ? `${cycleStats.averageCycleLength} days` : 'Calculating...'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder">
              <span className="text-[11px] text-oviareText-secondary block">
                Variability (±)
              </span>
              <span className="font-serif text-lg font-medium text-oviareText-primary mt-0.5 block">
                {cycleStats.cycleVariabilityDays !== null
                  ? `±${cycleStats.cycleVariabilityDays} days`
                  : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Records Table or Empty State */}
        {displayRecords.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-mauve/40 text-plum flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-medium text-oviareText-primary">
              No period records logged yet
            </h4>
            <p className="text-xs text-oviareText-secondary max-w-sm mx-auto leading-relaxed">
              Log your past or current menstrual periods to enable personalized cycle length calculations and estimations.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingRecord(null);
                  setIsLogModalOpen(true);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Log First Period
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-oviareBorder text-[11px] font-semibold uppercase tracking-wider text-oviareText-secondary">
                  <th className="py-3 px-2">Period Dates</th>
                  <th className="py-3 px-2">Duration</th>
                  <th className="py-3 px-2">Cycle Interval</th>
                  <th className="py-3 px-2">Flow</th>
                  <th className="py-3 px-2">Notes</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oviareBorder/50">
                {displayRecords.map((record) => {
                  const historyItem = historyMap.get(record.id);
                  const isOngoing = record.period_end === null;
                  const duration = historyItem?.periodDurationDays
                    ? `${historyItem.periodDurationDays} days`
                    : isOngoing
                    ? 'Ongoing'
                    : '1 day';

                  const interval = historyItem?.cycleLengthDays
                    ? `${historyItem.cycleLengthDays} days`
                    : 'Current cycle';

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-ivory-50/60 transition-colors"
                    >
                      {/* Dates */}
                      <td className="py-3 px-2">
                        <div className="font-medium text-oviareText-primary">
                          {formatDate(record.period_start)}
                          {record.period_end ? (
                            <span className="text-oviareText-secondary font-normal">
                              {' '}
                              – {formatDate(record.period_end)}
                            </span>
                          ) : (
                            <span className="ml-1.5 inline-block">
                              <Badge variant="plum" size="sm">
                                Ongoing
                              </Badge>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-2 text-oviareText-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-plum/70" />
                          {duration}
                        </span>
                      </td>

                      {/* Cycle Interval to next period */}
                      <td className="py-3 px-2">
                        {historyItem?.cycleLengthDays ? (
                          <span className="font-medium text-oviareText-primary">
                            {interval}
                          </span>
                        ) : (
                          <span className="text-oviareText-muted italic">
                            Current cycle
                          </span>
                        )}
                      </td>

                      {/* Flow */}
                      <td className="py-3 px-2">
                        {record.flow_intensity ? (
                          <span className="capitalize inline-flex items-center gap-1 text-[11px] text-oviareText-secondary">
                            <Droplet className="w-3 h-3 text-plum" />
                            {record.flow_intensity}
                          </span>
                        ) : (
                          <span className="text-oviareText-muted">—</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-2 max-w-[180px] truncate text-oviareText-secondary">
                        {record.notes ? (
                          <span className="truncate block" title={record.notes}>
                            {record.notes}
                          </span>
                        ) : (
                          <span className="text-oviareText-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(record);
                              setIsLogModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-oviareText-secondary hover:text-plum hover:bg-mauve/20 transition-colors"
                            title="Edit period record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRecord(record)}
                            className="p-1.5 rounded-lg text-oviareText-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete period record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Quality status guidance */}
        {cycleRecords.length > 0 && !cycleStats.hasSufficientData && (
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-xs text-oviareText-secondary">
            <Info className="w-4 h-4 text-plum shrink-0 mt-0.5" />
            <span>
              <strong>Initial Period Logged:</strong> Oviare needs at least 2 consecutive period start dates to calculate your individual cycle interval. Your current countdown uses standard baseline estimates.
            </span>
          </div>
        )}
      </Card>

      {/* Modals */}
      <PeriodLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingRecord(null);
        }}
        initialRecord={editingRecord}
      />

      <DeleteRecordModal
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        record={deletingRecord}
      />
    </>
  );
};
