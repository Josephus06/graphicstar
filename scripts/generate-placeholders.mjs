#!/usr/bin/env node
/**
 * Generates solid-colour SVG stand-ins for every image slot the site expects,
 * at the correct aspect ratio, plus the hand-drawn brand marks and ASSETS.md.
 *
 *   npm run placeholders
 *
 * Existing files are never overwritten unless you pass --force, so you can drop
 * real assets in and re-run this safely to fill only what is still missing.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const FORCE = process.argv.includes('--force');

/* ------------------------------------------------------------- palette --- */

const TONES = {
  grey: { bg: '#E4E4E4', fg: '#9A9A9A' },
  panel: { bg: '#F2F2F2', fg: '#A8A8A8' },
  blue: { bg: '#D6D5FF', fg: '#4B48C9' },
  orange: { bg: '#FBE2C9', fg: '#B45E06' },
  magenta: { bg: '#F0CFE1', fg: '#8A0051' },
  navy: { bg: '#D5D7E0', fg: '#4A4E68' },
};

/* --------------------------------------------------------------- slots --- */
/**
 * Every entry: [path, width, height, tone, page, slot description].
 * This list is also what ASSETS.md is generated from.
 */
const SLOTS = [
  // --- brand -------------------------------------------------------------
  ['images/og/graphicstar-og.svg', 1200, 630, 'blue', 'All pages', 'Default Open Graph / social share image'],

  // --- home --------------------------------------------------------------
  ['images/home/hero-showcase.svg', 1600, 1200, 'orange', 'Home', 'Hero product-showcase photo (exhibition booth, banners, standees, shirts, totes)'],
  ['images/home/bento-01.svg', 800, 1000, 'grey', 'Home', 'Portfolio bento — row 1 left (1/3)'],
  ['images/home/bento-02.svg', 1280, 800, 'blue', 'Home', 'Portfolio bento — row 1 right (2/3)'],
  ['images/home/bento-03.svg', 1280, 800, 'navy', 'Home', 'Portfolio bento — row 2 left (2/3)'],
  ['images/home/bento-04.svg', 800, 1000, 'orange', 'Home', 'Portfolio bento — row 2 right (1/3)'],
  ['images/home/bento-05.svg', 1680, 720, 'magenta', 'Home', 'Portfolio bento — full-width feature cell'],

  // --- certifications ----------------------------------------------------
  ['images/certifications/philgeps.svg', 320, 160, 'blue', 'Home', 'PhilGEPS Platinum Membership seal'],
  ['images/certifications/3m-mcs.svg', 320, 160, 'orange', 'Home', '3M MCS Warranty seal'],
  ['images/certifications/oshc.svg', 320, 160, 'navy', 'Home', 'OSHC seal'],

  // --- about -------------------------------------------------------------
  ['images/about/hero-poster.svg', 2400, 1000, 'navy', 'About', 'Media hero — poster still for the full-bleed video'],

  // --- digistar band -----------------------------------------------------
  ['images/digistar/reel-01-poster.svg', 720, 1280, 'magenta', 'Home, About', 'Digistar band — left reel poster'],
  ['images/digistar/reel-02-poster.svg', 1280, 720, 'magenta', 'Home, About', 'Digistar band — right reel poster (landscape)'],

  // --- portfolio ---------------------------------------------------------
  ...[
    [1, 1200, 900, 'grey'], [2, 900, 1200, 'blue'], [3, 1600, 900, 'orange'],
    [4, 1200, 1200, 'navy'], [5, 900, 1200, 'magenta'], [6, 1600, 900, 'grey'],
    [7, 1200, 900, 'blue'], [8, 900, 1200, 'orange'], [9, 1600, 900, 'navy'],
    [10, 1200, 1200, 'magenta'], [11, 1200, 900, 'grey'], [12, 1600, 900, 'blue'],
  ].map(([n, w, h, tone]) => [
    `images/portfolio/work-${String(n).padStart(2, '0')}.svg`, w, h, tone,
    'Portfolio', `Image portfolio — gallery item ${n}`,
  ]),
  ...[
    [1, 1600, 900], [2, 720, 1280], [3, 1600, 900],
    [4, 720, 1280], [5, 1600, 900], [6, 720, 1280],
  ].map(([n, w, h]) => [
    `images/portfolio/video-${String(n).padStart(2, '0')}-poster.svg`, w, h, 'navy',
    'Portfolio', `Video portfolio — poster still ${n} (${w > h ? 'landscape' : 'portrait'})`,
  ]),
];

/* --- clients ------------------------------------------------------------ */
const CLIENTS = [
  ['store-specialist', 'Store Specialist'], ['sika', 'Sika'],
  ['sacred-heart-ateneo', 'Sacred Heart'], ['city-savings-bank', 'City Savings'],
  ['treasure-island', 'Treasure Island'], ['boysen', 'Boysen'],
  ['rustans', 'Rustans'], ['philippine-kenko', 'Kenko'],
  ['llarch-construction', 'Llarch'], ['rockwell-land', 'Rockwell'],
  ['honda', 'Honda'], ['university-of-visayas', 'Univ. of Visayas'],
  ['lear', 'Lear'], ['unahco', 'Unahco'],
  ['tsuneishi', 'Tsuneishi'], ['jollibee', 'Jollibee'],
  ['cebu-landmasters', 'Cebu Landmasters'],
];
for (const [slug, name] of CLIENTS) {
  SLOTS.push([`images/clients/${slug}.svg`, 240, 120, 'panel', 'Home', `Client logo — ${name}`]);
}

/* --- product photography ------------------------------------------------ */
const CATEGORY_PHOTOS = [
  ['category-digital-displays', 'Digital displays'], ['category-apparel', 'Apparel'],
  ['category-signages', 'Signages and modular displays'], ['category-small-format', 'Small format prints'],
  ['category-large-format', 'Large format prints'], ['category-frames-awards', 'Frames and awards'],
  ['category-booths-carts', 'Booths and carts'],
];
for (const [slug, name] of CATEGORY_PHOTOS) {
  SLOTS.push([`images/products/${slug}.svg`, 800, 800, 'panel', 'Products', `Category card — ${name}`]);
}

const DIGITAL_ITEMS = [
  ['lcd-topper', 'LCD Topper'], ['led-curve', 'LED Curve'], ['led-fence', 'LED Fence'],
  ['flight-case', 'Flight Case'], ['led-platform', 'LED Platform'], ['led-transparent', 'LED Transparent'],
  ['led-wall-indoor-outdoor', 'LED Wall Indoor/Outdoor'], ['led-banner-indoor-outdoor', 'LED Banner Indoor/Outdoor'],
];
for (const [slug, name] of DIGITAL_ITEMS) {
  SLOTS.push([`images/products/${slug}.svg`, 800, 800, 'panel', 'Digital Products', `Item card — ${name}`]);
}

const APPAREL_ITEMS = [
  ['polo-shirts', 'Polo Shirts'], ['t-shirts', 'T-Shirts'],
];
for (const [slug, name] of APPAREL_ITEMS) {
  SLOTS.push([`images/products/${slug}.svg`, 800, 800, 'panel', 'Apparels', `Item card — ${name}`]);
}

/* --------------------------------------------------------------- video --- */
const VIDEO_SLOTS = [
  ['video/about-hero.mp4', '12:5', 'About', 'Full-bleed media hero, muted + looping (~600px tall)'],
  ['video/digistar-reel-01.mp4', '9:16', 'Home, About', 'Digistar band — left portrait reel'],
  ['video/digistar-reel-02.mp4', '16:9', 'Home, About', 'Digistar band — right landscape reel'],
  ['video/portfolio-01.mp4', '16:9', 'Portfolio', 'Video portfolio — landscape reel 1'],
  ['video/portfolio-02.mp4', '9:16', 'Portfolio', 'Video portfolio — portrait reel 2'],
  ['video/portfolio-03.mp4', '16:9', 'Portfolio', 'Video portfolio — landscape reel 3'],
  ['video/portfolio-04.mp4', '9:16', 'Portfolio', 'Video portfolio — portrait reel 4'],
  ['video/portfolio-05.mp4', '16:9', 'Portfolio', 'Video portfolio — landscape reel 5'],
  ['video/portfolio-06.mp4', '9:16', 'Portfolio', 'Video portfolio — portrait reel 6'],
];

/* ----------------------------------------------------------- generators -- */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const ratio = (w, h) => {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
};

function placeholderSvg(path, w, h, toneKey) {
  const tone = TONES[toneKey] ?? TONES.grey;
  const name = path.split('/').pop().replace(/\.svg$/, '');
  const label = Math.min(w, h) < 200 ? 11 : Math.round(Math.min(w, h) * 0.045);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Placeholder">
  <rect width="${w}" height="${h}" fill="${tone.bg}"/>
  <g fill="${tone.fg}" font-family="Montserrat, Helvetica, Arial, sans-serif" text-anchor="middle">
    <text x="${w / 2}" y="${h / 2 - label * 0.2}" font-size="${label}" font-weight="700" letter-spacing="${label * 0.08}">${esc(
      name.toUpperCase(),
    )}</text>
    <text x="${w / 2}" y="${h / 2 + label * 1.5}" font-size="${label * 0.8}" font-weight="500" opacity="0.75">${w}×${h} · ${ratio(
      w,
      h,
    )}</text>
  </g>
</svg>
`;
}

/**
 * The "30 YEARS" anniversary lockup: an orange 3 sitting against the blue G,
 * with the tagline beneath. Hand-drawn stand-in — replace with the official
 * artwork when it arrives (same path, same 172×64 box).
 */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="172" height="64" viewBox="0 0 172 64" role="img" aria-label="Cebu GraphicStar 30 Years">
  <g font-family="Montserrat, Helvetica, Arial, sans-serif">
    <text x="0" y="40" font-size="42" font-weight="800" fill="#ED7504" letter-spacing="-2">3</text>
    <text x="24" y="40" font-size="42" font-weight="800" fill="#0500FF" letter-spacing="-2">G</text>
    <text x="60" y="24" font-size="13" font-weight="800" fill="#151515" letter-spacing="1.2">YEARS</text>
    <text x="60" y="40" font-size="11" font-weight="700" fill="#0500FF" letter-spacing="0.6">GRAPHICSTAR</text>
    <text x="0" y="56" font-size="8.5" font-weight="500" fill="#6B6B6B" letter-spacing="1.1">creations made easy</text>
  </g>
</svg>
`;

const DIGISTAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="84" viewBox="0 0 320 84" role="img" aria-label="Digistar">
  <g font-family="Montserrat, Helvetica, Arial, sans-serif" fill="#BA006D">
    <text x="0" y="52" font-size="52" font-weight="800" letter-spacing="-1.5">digistar</text>
    <text x="4" y="72" font-size="11" font-weight="600" letter-spacing="4.2" opacity="0.85">DIGITAL DISPLAYS</text>
  </g>
</svg>
`;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0500FF"/>
  <text x="32" y="46" font-family="Montserrat, Helvetica, Arial, sans-serif" font-size="42" font-weight="800" fill="#ED7504" text-anchor="middle">G</text>
</svg>
`;

/* ------------------------------------------------------------------ run -- */

let written = 0;
let skipped = 0;

function write(relPath, contents) {
  const full = join(PUBLIC, relPath);
  if (existsSync(full) && !FORCE) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
  written += 1;
}

for (const [path, w, h, tone] of SLOTS) {
  write(path, placeholderSvg(path, w, h, tone));
}
write('images/brand/logo-30-years.svg', LOGO_SVG);
write('images/brand/digistar-wordmark.svg', DIGISTAR_SVG);
write('images/brand/favicon.svg', FAVICON_SVG);

// Keep the video directory in version control even while it is empty.
write('video/README.md', `# Video assets\n\nDrop the real .mp4 files listed in ASSETS.md here, then flip\n\`VIDEO_ASSETS_READY\` to \`true\` in \`src/content/assets.ts\`.\n\nUntil then every video slot renders its poster still instead.\n`);

/* ------------------------------------------------------------ ASSETS.md -- */

const rows = SLOTS.map(([path, w, h, , page, slot]) => `| \`/${path}\` | ${page} | ${slot} | ${w}×${h} | ${ratio(w, h)} |`);
const videoRows = VIDEO_SLOTS.map(([path, r, page, slot]) => `| \`/${path}\` | ${page} | ${slot} | — | ${r} |`);

const assetsMd = `# Asset manifest

Every asset the site expects, and where it is used. Nothing here is hot-linked
from graphicstar.ph — all paths are local files under \`/public\`.

The typed manifest that the app actually reads is
[\`src/content/assets.ts\`](src/content/assets.ts). This file is generated
alongside the placeholders by \`npm run placeholders\` — edit the \`SLOTS\` list in
[\`scripts/generate-placeholders.mjs\`](scripts/generate-placeholders.mjs) rather
than editing this file by hand.

## How to ship a real asset

1. Drop the file into the same path under \`/public\` (a \`.jpg\`/\`.webp\` is fine —
   it does not have to stay \`.svg\`).
2. Update the matching \`src\` in \`src/content/assets.ts\`.
3. Re-run \`npm run placeholders\` if you want stand-ins for anything still missing;
   existing files are never overwritten unless you pass \`--force\`.

## Images (${SLOTS.length} slots)

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

## Brand marks (hand-drawn stand-ins — replace with official artwork)

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
| \`/images/brand/logo-30-years.svg\` | All pages | Navbar + footer "30 YEARS" anniversary lockup | 172×64 | 43:16 |
| \`/images/brand/digistar-wordmark.svg\` | Digital Products | Digistar sub-brand wordmark above the page title | 320×84 | 80:21 |
| \`/images/brand/favicon.svg\` | All pages | Browser tab icon | 64×64 | 1:1 |

## Video (${VIDEO_SLOTS.length} slots)

Videos cannot be placeholder-generated. Until the real files land,
\`VIDEO_ASSETS_READY\` in \`src/content/assets.ts\` stays \`false\` and every slot
renders its poster still instead of requesting a missing file.

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
${videoRows.join('\n')}

Each video also has a poster still in the images table above.
`;

writeFileSync(join(ROOT, 'ASSETS.md'), assetsMd, 'utf8');

/* ------------------------------------------------------- drift check ----- */

const manifest = readFileSync(join(ROOT, 'src/content/assets.ts'), 'utf8');
const referenced = new Set(
  [...manifest.matchAll(/'\/(images|video)\/([^']+)'/g)].map((m) => `${m[1]}/${m[2]}`),
);
const generated = new Set([
  ...SLOTS.map(([p]) => p),
  ...VIDEO_SLOTS.map(([p]) => p),
  'images/brand/logo-30-years.svg',
  'images/brand/digistar-wordmark.svg',
]);
// Template-literal paths (client logos, product photos) resolve at runtime, so
// only flag literal paths the manifest names but this script does not produce.
const missing = [...referenced].filter((p) => !generated.has(p));

console.log(`placeholders: ${written} written, ${skipped} already present`);
console.log(`ASSETS.md: ${SLOTS.length} image slots + ${VIDEO_SLOTS.length} video slots`);
if (missing.length) {
  console.warn('\n⚠  Referenced in src/content/assets.ts but not generated here:');
  for (const p of missing) console.warn(`   /${p}`);
  process.exitCode = 1;
}
