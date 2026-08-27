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

/**
 * Portfolio cards carry a title and a category tag for the grid overlay, on top
 * of the plain image fields. Swap `src` for real photography and the rest of the
 * page follows.
 */
export type PortfolioImage = ImageAsset & {
  title: string;
  category: string;
};

/**
 * `file` includes its extension, so a slot can move from the placeholder .svg
 * to a real .png or .jpg by editing that one string — no change anywhere else.
 */
const work = (
  file: string,
  alt: string,
  width: number,
  height: number,
  title: string,
  category: string,
): PortfolioImage => ({
  ...img(`/images/portfolio/${file}`, alt, width, height),
  title,
  category,
});

export const portfolioImages: PortfolioImage[] = [
  work(
    'work-01.jpg',
    'Four backlit lightbox panels showing jewellery photography, mounted on a retail wall',
    2048,
    1576,
    'Backlit Jewellery Lightboxes',
    'Signage',
  ),
  work(
    'work-02.jpg',
    'Illuminated built-up letter sign — a red disc with a face-lit V, mounted on a slatted wall',
    2048,
    1576,
    'Illuminated Built-Up Signage',
    'Signage',
  ),
  work(
    'work-03.jpg',
    'Outdoor LED banner wall at night running sponsor content for an event',
    2048,
    1576,
    'Event LED Banner Wall',
    'Digital Displays',
  ),
  work(
    'work-04.jpg',
    'LED start arch and side banners built for a night fun-run, showing sponsor branding',
    2048,
    1576,
    'Fun Run LED Start Arch',
    'Digital Displays',
  ),
  work(
    'work-05.jpg',
    'Three framed backlit poster panels installed above shelving in a retail store',
    2048,
    1576,
    'Retail Poster Panels',
    'Large Format',
  ),
  work(
    'work-06.jpg',
    'Double-walled glass mug with a bamboo lid, printed with a corporate logo',
    2048,
    1576,
    'Branded Glassware',
    'Corporate Merchandise',
  ),
  work(
    'work-07.jpg',
    'Two custom acrylic tournament medals on printed lanyards, champion and runner-up',
    2048,
    1576,
    'Custom Tournament Medals',
    'Frames and Awards',
  ),
  work(
    'work-08.jpg',
    'Three portrait LED totem displays running brand content in an office corridor',
    2048,
    1576,
    'LED Totem Displays',
    'Digital Displays',
  ),
  work(
    'work-09.jpg',
    'Three engraved acrylic marine labels reading Galley, Captain and Duct Trunk',
    1667,
    1282,
    'Engraved Acrylic Labels',
    'Signage',
  ),
  work(
    'work-10.jpg',
    'Three branded ballpoint pens printed with the Cebu GraphicStar logo',
    2048,
    1576,
    'Branded Ballpoint Pens',
    'Corporate Merchandise',
  ),
  work(
    'work-11.jpg',
    'Two portrait LED poster displays mounted on a timber wall in a hotel interior',
    2048,
    1576,
    'Hotel LED Poster Displays',
    'Digital Displays',
  ),
  work(
    'work-12.jpg',
    'Long LED perimeter banner at a daytime fun-run, with runners gathered behind it',
    2048,
    1576,
    'Event Perimeter LED Banner',
    'Digital Displays',
  ),
];

export type PortfolioVideo = VideoAsset & {
  title: string;
  orientation: 'landscape' | 'portrait';
};

export const portfolioVideos: PortfolioVideo[] = [
  {
    title: 'LED Poster Display Range',
    orientation: 'landscape',
    src: '/video/portfolio-01.mp4',
    poster: img(
      '/images/portfolio/video-01-poster.jpg',
      'Three free-standing LED poster displays running colourful motion graphics',
      1280,
      720,
    ),
    width: 1280,
    height: 720,
  },
  {
    title: 'Panel Trimming',
    orientation: 'portrait',
    src: '/video/portfolio-02.mp4',
    poster: img(
      '/images/portfolio/video-02-poster.jpg',
      'A technician in Cebu GraphicStar uniform trimming a printed panel on a bench cutter',
      720,
      1280,
    ),
    width: 720,
    height: 1280,
  },
  {
    title: 'Frame Assembly',
    orientation: 'landscape',
    src: '/video/portfolio-03.mp4',
    poster: img(
      '/images/portfolio/video-03-poster.jpg',
      'Gloved hands measuring a black frame on a workshop bench',
      1280,
      720,
    ),
    width: 1280,
    height: 720,
  },
  {
    title: 'Digistar Visuals Display',
    orientation: 'landscape',
    src: '/video/portfolio-05.mp4',
    poster: img(
      '/images/portfolio/video-05-poster.jpg',
      'A Digistar Visuals LED display mounted on a plinth in a studio setting',
      1280,
      720,
    ),
    width: 1280,
    height: 720,
  },
  {
    title: 'Digistar Visuals Reel',
    orientation: 'portrait',
    src: '/video/portfolio-06.mp4',
    poster: img(
      '/images/portfolio/video-06-poster.jpg',
      'Digistar Visuals title card on a magenta background, from an LED display reel',
      426,
      1280,
    ),
    // The source is an unusually tall 1:3 reel, not the 9:16 this slot assumed.
    width: 426,
    height: 1280,
  },
];
