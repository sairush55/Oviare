'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCycleData } from '@/context/CycleDataContext';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDemoMode, showToast } = useCycleData();

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmText.trim() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMessage(null);

    if (isDemoMode) {
      showToast('Demo trial uses synthetic fixtures. No real account exists to delete.');
      onClose();
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      showToast('Your account and all associated health records have been permanently deleted.');
      await signOut().catch(() => {});
      router.push('/login?notice=account_deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during account deletion';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Account & Health Records"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {isDemoMode ? (
          <div className="p-4 rounded-xl bg-ivory-100 border border-mauve/40 text-xs text-oviareText-secondary space-y-2">
            <span className="font-semibold text-oviareText-primary block">
              Demo Trial Sandbox
            </span>
            <p>
              You are currently exploring Oviare in Demo Mode using in-memory synthetic records. No authenticated user account exists on the server to delete. You can exit demo mode at any time using the &ldquo;Exit Demo&rdquo; button.
            </p>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                <span>Permanent & Irreversible Action</span>
              </div>
              <p>
                Deleting your Oviare account will immediately and permanently erase all your data from our database:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-800/90 pl-1">
                <li>Your member profile and authentication credentials</li>
                <li>All logged menstrual period dates, flows, and cycle history</li>
                <li>All daily wellness check-ins (symptoms, mood, sleep, energy, intimacy, notes)</li>
                <li>Custom tracking categories and personalization settings</li>
                <li>Reminder preferences and Web Push browser subscriptions</li>
              </ul>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-900">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="confirm-delete-input"
                className="text-xs font-medium text-oviareText-primary block"
              >
                To confirm permanent deletion, type <strong className="text-red-700">DELETE</strong> below:
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                disabled={isDeleting}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-oviareBorder bg-white text-oviareText-primary focus-visible:outline-red-600 tracking-wider font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-oviareBorder">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Permanently Delete Account
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
