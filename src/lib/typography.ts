/**
 * Typography System for SonderSwap
 * 
 * This file defines consistent typography scales across the application
 * to ensure uniform text sizing and maintainability.
 */

export const typography = {
  // Headings
  h1: 'text-4xl sm:text-5xl lg:text-6xl font-bold', // Main hero headings
  h2: 'text-4xl sm:text-5xl font-bold', // Page titles, section headings
  h3: 'text-2xl font-semibold', // Subsection titles, feature titles
  h4: 'text-xl font-semibold', // Small headings, card titles
  
  // Body text
  body: 'text-3xl', // Main body text, descriptions
  bodyLarge: 'text-3xl sm:text-4xl', // Hero descriptions, large body text
  bodySmall: 'text-2xl', // Secondary text, feature descriptions
  
  // Interactive elements
  button: 'text-xl', // Default button text
  buttonLarge: 'text-2xl', // Large button text
  buttonSmall: 'text-lg', // Small button text
  
  // Navigation
  navBrand: 'text-4xl font-bold', // Brand name in navbar
  navLink: 'text-2xl font-medium', // Navigation links
  navLinkMobile: 'text-xl font-medium', // Mobile navigation links
  
  // Footer
  footerHeading: 'text-2xl font-semibold', // Footer section headings
  footerText: 'text-xl', // Footer body text
  footerBrand: 'text-4xl font-bold', // Footer brand name
  
  // Utility classes
  small: 'text-lg', // Small utility text
  caption: 'text-base', // Captions, fine print
} as const;

// Type for typography keys
export type TypographyKey = keyof typeof typography;
