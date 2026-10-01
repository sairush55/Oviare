import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-oviareText-primary">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-oviareText-secondary leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">{action}</div>}
    </header>
  );
};
