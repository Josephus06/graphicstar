/** Content for `/portfolio`. */

import { portfolioImages, portfolioVideos } from './assets';

export const portfolioPage = {
  title: 'Portfolio',
  description:
    'Selected work from Cebu GraphicStar — signage, exhibition builds, large-format print, apparel and LED installations across the Visayas and Mindanao.',
  imageSection: {
    eyebrow: 'Image Portfolio',
    images: portfolioImages,
  },
  videoSection: {
    eyebrow: 'Video Portfolio',
    videos: portfolioVideos,
  },
} as const;
