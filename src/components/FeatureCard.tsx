import React from 'react';
import { cn } from '../lib/utils';
import { typography } from '../lib/typography';
import Icon from './Icon';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgColor = 'bg-primary-100',
  iconColor = 'text-primary-600',
  className
}) => {
  return (
    <div className={cn(
      'text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300',
      className
    )}>
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
        iconBgColor
      )}>
        <Icon name={icon} size="lg" className={iconColor} />
      </div>
      <h3 className={`${typography.h3} text-gray-900 mb-2`}>{title}</h3>
      <p className={`${typography.bodySmall} text-gray-600`}>{description}</p>
    </div>
  );
};

export default FeatureCard;
