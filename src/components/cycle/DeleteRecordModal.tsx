'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CycleRecord } from '@/types';
import { useCycleData } from '@/context/CycleDataContext';
import { AlertTriangle } from 'lucide-react';

interface DeleteRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CycleRecord | null;
}

export const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { deletePeriod } = useCycleData();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!record) return null;

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

  const periodLabel = record.period_end
    ? `${formatDate(record.period_start)} – ${formatDate(record.period_end)}`
    : `${formatDate(record.period_start)} (Ongoing)`;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      setIsDeleting(true);
      const res = await deletePeriod(record.id);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to delete record');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Period Record" maxWidth="sm">
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-oviareText-primary">
              Are you sure you want to delete this period?
            </p>
            <p className="text-xs text-plum font-semibold mt-1">
              {periodLabel}
            </p>
            <p className="text-xs text-oviareText-secondary mt-2 leading-relaxed">
              This will remove this record from your cycle history and recalculate your personal averages and next-period predictions. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-oviareBorder">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Keep Record
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white focus-visible:outline-red-600"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};
