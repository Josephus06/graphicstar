/** Content for `/portfolio`. */

import { portfolioImages, portfolioVideos } from './assets';

export const portfolioPage = {
  title: 'Portfolio',
  description:
    'Selected work from Cebu GraphicStar — signage, exhibition builds, large-format print, apparel and LED installations across the Visayas and Mindanao.',
  hero: {
    /** Rendered three times at falling opacity for the echo effect. */
    headline: 'creations made easy',
    subline:
      'Thirty years of signage, exhibition builds, large-format print and LED across the Visayas and Mindanao.',
    cta: 'See our work',
  },
  imageSection: {
    eyebrow: 'Image Portfolio',
    images: portfolioImages,
  },
  videoSection: {
    eyebrow: 'Video Portfolio',
    videos: portfolioVideos,
  },
} as const;
