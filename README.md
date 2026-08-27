# Cebu GraphicStar — website

A clean, owned rebuild of [graphicstar.ph](https://www.graphicstar.ph) in Next.js.
Thirteen routes, no CMS, all content in typed data files.

## Stack

| | |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 3 with the brand tokens in `tailwind.config.ts` |
| Motion | Framer Motion (scroll reveals) + CSS transforms (marquees) |
| Carousel | Embla Carousel |
| Fonts | Montserrat 300–800 via `next/font/google` |
| Mail | Resend, behind a Zod-validated route handler |

## Setup

```bash
npm install
cp .env.example .env.local   # optional in dev — see "Contact form" below
npm run dev                  # http://localhost:3000
```

Scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run placeholders` | Regenerates missing placeholder assets **and** `ASSETS.md` |

## Structure

```
src/
  app/                      one folder per route
    layout.tsx              fonts, metadata, navbar + footer shell
    page.tsx                /            Home
    about/                  /about
    products/               /products
    portfolio/              /portfolio
    contact/                /contact
    digital-products/       ┐
    apparels/               │
    signages-and-modular-displays/
    small-format-prints/    ├ seven category routes — each is four lines that
    large-format-prints/    │ render the shared CategoryPage template
    frames-and-awards/      │
    booths-and-carts/       ┘
    api/contact/route.ts    Zod validation + Resend
    sitemap.ts robots.ts not-found.tsx
  components/
    layout/                 Navbar, Footer, TickerStrip, DigistarBand, ClosingCta
    ui/                     Button, Reveal, Eyebrow, PageHero, AutoVideo
    brand/                  Logo
    home/ about/ products/ portfolio/ contact/
  content/                  ← all copy and asset paths live here
  lib/                      motion vocabulary, class helper, contact schema
public/images/  public/video/
```

## Where to edit content

Nothing user-facing is hardcoded in a component. Everything is in `src/content/`:

| File | Controls |
| --- | --- |
| `site.ts` | Company details, nav links, footer, **branch addresses / hours / phone numbers**, ticker phrase, closing CTA |
| `home.ts` | Hero headline, bento heading + subcopy, industries list, certifications, homepage about block |
| `about.ts` | About body paragraphs, vision, mission, core values |
| `products.ts` | The seven categories **and their item grids** — see below |
| `portfolio.ts` | Which images and videos appear on `/portfolio` |
| `contact.ts` | Form labels/placeholders, success and error copy |
| `assets.ts` | Every image and video path, with alt text and intrinsic size |

Each file is plain typed data, so swapping in a CMS later means replacing the
export with a fetch — no component needs to change.

### Adding items to a product category

Six categories ship with an empty `items: []` array and a comment naming the
source page to fill them from. To populate one, open `src/content/products.ts`:

```ts
items: [
  item('Roll-Up Banner', 'roll-up-banner'),   // label, photo slug
],
```

Then add `/public/images/products/roll-up-banner.svg` (or `.jpg` — update the
`src` in `assets.ts`). A category with no items renders a quote CTA instead of
an empty grid, so the page is never broken while you fill it in.

### Contact form

`/api/contact` validates with the same Zod schema the browser uses
(`src/lib/contact-schema.ts`), so client and server can never drift.

- **No `RESEND_API_KEY`** → the enquiry is logged to the server console and the
  form reports success. This is the dev stub; nothing is sent.
- **With a key** → sent via Resend to `CONTACT_TO_EMAIL`, with the sender's
  address set as `reply-to`.

A hidden honeypot field (`company`) is accepted silently when filled, so bots
get no failure signal.

## Assets

No image or video is hot-linked from graphicstar.ph. Every asset is declared in
`src/content/assets.ts` and lives under `/public`.

`npm run placeholders` writes a solid-colour SVG at the correct aspect ratio for
every slot that does not have a file yet, and regenerates `ASSETS.md`. It never
overwrites an existing file unless you pass `--force`, so you can drop real
assets in and re-run it safely.

**Video** cannot be placeholder-generated. `VIDEO_ASSETS_READY` in `assets.ts`
is `false`, so every video slot renders its poster still instead of requesting a
missing file. Drop the `.mp4` files listed in `ASSETS.md` into `/public/video`
and flip that flag to `true`.

Once real raster photography replaces the SVG placeholders you can delete the
`images` block in `next.config.mjs` — it only exists to let the optimizer serve
SVGs.

## Design tokens

Defined once in `tailwind.config.ts` and used as Tailwind classes throughout:

| Token | Value | Used for |
| --- | --- | --- |
| `ink` | `#151515` | Body and heading text |
| `blue` / `blue-deep` | `#0500FF` / `#0B10A0` | Primary accent, links |
| `orange` | `#ED7504` | CTAs, checkmarks, "Creations" |
| `magenta` | `#BA006D` | Digistar sub-brand |
| `navy` | `#232536` | Dark surfaces |
| `grey-bg` / `grey-line` | `#EFEFEF` / `#DDDDDD` | Page background, hairlines |

Reusable type and layout classes live in `src/app/globals.css`: `.shell`,
`.section-y`, `.display`, `.page-title`, `.section-title`, `.eyebrow`,
`.body-copy`, `.marquee-track`.

Breakpoints are `xs 480 / sm 768 / md 1024 / lg 1280 / xl 1440`. Note that these
are shifted from Tailwind's defaults to match the design spec — `md:` here means
1024px, not 768px.

## Accessibility & motion

- One `<h1>` per page; section labels use `.eyebrow` (a `<p>`) so heading
  outlines stay clean, with an `sr-only` `<h2>` where a section needs a name.
- Navbar overlay and the portfolio lightbox both trap focus, close on Escape and
  restore focus to their trigger. The lightbox also moves with ← / →.
- Every animation is disabled under `prefers-reduced-motion: reduce` —
  `MotionConfig reducedMotion="user"` covers Framer Motion, and a media query in
  `globals.css` covers the CSS marquees and transitions.
- All media carries explicit `width`/`height` or `aspect-ratio`, so there is no
  layout shift while assets load.
