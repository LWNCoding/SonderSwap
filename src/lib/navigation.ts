import { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Current Events', href: '/current-events' },
];

export const FOOTER_LINKS = {
  QUICK_LINKS: [
    { label: 'Home', href: '/' },
    { label: 'Current Events', href: '/current-events' },
  ],
  CONTACT: {
    EMAIL: 'hello@sonderswap.com',
    LOCATION: 'Fairfax, VA',
  },
  COPYRIGHT: '2025 SonderSwap. All rights reserved.',
} as const;

export const LAYOUT_CONSTANTS = {
  FOOTER_GRID: 'grid-cols-1 md:grid-cols-4',
  BRAND_SPAN: 'col-span-1 md:col-span-2',
  FOOTER_PADDING: 'py-12',
  BOTTOM_BAR_PADDING: 'mt-8 pt-8',
} as const;
