/**
 * Content for `/about`.
 *
 * The sub-headline, vision, mission and core-value descriptions match the live
 * page. The four body paragraphs are written to the same brief and voice — swap
 * in the exact Webflow strings here if you want them character-for-character.
 */

export const aboutBody = {
  eyebrow: 'About Us',
  welcome: 'Welcome to',
  brand: 'Cebu GraphicStar',
  subheadline: 'Your creative destination for all things design!',
  paragraphs: [
    'At Cebu GraphicStar, we are passionate about bringing your vision to life through stunning graphic design solutions. Whether you are a startup looking to establish your brand identity or an established company seeking to refresh your marketing materials, we are here to help.',
    'Our team of talented designers combines innovation with expertise to deliver custom designs that capture attention and inspire action — from logos and full brand systems to print collateral and digital assets built to work everywhere your brand appears.',
    'Cebu GraphicStar is among the first in the country, and the only provider in the Visayas and Mindanao, to offer this range of state-of-the-art visual services under one roof: large-format printing, signage, modular displays and digital LED solutions.',
    'What began as a single, brilliant idea from two creative minds has grown into a vibrant, colourful masterpiece — and into the company you see today.',
  ],
} as const;

export const vision = {
  label: 'Vision',
  statement:
    "To be the Philippines' most trusted and leading visual solutions provider — driving innovation, brand empowerment, and business growth across the Visayas, Mindanao, and beyond.",
} as const;

export const mission = {
  label: 'Mission',
  statement:
    'We are committed to delivering end-to-end visual solutions — from print and signage to digital displays — that enhance brand visibility, foster loyalty, and generate sustainable growth.',
} as const;

export type CoreValue = {
  number: string;
  name: string;
  description: string;
};

export const coreValues = {
  heading: 'Core Values',
  items: [
    {
      number: '01',
      name: 'Service Excellence',
      description:
        'We strive for exceptional service, ensuring every solution we provide exceeds expectations and delivers real value.',
    },
    {
      number: '02',
      name: 'Transparency',
      description:
        'We uphold openness and honesty in all interactions, fostering trust with clients, partners, and stakeholders.',
    },
    {
      number: '03',
      name: 'Accountability',
      description:
        'We take responsibility for our actions, delivering on commitments and continuously improving to achieve outstanding results.',
    },
    {
      number: '04',
      name: 'Resilience',
      description:
        'We embrace challenges as opportunities to innovate, adapt, and drive growth, ensuring long-term success for our clients and business.',
    },
  ] satisfies CoreValue[],
} as const;
