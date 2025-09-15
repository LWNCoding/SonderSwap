/**
 * Typography System for SonderSwap
 * 
 * This file defines consistent typography scales across the application
 * to ensure uniform text sizing and maintainability.
 */

export const typography = {
  // Headings
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold', // Main hero headings
  h2: 'text-xl sm:text-2xl lg:text-3xl font-bold', // Page titles, section headings
  h3: 'text-lg sm:text-xl font-semibold', // Subsection titles, feature titles
  h4: 'text-base sm:text-lg font-semibold', // Small headings, card titles
  
  // Body text
  body: 'text-sm sm:text-base', // Main body text, descriptions
  bodyLarge: 'text-base sm:text-lg', // Hero descriptions, large body text
  bodySmall: 'text-xs sm:text-sm', // Secondary text, feature descriptions
  
  // Interactive elements
  button: 'text-sm sm:text-base', // Default button text
  buttonLarge: 'text-base sm:text-lg', // Large button text
  buttonSmall: 'text-xs sm:text-sm', // Small button text
  
  // Navigation
  navBrand: 'text-lg sm:text-xl font-bold', // Brand name in navbar
  navLink: 'text-sm sm:text-base font-medium', // Navigation links
  navLinkMobile: 'text-sm font-medium', // Mobile navigation links
  
  // Footer
  footerHeading: 'text-sm sm:text-base font-semibold', // Footer section headings
  footerText: 'text-xs sm:text-sm', // Footer body text
  footerBrand: 'text-lg sm:text-xl font-bold', // Footer brand name
  
  // Utility classes
  small: 'text-xs sm:text-sm', // Small utility text
  caption: 'text-xs', // Captions, fine print
} as const;

// Type for typography keys
export type TypographyKey = keyof typeof typography;
