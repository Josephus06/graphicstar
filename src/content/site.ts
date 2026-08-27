/**
 * Global site content — anything that appears in the shared shell
 * (navbar, footer, contact details) or in page metadata.
 */

export const site = {
  name: 'Cebu GraphicStar',
  legalName: 'Cebu GraphicStar Imaging Corp.',
  established: 1996,
  tagline: 'Creations Made Easy',
  description:
    'Cebu GraphicStar is a large-format printing, signage and digital display provider serving the Visayas and Mindanao since 1996.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.graphicstar.ph',
} as const;

export type NavLink = { label: string; href: string };

/** The five primary links, used by both the navbar and the footer. */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Contact Us', href: '/contact' },
];

export const quoteCta = { label: 'Request a Quote', href: '/contact' } as const;

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/graphicstarph/', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/graphicstarph/', icon: 'instagram' },
] as const;

export type Branch = {
  slug: string;
  name: string;
  address: string;
  /** Each entry is one line in the "Operating Hours" block. */
  hours: string[];
  landline: string;
  mobile: string;
  /** Search query used for the "Open in Google Maps" link. */
  mapQuery: string;
};

export const branches: Branch[] = [
  {
    slug: 'ayala',
    name: 'Ayala Branch',
    address: 'Basement 1, Service Lane, Ayala Center Cebu (beside Wash Up Laundry)',
    hours: ['Sunday to Thursday, 10:00 AM to 9:00 PM', 'Friday and Saturday, 10:00 AM to 10:00 PM'],
    landline: '238-4127',
    mobile: '0920-981-3954',
    mapQuery: 'Cebu GraphicStar, Ayala Center Cebu',
  },
  {
    slug: 'main',
    name: 'Main Office',
    address: 'J.S. Alinsug St., Basak, Mandaue City, Cebu',
    hours: ['Monday to Saturday, 8:00 AM to 5:00 PM'],
    landline: '238-1234',
    mobile: '0920-981-3961',
    mapQuery: 'Cebu GraphicStar Imaging Corp, J.S. Alinsug St, Basak, Mandaue City, Cebu',
  },
  {
    slug: 'sm',
    name: 'SM Branch',
    address: 'Lower Ground Level, SM City Cebu (across Mascot Pets)',
    hours: ['Sunday to Thursday, 10:00 AM to 9:00 PM', 'Friday and Saturday, 10:00 AM to 10:00 PM'],
    landline: '232-6399',
    mobile: '0939-980-4154',
    mapQuery: 'Cebu GraphicStar, SM City Cebu',
  },
];

/** Philippine landlines need the Cebu area code (+63 32) to dial from a handset. */
export const telHref = (number: string) => {
  const digits = number.replace(/[^0-9]/g, '');
  return digits.startsWith('0') ? `tel:+63${digits.slice(1)}` : `tel:+6332${digits}`;
};

export const mapsHref = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Shown in the footer contact block. */
export const primaryContact = {
  email: 'inquiry@graphicstar.ph',
  branch: branches[1],
} as const;

/** The scrolling strip that sits under the navbar on every inner page. */
export const tickerPhrase = 'CREATIONS MADE EASY';

/** Shared closing call-to-action, reused on most pages. */
export const closingCta = {
  heading: 'Make your vision come to life',
  button: { label: 'Contact Us', href: '/contact' },
} as const;

/** Reusable magenta Digistar band. */
export const digistarBand = {
  button: { label: 'See all digital products', href: '/digital-products' },
} as const;
