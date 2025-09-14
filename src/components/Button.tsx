import React from 'react';
import { ButtonProps } from '../types';
import { cn } from '../lib/utils';
import { typography } from '../lib/typography';
import { COMMON_STYLES, COMPONENT_VARIANTS, SIZE_VARIANTS } from '../lib/styles';

// Button constants
const BUTTON_CONSTANTS = {
  BASE_CLASSES: COMMON_STYLES.BUTTON_BASE,
  VARIANTS: COMPONENT_VARIANTS.BUTTON,
  SIZES: {
    sm: `${SIZE_VARIANTS.BUTTON.sm} ${typography.buttonSmall}`,
    md: `${SIZE_VARIANTS.BUTTON.md} ${typography.button}`,
    lg: `${SIZE_VARIANTS.BUTTON.lg} ${typography.buttonLarge}`,
  },
} as const;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        BUTTON_CONSTANTS.BASE_CLASSES,
        BUTTON_CONSTANTS.VARIANTS[variant],
        BUTTON_CONSTANTS.SIZES[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;