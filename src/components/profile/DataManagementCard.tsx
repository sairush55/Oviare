'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { useAuth } from '@/context/AuthContext';
import { useCycleData } from '@/context/CycleDataContext';
import {
  Download,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Database,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const DataManagementCard: React.FC = () => {
  const { user } = useAuth();
  const {
    isDemoMode,
    cycleRecords,
    dailyLogs,
    customCategories,
    trackingPreferences,
    clearTemporaryData,
    showToast,
  } = useCycleData();

  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleExportJson = async () => {
    try {
      setIsExportingJson(true);

      if (isDemoMode) {
        // In Demo Mode, export the in-memory synthetic data with a clear disclaimer
        const demoExport = {
          app: 'Oviare',
          tagline: 'Understand your rhythm.',
          export_version: '1.0',
          export_timestamp: new Date().toISOString(),
          demo_trial: true,
          notice: 'This export contains synthetic sample records generated for demonstration purposes.',
          cycle_records: cycleRecords,
          daily_wellness_logs: dailyLogs,
          custom_categories: customCategories,
          tracking_preferences: trackingPreferences,
        };

        const blob = new Blob([JSON.stringify(demoExport, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oviare-demo-trial-export-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Demo trial records exported as JSON');
        return;
      }

      // Real authenticated user: call server export endpoint
      const response = await fetch('/api/user/export?format=json');
      if (!response.ok) {
        throw new Error('Failed to download data export.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `oviare-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully as JSON');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      showToast(msg);
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);

      if (isDemoMode) {
        const cycleRows = cycleRecords.map((c) =>
          `"${c.period_start}","${c.period_end || 'ongoing'}","${c.flow_intensity || ''}","${(c.notes || '').replace(/"/g, '""')}"`
        );
        const cycleCsv = [
          'PERIOD_START,PERIOD_END,FLOW_INTENSITY,NOTES',
          ...cycleRows,
        ].join('\n');

        const logRows = dailyLogs.map((l) => {
          const symptomsStr = (l.symptoms || [])
            .map((s) => `${s.symptom_name} (${s.severity})`)
            .join('; ');
          const moodsStr = (l.moods || []).join('; ');
          return `"${l.log_date}","${moodsStr}","${l.sleep_duration_minutes ?? ''}","${l.sleep_quality ?? ''}","${l.energy_level ?? ''}","${l.intimacy_logged ? 'yes' : 'no'}","${symptomsStr}","${(l.notes || '').replace(/"/g, '""')}"`;
        });
        const wellnessCsv = [
          'LOG_DATE,MOODS,SLEEP_MINUTES,SLEEP_QUALITY,ENERGY_LEVEL_1_TO_5,INTIMACY_LOGGED,SYMPTOMS,NOTES',
          ...logRows,
        ].join('\n');

        const fullCsv = `# OVIARE DEMO SAMPLE CYCLE RECORDS\n${cycleCsv}\n\n# OVIARE DEMO SAMPLE WELLNESS LOGS\n${wellnessCsv}`;
        const blob = new Blob([fullCsv], { type: 'text/csv; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oviare-demo-export-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Demo records exported as CSV');
        return;
      }

      const response = await fetch('/api/user/export?format=csv');
      if (!response.ok) {
        throw new Error('Failed to download CSV export.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `oviare-data-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Tabular data exported as CSV');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CSV export failed';
      showToast(msg);
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <>
      <Card variant="default" padding="md" className="space-y-5">
        <CardHeader
          title="Personal Data Management & Ownership"
          subtitle="Export your health records or request complete account erasure"
          action={
            <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Full Data Sovereignty</span>
            </div>
          }
        />

        {isDemoMode && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-100 border border-mauve/40 text-xs text-oviareText-secondary">
            <Sparkles className="w-4 h-4 text-plum shrink-0 mt-0.5" />
            <span>
              <strong className="text-oviareText-primary">Demo Mode:</strong> You can export synthetic sample data to verify export formats. Account deletion is disabled in Demo Mode.
            </span>
          </div>
        )}

        {/* Export Section */}
        <div className="p-4 rounded-xl border border-oviareBorder bg-white space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
              Personal Data Portability
            </span>
            <p className="text-xs text-oviareText-primary font-medium mt-0.5">
              Download your complete cycle records, daily observations, custom categories, and account settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isExportingJson}
              onClick={handleExportJson}
              leftIcon={<Download className="w-3.5 h-3.5 text-plum" />}
            >
              Export Complete Data (JSON)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isExportingCsv}
              onClick={handleExportCsv}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-sage" />}
            >
              Export Tabular Logs (CSV)
            </Button>
          </div>
        </div>

        {/* Clear / Deletion Section */}
        <div className="p-4 rounded-xl border border-red-200/80 bg-red-50/30 space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-900 block">
              Danger Zone & Privacy Deletion
            </span>
            <p className="text-xs text-oviareText-secondary mt-0.5">
              Permanently delete your Oviare account and purge all stored reproductive health records from our servers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {isDemoMode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowClearModal(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Reset Demo Data
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-700 hover:text-red-800 hover:bg-red-100/50 border-red-300"
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
              >
                Delete Account & Health Records
              </Button>
            )}

            <span className="text-[11px] text-oviareText-muted">
              {isDemoMode ? 'Demo trial sandbox' : 'Irreversible server-side erasure'}
            </span>
          </div>
        </div>
      </Card>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Clear Demo Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Reset Demo Trial Data?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-oviareText-secondary leading-relaxed">
            This will reset all in-memory mock cycle entries and symptom check-ins in your demo session.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-oviareBorder">
            <Button variant="ghost" size="sm" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                clearTemporaryData();
                setShowClearModal(false);
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
