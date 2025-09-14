// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Loading States
export const LOADING_STATES = {
  EVENTS: 'Loading events...',
  EVENT: 'Loading event...',
  CATEGORIES: 'Loading categories...',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  EVENTS_LOAD_FAILED: 'Failed to load events',
  EVENT_LOAD_FAILED: 'Failed to load event',
  CATEGORIES_LOAD_FAILED: 'Failed to load categories',
  EVENT_NOT_FOUND: 'Event not found',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GENERIC: 'An unexpected error occurred. Please try again.',
} as const;

// Layout Constants
export const LAYOUT = {
  MAX_WIDTH: 'max-w-7xl',
  CONTAINER_PADDING: 'px-4 sm:px-6 lg:px-8',
  HEADER_PADDING: 'pt-20 pb-8',
  CONTENT_PADDING: 'py-8',
  SECTION_SPACING: 'mb-12',
} as const;

// Carousel Constants
export const CAROUSEL = {
  CARD_WIDTH: 288, // w-72 = 288px
  CARD_GAP: 16, // space-x-4 = 16px
  CARDS_PER_PAGE: 4,
  SCROLL_TIMEOUT: 500,
  BUTTON_SIZE: 'w-12 h-12',
  INDICATOR_WIDTH: 'w-10',
  INDICATOR_HEIGHT: 'h-1',
} as const;

// Animation Constants
export const ANIMATION = {
  TRANSITION_DURATION: 'duration-300',
  HOVER_SCALE: 'hover:scale-105',
  SMOOTH_SCROLL: 'scroll-smooth',
} as const;

// Gradient Constants
export const GRADIENTS = {
  PRIMARY_SECONDARY: 'bg-gradient-to-r from-primary-600 to-secondary-600',
  PRIMARY_SECONDARY_TEXT: 'bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent',
  BUTTON_HOVER: 'hover:from-primary-700 hover:to-secondary-700',
  BACKGROUND: 'bg-gradient-to-br from-primary-50 to-secondary-50',
  BUTTON_BACKGROUND: 'bg-gradient-to-r from-primary-100 to-secondary-100',
  BUTTON_BACKGROUND_HOVER: 'hover:from-primary-200 hover:to-secondary-200',
  CARD_OVERLAY: 'bg-gradient-to-t from-white/30 via-transparent to-transparent',
  INDICATOR_ACTIVE: 'bg-gradient-to-r from-primary-600 to-secondary-600',
  INDICATOR_INACTIVE: 'bg-gradient-to-r from-primary-200 to-secondary-200',
  INDICATOR_CONTAINER: 'bg-gradient-to-r from-primary-100/90 to-secondary-100/90',
} as const;

// Color Constants
export const COLORS = {
  PRIMARY: 'primary-600',
  SECONDARY: 'secondary-600',
  GRAY_900: 'gray-900',
  GRAY_600: 'gray-600',
  GRAY_700: 'gray-700',
  WHITE: 'white',
  TRANSPARENT: 'transparent',
} as const;

// Size Constants
export const SIZES = {
  CARD_WIDTH: 'w-72',
  FULL_WIDTH: 'w-full',
  FULL_HEIGHT: 'h-full',
  ASPECT_SQUARE: 'aspect-square',
} as const;

// Spacing Constants
export const SPACING = {
  SMALL: 'space-x-4',
  MEDIUM: 'space-x-6',
  LARGE: 'space-x-8',
  SECTION_GAP: 'gap-8',
  CARD_PADDING: 'p-3',
} as const;
