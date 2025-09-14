import React from 'react';
import { LOADING_STATES } from '../lib/constants';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = LOADING_STATES.EVENTS,
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
