import React from 'react';
import { CalendarHeart, Sparkles } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-oviareBorder bg-white/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-mauve/40 flex items-center justify-center text-plum mb-4 shadow-subtle">
        {icon || <CalendarHeart className="w-7 h-7 stroke-[1.5]" />}
      </div>
      <h3 className="font-serif font-medium text-lg text-oviareText-primary max-w-sm mb-2">
        {title}
      </h3>
      <p className="text-sm text-oviareText-secondary max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" size="md" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
