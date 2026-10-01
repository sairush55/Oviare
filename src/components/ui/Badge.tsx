import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'plum' | 'mauve' | 'sage' | 'neutral' | 'sample';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variants = {
    plum: 'bg-plum/10 text-plum border-plum/20',
    mauve: 'bg-mauve text-oviareText-primary border-mauve-border',
    sage: 'bg-sage/10 text-sage border-sage/20',
    neutral: 'bg-ivory-200 text-oviareText-secondary border-oviareBorder',
    sample: 'bg-amber-50 text-amber-800 border-amber-200/80 font-mono tracking-normal',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
