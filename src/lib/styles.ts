// Common styling patterns and utilities
export const COMMON_STYLES = {
  // Button styles
  BUTTON_BASE: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Card styles
  CARD_BASE: 'bg-white rounded-lg shadow-sm border border-gray-200',
  CARD_HOVER: 'hover:shadow-md transition-shadow duration-200',
  
  // Input styles
  INPUT_BASE: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
  INPUT_ERROR: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  
  // Layout styles
  CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  SECTION_PADDING: 'py-16 lg:py-20',
  
  // Layout Constants
  LAYOUT: {
    MAX_WIDTH: 'max-w-7xl',
    CONTAINER_PADDING: 'px-4 sm:px-6 lg:px-8',
    HEADER_PADDING: 'pt-20 pb-8',
    CONTENT_PADDING: 'py-8',
    SECTION_SPACING: 'mb-12',
  },
  
  // Text styles
  TEXT_MUTED: 'text-gray-600',
  TEXT_PRIMARY: 'text-gray-900',
  TEXT_SECONDARY: 'text-gray-500',
  
  // Spacing
  SPACE_SECTION: 'space-y-8',
  SPACE_ITEM: 'space-y-4',
  
  // Transitions
  TRANSITION_BASE: 'transition-all duration-200',
  TRANSITION_COLORS: 'transition-colors duration-200',
  TRANSITION_SHADOW: 'transition-shadow duration-200',
} as const;

// Common component variants
export const COMPONENT_VARIANTS = {
  // Button variants
  BUTTON: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  },
  
  // Badge variants
  BADGE: {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  },
  
  // Alert variants
  ALERT: {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  },
} as const;

// Common size variants
export const SIZE_VARIANTS = {
  // Button sizes
  BUTTON: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
  
  // Badge sizes
  BADGE: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  },
  
  // Icon sizes
  ICON: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  },
} as const;
