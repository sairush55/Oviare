import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'mark-only' | 'horizontal';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  variant = 'full',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Abstract Circular / Flowing Organic Rhythm Mark */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 hover:rotate-6"
        >
          {/* Subtle background harmonious circle */}
          <circle cx="24" cy="24" r="22" className="fill-mauve/40 stroke-oviareBorder" strokeWidth="1" />
          
          {/* Gentle cyclical flowing crescent representing monthly rhythm */}
          <path
            d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C20 36 20 28 24 24C28 20 36 20 42 24C42 14.0589 33.9411 6 24 6Z"
            className="fill-plum/85"
          />
          
          {/* Overlapping natural inner cycle node */}
          <circle
            cx="31"
            cy="17"
            r="5"
            className="fill-sage/90"
          />
          
          {/* Gentle organic focal dot */}
          <circle
            cx="24"
            cy="24"
            r="2"
            className="fill-white"
          />
        </svg>
      </div>

      {variant !== 'mark-only' && (
        <div className="flex flex-col">
          <span
            className={`font-serif tracking-tight font-medium text-oviareText-primary leading-tight ${textSizes[size]}`}
          >
            Oviare
          </span>
          {showTagline && (
            <span className="text-[11px] font-sans tracking-wide text-oviareText-secondary">
              Understand your rhythm.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
