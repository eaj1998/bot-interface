import React from 'react';

export interface BFButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'loading'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'icon' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'data-test'?: string;
}

export const BFButton = React.forwardRef<HTMLButtonElement, BFButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loading,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  'data-test': dataTest,
  ...restProps
}, ref) => {
  const isButtonLoading = loading ?? isLoading;

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-[var(--bf-green-dark)] text-primary-foreground shadow-sm';
      case 'secondary':
        return 'bg-secondary hover:bg-[var(--bf-blue-dark)] text-secondary-foreground shadow-sm';
      case 'outline':
        return 'border-2 border-secondary text-secondary bg-background hover:bg-secondary/10';
      case 'ghost':
        return 'bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground';
      case 'danger':
        return 'bg-destructive hover:bg-destructive/80 text-destructive-foreground shadow-sm';
      case 'success':
        return 'bg-[var(--success)] hover:bg-[var(--bf-green-dark)] text-[var(--success-foreground)] shadow-sm';
      default:
        return '';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'icon': return 'h-8 w-8';
      case 'sm': return 'h-8 px-3 gap-1.5';
      case 'md': return 'h-10 px-4 gap-2';
      case 'lg': return 'h-12 px-6 gap-2.5';
      default: return 'h-10 px-4 gap-2';
    }
  };

  const combinedClasses = `
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${fullWidth ? 'w-full' : ''}
    rounded-lg
    inline-flex items-center justify-center
    transition-all duration-200
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || isButtonLoading}
      aria-busy={isButtonLoading}
      data-test={dataTest}
      {...restProps}
    >
      {isButtonLoading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isButtonLoading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span className={`truncate ${isButtonLoading ? 'opacity-50' : ''}`}>{children}</span>
      {!isButtonLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
});

BFButton.displayName = 'BFButton';