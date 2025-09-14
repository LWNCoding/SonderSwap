import React from 'react';
import { cn } from '../lib/utils';
import { COMMON_STYLES } from '../lib/styles';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  background?: 'white' | 'gray' | 'gradient' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const BACKGROUND_CLASSES = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50',
  transparent: 'bg-transparent',
} as const;

const PADDING_CLASSES = {
  none: '',
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-20',
} as const;

const Section: React.FC<SectionProps> = ({
  children,
  className,
  containerClassName,
  background = 'white',
  padding = 'lg'
}) => {
  return (
    <section className={cn(
      BACKGROUND_CLASSES[background],
      PADDING_CLASSES[padding],
      className
    )}>
      <div className={cn(
        COMMON_STYLES.LAYOUT.MAX_WIDTH,
        'mx-auto',
        COMMON_STYLES.LAYOUT.CONTAINER_PADDING,
        containerClassName
      )}>
        {children}
      </div>
    </section>
  );
};

export default Section;
