/**
 * Single source of truth for every binary asset the site references.
 *
 * Nothing is hot-linked from graphicstar.ph. Every entry below points at a file
 * inside /public. `npm run placeholders` regenerates solid-colour SVG stand-ins
 * for all of them at the correct aspect ratio, so the app builds and lays out
 * correctly before the real photography lands.
 *
 * To ship a real asset: drop the file into /public/images/... (or /public/video/...)
 * and update the `src` here. Nothing else in the codebase needs to change.
 *
 * See ASSETS.md at the repo root for the same list in human-readable form.
 */

export type ImageAsset = {
  /** Path under /public. */
  src: string;
  /** Meaningful alternative text. Never leave this empty for content imagery. */
  alt: string;
  /** Intrinsic pixel size — always set, so nothing shifts while loading. */
  width: number;
  height: number;
};

export type VideoAsset = {
  /** Path under /public/video. */
  src: string;
  /** Poster still, shown before playback and whenever the video is unavailable. */
  poster: ImageAsset;
  width: number;
  height: number;
};

/**
 * Placeholder SVGs cover the imagery, but a video file cannot be faked.
 * Flip this to `true` once the real .mp4 files are in /public/video — until then
 * every video slot renders its poster still instead of requesting a missing file.
 */
export const VIDEO_ASSETS_READY = true;

const img = (src: string, alt: string, width: number, height: number): ImageAsset => ({
  src,
  alt,
  width,
  height,
});

/* ---------------------------------------------------------------- brand -- */

export const brandAssets = {
  logo: img(
    '/images/brand/logo-30-years.png',
    'Cebu GraphicStar 30 Years anniversary logo — creations made easy',
    172,
    64,
  ),
  digistarWordmark: img('/images/brand/digistar-wordmark.png', 'Digistar', 320, 84),
  ogDefault: img(
    '/images/og/graphicstar-og.svg',
    'Cebu GraphicStar — Creations Made Easy',
    1903,
    762,
  ),
} satisfies Record<string, ImageAsset>;

/* ----------------------------------------------------------------- home -- */

export const homeAssets = {
  hero: img(
    '/images/home/hero-showcase.png',
    'Cebu GraphicStar exhibition booth showcasing printed banners, standees, tarpaulins, shirts and tote bags',
    2880,
    1800,
  ),
  bento: [
    img('/images/home/bento-01.png', 'Custom printed retail signage installed in a Cebu store', 800, 1000),
    img('/images/home/bento-02.png', 'Large-format tarpaulin backdrop at a corporate event', 1280, 800),
    img('/images/home/bento-03.png', 'Branded modular exhibition display with fabric graphics', 1280, 800),
    img('/images/home/bento-04.png', 'Screen-printed apparel and tote bags laid out on a table', 800, 1000),
    img('/images/home/bento-05.png', 'Illuminated storefront signage produced by Cebu GraphicStar', 1680, 720),
  ],
} as const;

/* -------------------------------------------------------------- clients -- */

const clientLogo = (slug: string, name: string): ImageAsset =>
  img(`/images/clients/${slug}.svg`, `${name} logo`, 240, 120);

export const clientLogos: ImageAsset[] = [
  clientLogo('store-specialist', 'Store Specialist Inc.'),
  clientLogo('sika', 'Sika Philippines'),
  clientLogo('sacred-heart-ateneo', 'Sacred Heart School Ateneo de Cebu'),
  clientLogo('city-savings-bank', 'City Savings Bank'),
  clientLogo('treasure-island', 'Treasure Island Industrial Corp.'),
  clientLogo('boysen', 'Pacific Paints Boysen Philippines'),
  clientLogo('rustans', 'Rustans'),
  clientLogo('philippine-kenko', 'Philippine Kenko Corp.'),
  clientLogo('llarch-construction', 'Llarch Construction'),
  clientLogo('rockwell-land', 'Rockwell Land Corp.'),
  clientLogo('honda', 'Honda Philippines'),
  clientLogo('university-of-visayas', 'University of the Visayas'),
  clientLogo('lear', 'Lear Corporation'),
  clientLogo('unahco', 'Unahco Inc.'),
  clientLogo('tsuneishi', 'Tsuneishi Heavy Industries'),
  clientLogo('jollibee', 'Jollibee'),
  clientLogo('cebu-landmasters', 'Cebu Landmasters'),
];

/* ------------------------------------------------------- certifications -- */

export const certificationAssets = {
  philgeps: img('/images/certifications/philgeps.png', 'PhilGEPS seal', 320, 160),
  mcs3m: img('/images/certifications/3m-mcs.png', '3M MCS Warranty seal', 320, 160),
  oshc: img(
    '/images/certifications/oshc.png',
    'Occupational Safety and Health Center seal',
    320,
    160,
  ),
} satisfies Record<string, ImageAsset>;

/* ---------------------------------------------------------------- about -- */

export const aboutHeroVideo: VideoAsset = {
  src: '/video/about-hero.mp4',
  poster: img(
    '/images/about/hero-poster.svg',
    'Cebu GraphicStar production floor and finished print work',
    2400,
    1000,
  ),
  width: 2400,
  height: 1000,
};

/* -------------------------------------------------------- digistar band -- */

/**
 * The two band reels are deliberately different shapes: a 9:16 portrait beside
 * a 16:9 landscape. `DigistarBand` sizes each cell from these dimensions, so
 * changing an aspect here is all that is needed to re-proportion the row.
 */
export const digistarReels: VideoAsset[] = [
  {
    src: '/video/digistar-reel-01.mp4',
    poster: img('/images/digistar/reel-01-poster.svg', 'Digistar LED wall installation reel', 720, 1280),
    width: 720,
    height: 1280,
  },
  {
    src: '/video/digistar-reel-02.mp4',
    poster: img(
      '/images/digistar/reel-02-poster.svg',
      'Digistar transparent LED display reel',
      1280,
      720,
    ),
    // Matches the source file (1920×1080). The poster is a smaller 16:9 stand-in,
    // so it shares the aspect and nothing shifts when the video takes over.
    width: 1920,
    height: 1080,
  },
];

/* ------------------------------------------------------------- products -- */

/** Square product-panel photography used by /products and every category page. */
export const productPhoto = (slug: string, label: string): ImageAsset =>
  img(`/images/products/${slug}.png`, `${label} by Cebu GraphicStar`, 800, 800);

/* ------------------------------------------------------------ portfolio -- */

export const portfolioImages: ImageAsset[] = [
  img('/images/portfolio/work-01.svg', 'Full colour vehicle wrap produced in Cebu', 1200, 900),
  img('/images/portfolio/work-02.svg', 'Retail window graphics installation', 900, 1200),
  img('/images/portfolio/work-03.svg', 'Event stage backdrop printed on tension fabric', 1600, 900),
  img('/images/portfolio/work-04.svg', 'Acrylic build-up office reception signage', 1200, 1200),
  img('/images/portfolio/work-05.svg', 'Roll-up banner set for a product launch', 900, 1200),
  img('/images/portfolio/work-06.svg', 'Custom trade show booth with printed panels', 1600, 900),
  img('/images/portfolio/work-07.svg', 'Screen-printed corporate uniforms', 1200, 900),
  img('/images/portfolio/work-08.svg', 'Illuminated pylon sign for a commercial building', 900, 1200),
  img('/images/portfolio/work-09.svg', 'Wall mural printed and installed in an office', 1600, 900),
  img('/images/portfolio/work-10.svg', 'Acrylic and wood awards with engraved plates', 1200, 1200),
  img('/images/portfolio/work-11.svg', 'Mall atrium activation booth', 1200, 900),
  img('/images/portfolio/work-12.svg', 'LED wall installed for a corporate conference', 1600, 900),
];

export type PortfolioVideo = VideoAsset & {
  title: string;
  orientation: 'landscape' | 'portrait';
};

export const portfolioVideos: PortfolioVideo[] = [
  {
    title: 'Trade show booth build',
    orientation: 'landscape',
    src: '/video/portfolio-01.mp4',
    poster: img('/images/portfolio/video-01-poster.svg', 'Trade show booth build time-lapse', 1600, 900),
    width: 1600,
    height: 900,
  },
  {
    title: 'LED wall installation',
    orientation: 'portrait',
    src: '/video/portfolio-02.mp4',
    poster: img('/images/portfolio/video-02-poster.svg', 'LED wall installation reel', 720, 1280),
    width: 720,
    height: 1280,
  },
  {
    title: 'Large-format press run',
    orientation: 'landscape',
    src: '/video/portfolio-03.mp4',
    poster: img(
      '/images/portfolio/video-03-poster.svg',
      'Large-format printer running a banner',
      1600,
      900,
    ),
    width: 1600,
    height: 900,
  },
  {
    title: 'Storefront signage reveal',
    orientation: 'portrait',
    src: '/video/portfolio-04.mp4',
    poster: img('/images/portfolio/video-04-poster.svg', 'Storefront signage reveal reel', 720, 1280),
    width: 720,
    height: 1280,
  },
  {
    title: 'Apparel printing line',
    orientation: 'landscape',
    src: '/video/portfolio-05.mp4',
    poster: img(
      '/images/portfolio/video-05-poster.svg',
      'Apparel printing production line',
      1600,
      900,
    ),
    width: 1600,
    height: 900,
  },
  {
    title: 'Modular display assembly',
    orientation: 'portrait',
    src: '/video/portfolio-06.mp4',
    poster: img('/images/portfolio/video-06-poster.svg', 'Modular display assembly reel', 720, 1280),
    width: 720,
    height: 1280,
  },
];
