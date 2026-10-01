'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  onConfirm: () => Promise<void>;
}

export const DeleteLogModal: React.FC<DeleteLogModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = (() => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  })();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Daily Wellness Entry" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-oviareText-primary">
              Delete entry for {formattedDate}?
            </p>
            <p className="text-xs text-oviareText-secondary mt-1.5 leading-relaxed">
              This will remove all symptoms, moods, sleep, and energy logs recorded for this day. This action cannot be undone.
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
            Keep Entry
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white focus-visible:outline-red-600"
          >
            Delete Entry
          </Button>
        </div>
      </div>
    </Modal>
  );
};
