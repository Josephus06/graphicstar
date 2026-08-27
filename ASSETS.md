# Asset manifest

Every asset the site expects, and where it is used. Nothing here is hot-linked
from graphicstar.ph — all paths are local files under `/public`.

The typed manifest that the app actually reads is
[`src/content/assets.ts`](src/content/assets.ts). This file is generated
alongside the placeholders by `npm run placeholders` — edit the `SLOTS` list in
[`scripts/generate-placeholders.mjs`](scripts/generate-placeholders.mjs) rather
than editing this file by hand.

## How to ship a real asset

1. Drop the file into the same path under `/public` (a `.jpg`/`.webp` is fine —
   it does not have to stay `.svg`).
2. Update the matching `src` in `src/content/assets.ts`.
3. Re-run `npm run placeholders` if you want stand-ins for anything still missing;
   existing files are never overwritten unless you pass `--force`.

## Images (65 slots)

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
| `/images/og/graphicstar-og.svg` | All pages | Default Open Graph / social share image | 1200×630 | 40:21 |
| `/images/home/hero-showcase.svg` | Home | Hero product-showcase photo (exhibition booth, banners, standees, shirts, totes) | 1600×1200 | 4:3 |
| `/images/home/bento-01.svg` | Home | Portfolio bento — row 1 left (1/3) | 800×1000 | 4:5 |
| `/images/home/bento-02.svg` | Home | Portfolio bento — row 1 right (2/3) | 1280×800 | 8:5 |
| `/images/home/bento-03.svg` | Home | Portfolio bento — row 2 left (2/3) | 1280×800 | 8:5 |
| `/images/home/bento-04.svg` | Home | Portfolio bento — row 2 right (1/3) | 800×1000 | 4:5 |
| `/images/home/bento-05.svg` | Home | Portfolio bento — full-width feature cell | 1680×720 | 7:3 |
| `/images/certifications/philgeps.svg` | Home | PhilGEPS Platinum Membership seal | 320×160 | 2:1 |
| `/images/certifications/3m-mcs.svg` | Home | 3M MCS Warranty seal | 320×160 | 2:1 |
| `/images/certifications/oshc.svg` | Home | OSHC seal | 320×160 | 2:1 |
| `/images/about/hero-poster.svg` | About | Media hero — poster still for the full-bleed video | 2400×1000 | 12:5 |
| `/images/digistar/reel-01-poster.svg` | Home, About | Digistar band — left reel poster | 720×1280 | 9:16 |
| `/images/digistar/reel-02-poster.svg` | Home, About | Digistar band — right reel poster (landscape) | 1280×720 | 16:9 |
| `/images/portfolio/work-01.svg` | Portfolio | Image portfolio — gallery item 1 | 1200×900 | 4:3 |
| `/images/portfolio/work-02.svg` | Portfolio | Image portfolio — gallery item 2 | 900×1200 | 3:4 |
| `/images/portfolio/work-03.svg` | Portfolio | Image portfolio — gallery item 3 | 1600×900 | 16:9 |
| `/images/portfolio/work-04.svg` | Portfolio | Image portfolio — gallery item 4 | 1200×1200 | 1:1 |
| `/images/portfolio/work-05.svg` | Portfolio | Image portfolio — gallery item 5 | 900×1200 | 3:4 |
| `/images/portfolio/work-06.svg` | Portfolio | Image portfolio — gallery item 6 | 1600×900 | 16:9 |
| `/images/portfolio/work-07.svg` | Portfolio | Image portfolio — gallery item 7 | 1200×900 | 4:3 |
| `/images/portfolio/work-08.svg` | Portfolio | Image portfolio — gallery item 8 | 900×1200 | 3:4 |
| `/images/portfolio/work-09.svg` | Portfolio | Image portfolio — gallery item 9 | 1600×900 | 16:9 |
| `/images/portfolio/work-10.svg` | Portfolio | Image portfolio — gallery item 10 | 1200×1200 | 1:1 |
| `/images/portfolio/work-11.svg` | Portfolio | Image portfolio — gallery item 11 | 1200×900 | 4:3 |
| `/images/portfolio/work-12.svg` | Portfolio | Image portfolio — gallery item 12 | 1600×900 | 16:9 |
| `/images/portfolio/video-01-poster.svg` | Portfolio | Video portfolio — poster still 1 (landscape) | 1600×900 | 16:9 |
| `/images/portfolio/video-02-poster.svg` | Portfolio | Video portfolio — poster still 2 (portrait) | 720×1280 | 9:16 |
| `/images/portfolio/video-03-poster.svg` | Portfolio | Video portfolio — poster still 3 (landscape) | 1600×900 | 16:9 |
| `/images/portfolio/video-04-poster.svg` | Portfolio | Video portfolio — poster still 4 (portrait) | 720×1280 | 9:16 |
| `/images/portfolio/video-05-poster.svg` | Portfolio | Video portfolio — poster still 5 (landscape) | 1600×900 | 16:9 |
| `/images/portfolio/video-06-poster.svg` | Portfolio | Video portfolio — poster still 6 (portrait) | 720×1280 | 9:16 |
| `/images/clients/store-specialist.svg` | Home | Client logo — Store Specialist | 240×120 | 2:1 |
| `/images/clients/sika.svg` | Home | Client logo — Sika | 240×120 | 2:1 |
| `/images/clients/sacred-heart-ateneo.svg` | Home | Client logo — Sacred Heart | 240×120 | 2:1 |
| `/images/clients/city-savings-bank.svg` | Home | Client logo — City Savings | 240×120 | 2:1 |
| `/images/clients/treasure-island.svg` | Home | Client logo — Treasure Island | 240×120 | 2:1 |
| `/images/clients/boysen.svg` | Home | Client logo — Boysen | 240×120 | 2:1 |
| `/images/clients/rustans.svg` | Home | Client logo — Rustans | 240×120 | 2:1 |
| `/images/clients/philippine-kenko.svg` | Home | Client logo — Kenko | 240×120 | 2:1 |
| `/images/clients/llarch-construction.svg` | Home | Client logo — Llarch | 240×120 | 2:1 |
| `/images/clients/rockwell-land.svg` | Home | Client logo — Rockwell | 240×120 | 2:1 |
| `/images/clients/honda.svg` | Home | Client logo — Honda | 240×120 | 2:1 |
| `/images/clients/university-of-visayas.svg` | Home | Client logo — Univ. of Visayas | 240×120 | 2:1 |
| `/images/clients/lear.svg` | Home | Client logo — Lear | 240×120 | 2:1 |
| `/images/clients/unahco.svg` | Home | Client logo — Unahco | 240×120 | 2:1 |
| `/images/clients/tsuneishi.svg` | Home | Client logo — Tsuneishi | 240×120 | 2:1 |
| `/images/clients/jollibee.svg` | Home | Client logo — Jollibee | 240×120 | 2:1 |
| `/images/clients/cebu-landmasters.svg` | Home | Client logo — Cebu Landmasters | 240×120 | 2:1 |
| `/images/products/category-digital-displays.svg` | Products | Category card — Digital displays | 800×800 | 1:1 |
| `/images/products/category-apparel.svg` | Products | Category card — Apparel | 800×800 | 1:1 |
| `/images/products/category-signages.svg` | Products | Category card — Signages and modular displays | 800×800 | 1:1 |
| `/images/products/category-small-format.svg` | Products | Category card — Small format prints | 800×800 | 1:1 |
| `/images/products/category-large-format.svg` | Products | Category card — Large format prints | 800×800 | 1:1 |
| `/images/products/category-frames-awards.svg` | Products | Category card — Frames and awards | 800×800 | 1:1 |
| `/images/products/category-booths-carts.svg` | Products | Category card — Booths and carts | 800×800 | 1:1 |
| `/images/products/lcd-topper.svg` | Digital Products | Item card — LCD Topper | 800×800 | 1:1 |
| `/images/products/led-curve.svg` | Digital Products | Item card — LED Curve | 800×800 | 1:1 |
| `/images/products/led-fence.svg` | Digital Products | Item card — LED Fence | 800×800 | 1:1 |
| `/images/products/flight-case.svg` | Digital Products | Item card — Flight Case | 800×800 | 1:1 |
| `/images/products/led-platform.svg` | Digital Products | Item card — LED Platform | 800×800 | 1:1 |
| `/images/products/led-transparent.svg` | Digital Products | Item card — LED Transparent | 800×800 | 1:1 |
| `/images/products/led-wall-indoor-outdoor.svg` | Digital Products | Item card — LED Wall Indoor/Outdoor | 800×800 | 1:1 |
| `/images/products/led-banner-indoor-outdoor.svg` | Digital Products | Item card — LED Banner Indoor/Outdoor | 800×800 | 1:1 |
| `/images/products/polo-shirts.svg` | Apparels | Item card — Polo Shirts | 800×800 | 1:1 |
| `/images/products/t-shirts.svg` | Apparels | Item card — T-Shirts | 800×800 | 1:1 |

## Brand marks (hand-drawn stand-ins — replace with official artwork)

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
| `/images/brand/logo-30-years.svg` | All pages | Navbar + footer "30 YEARS" anniversary lockup | 172×64 | 43:16 |
| `/images/brand/digistar-wordmark.svg` | Digital Products | Digistar sub-brand wordmark above the page title | 320×84 | 80:21 |
| `/images/brand/favicon.svg` | All pages | Browser tab icon | 64×64 | 1:1 |

## Video (9 slots)

Videos cannot be placeholder-generated. Until the real files land,
`VIDEO_ASSETS_READY` in `src/content/assets.ts` stays `false` and every slot
renders its poster still instead of requesting a missing file.

| Path | Page | Slot | Placeholder size | Aspect |
| --- | --- | --- | --- | --- |
| `/video/about-hero.mp4` | About | Full-bleed media hero, muted + looping (~600px tall) | — | 12:5 |
| `/video/digistar-reel-01.mp4` | Home, About | Digistar band — left portrait reel | — | 9:16 |
| `/video/digistar-reel-02.mp4` | Home, About | Digistar band — right landscape reel | — | 16:9 |
| `/video/portfolio-01.mp4` | Portfolio | Video portfolio — landscape reel 1 | — | 16:9 |
| `/video/portfolio-02.mp4` | Portfolio | Video portfolio — portrait reel 2 | — | 9:16 |
| `/video/portfolio-03.mp4` | Portfolio | Video portfolio — landscape reel 3 | — | 16:9 |
| `/video/portfolio-04.mp4` | Portfolio | Video portfolio — portrait reel 4 | — | 9:16 |
| `/video/portfolio-05.mp4` | Portfolio | Video portfolio — landscape reel 5 | — | 16:9 |
| `/video/portfolio-06.mp4` | Portfolio | Video portfolio — portrait reel 6 | — | 9:16 |

Each video also has a poster still in the images table above.
