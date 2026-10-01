import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'subtle-mauve' | 'subtle-sage';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-oviareBorder shadow-card',
    flat: 'bg-white border border-oviareBorder',
    'subtle-mauve': 'bg-mauve-light/50 border border-mauve-border shadow-subtle',
    'subtle-sage': 'bg-sage-subtle/40 border border-sage/15 shadow-subtle',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div>
      <h3 className="font-serif font-medium text-lg text-oviareText-primary tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-oviareText-secondary mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
