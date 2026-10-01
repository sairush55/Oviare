import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const variants = {
      primary:
        'bg-plum text-white hover:bg-plum-dark shadow-subtle focus-visible:outline-plum',
      secondary:
        'bg-mauve/70 text-oviareText-primary hover:bg-mauve focus-visible:outline-plum',
      sage:
        'bg-sage text-white hover:bg-sage-dark shadow-subtle focus-visible:outline-sage',
      outline:
        'border border-oviareBorder bg-white text-oviareText-primary hover:bg-ivory-50 hover:border-plum/30 focus-visible:outline-plum',
      ghost:
        'bg-transparent text-oviareText-secondary hover:text-oviareText-primary hover:bg-mauve/30 focus-visible:outline-plum',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
