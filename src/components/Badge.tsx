import React from 'react';
import { cn } from '../lib/utils';
import { typography } from '../lib/typography';
import { COMPONENT_VARIANTS, SIZE_VARIANTS } from '../lib/styles';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BADGE_SIZES = {
  sm: `${SIZE_VARIANTS.BADGE.sm} ${typography.caption}`,
  md: `${SIZE_VARIANTS.BADGE.md} ${typography.buttonSmall}`,
  lg: `${SIZE_VARIANTS.BADGE.lg} ${typography.button}`,
} as const;

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  className
}) => {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      COMPONENT_VARIANTS.BADGE[variant],
      BADGE_SIZES[size],
      className
    )}>
      {label}
    </span>
  );
};

export default Badge;
