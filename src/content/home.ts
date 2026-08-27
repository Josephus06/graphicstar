/** Content for the homepage (`/`). */

import { certificationAssets, type ImageAsset } from './assets';

export const homeHero = {
  chip: { label: 'More Products', action: 'See more', href: '/products' },
  /** Rendered as two lines; the colour is applied per line. */
  headline: [
    { text: 'Creations', tone: 'orange' as const },
    { text: 'Made Easy', tone: 'blue' as const },
  ],
} as const;

export const portfolioBento = {
  heading: 'Discover a world of premium custom creations',
  subcopy: ['Your vision. Our prints.', 'Together, we create something unforgettable.'],
  button: { label: 'See Portfolio', href: '/portfolio' },
} as const;

export const clientsSection = {
  eyebrow: "We work with Philippine's top brands",
} as const;

export const industriesSection = {
  eyebrow: 'Industries',
  items: [
    'Corporate & Business',
    'Retail & E-commerce',
    'Food & Beverage',
    'Hospitality & Tourism',
    'Healthcare',
    'Education',
    'Construction',
    'Real Estate',
    'Events & Entertainment',
    'Transportation & Logistics',
    'Beauty & Wellness',
    'Government & Nonprofits',
  ],
} as const;

export type Certification = {
  id: string;
  logo: ImageAsset;
  caption: string;
};

export const certificationsSection = {
  eyebrow: 'Licenses / Certifications',
  items: [
    { id: 'philgeps', logo: certificationAssets.philgeps, caption: 'PhilGEPS Platinum Membership' },
    { id: '3m-mcs', logo: certificationAssets.mcs3m, caption: '3M™ MCS™ Warranty' },
    { id: 'oshc', logo: certificationAssets.oshc, caption: 'Occupational Safety and Health Center' },
  ] satisfies Certification[],
} as const;

/**
 * The homepage "About Us" split. The About page reuses the same headings with a
 * longer body — see `src/content/about.ts`.
 */
export const homeAbout = {
  eyebrow: 'About Us',
  welcome: 'Welcome to',
  brand: 'Cebu GraphicStar',
  subheadline: 'Your creative destination for all things design!',
  paragraphs: [
    'At Cebu GraphicStar, we are passionate about bringing your vision to life through stunning graphic design solutions. Whether you are a startup looking to establish your brand identity or an established company seeking to refresh your marketing materials, we are here to help.',
  ],
  link: { label: 'Read about us', href: '/about' },
} as const;
