'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oviareText-primary/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidths[maxWidth]} bg-white rounded-2xl p-6 shadow-floating border border-oviareBorder animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-oviareBorder/60 mb-4">
          {title && (
            <h3 className="font-serif text-lg font-medium text-oviareText-primary">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-oviareText-secondary hover:bg-ivory hover:text-oviareText-primary transition-colors focus-visible:outline-plum"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
