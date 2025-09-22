// Common styling patterns and utilities
export const COMMON_STYLES = {
  // Button styles
  BUTTON_BASE: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Card styles
  CARD_BASE: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700',
  CARD_HOVER: 'hover:shadow-md dark:hover:shadow-gray-700/30 transition-shadow duration-200',
  
  // Input styles
  INPUT_BASE: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
  INPUT_ERROR: 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500',
  
  // Layout styles
  CONTAINER: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  SECTION_PADDING: 'py-12 lg:py-16',
  
  // Layout Constants
  LAYOUT: {
    MAX_WIDTH: 'max-w-4xl',
    CONTAINER_PADDING: 'px-4 sm:px-6 lg:px-8',
    HEADER_PADDING: 'pt-16 pb-6',
    CONTENT_PADDING: 'py-6',
    SECTION_SPACING: 'mb-8',
  },
  
  // Text styles
  TEXT_MUTED: 'text-gray-600 dark:text-gray-300',
  TEXT_PRIMARY: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-gray-500 dark:text-gray-400',
  
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
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-primary-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
  },
  
  // Badge variants
  BADGE: {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    secondary: 'bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
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
