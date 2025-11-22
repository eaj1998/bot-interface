import React from 'react';
import { BFButton } from './BF-Button';
import { BFBadge } from './BF-Badge';
import { BFIcons } from './BF-Icons';

export interface BFHeaderBarProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';
  };
  onBack?: () => void;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  'data-test'?: string;
}

export const BFHeaderBar: React.FC<BFHeaderBarProps> = ({
  title,
  subtitle,
  badge,
  onBack,
  actions,
  icon,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div
      className={`bg-[--card] border-b border-[--border] px-6 py-4 ${className}`}
      data-test={dataTest}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {onBack && (
            <BFButton
              variant="ghost"
              size="sm"
              icon={<BFIcons.ArrowLeft size={20} />}
              onClick={onBack}
              data-test={`${dataTest}-back`}
            />
          )}
          
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[--primary] to-[--primary]/70 rounded-xl flex items-center justify-center shadow-lg">
              {icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[--foreground] truncate" title={title}>
                {title}
              </h1>
              {badge && (
                <BFBadge variant={badge.variant || 'primary'}>
                  {badge.text}
                </BFBadge>
              )}
            </div>
            {subtitle && (
              <p className="text-[--muted-foreground] truncate" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};