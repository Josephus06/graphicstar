/**
 * Design Online: product model and pricing. Pure functions, shared by the
 * browser (live price) and the server (the price that is actually quoted).
 *
 * Price per item =
 *   max(minimum, (area_sqft × Σ perSqft + Σ perItem) × Π multiplier)
 * then the best matching quantity discount is applied to the whole line.
 */

export type Unit = 'in' | 'ft';

export type Choice = {
  key: string;
  label: string;
  /** ₱ per square foot of the chosen size. */
  perSqft?: number;
  /** ₱ per piece, regardless of size. */
  perItem?: number;
  /** Multiplies the item price, e.g. 1.6 for double-sided. */
  multiplier?: number;
  /** Optional preview hint: draws a stand under the sign. */
  mockup?: 'none' | 'post' | 'hstake' | 'grommets' | 'standoffs';
};

export type OptionGroup = {
  key: string;
  label: string;
  /** "buttons" for 2–3 short choices (like Sides), "select" otherwise. */
  display: 'buttons' | 'select';
  choices: Choice[];
};

export type QtyBreak = { min: number; discountPct: number };

export type ProductConfig = {
  unit: Unit;
  sizes: { w: number; h: number }[];
  allowCustomSize: boolean;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  groups: OptionGroup[];
  qtyBreaks: QtyBreak[];
  /** Lowest price for one piece. */
  minimumPerItem: number;
  /** Starter templates offered in the editor. */
  templates: TemplateKey[];
};

export type DesignProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  sort: number;
  config: ProductConfig;
};

export type Selection = {
  w: number;
  h: number;
  qty: number;
  options: Record<string, string>;
};

export type PriceBreakdown = {
  areaSqft: number;
  perItem: number;
  discountPct: number;
  total: number;
  undiscountedTotal: number;
  /** Choice labels in group order, for summaries. */
  lines: { group: string; choice: string }[];
  error?: string;
};

export const MAX_QTY = 10_000;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const areaSqft = (w: number, h: number, unit: Unit) => (unit === 'ft' ? w * h : (w * h) / 144);

export const sizeLabel = (w: number, h: number, unit: Unit) =>
  unit === 'ft' ? `${w} ft × ${h} ft` : `${w}" × ${h}"`;

export function validateSize(config: ProductConfig, w: number, h: number): string | null {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return 'Enter a width and height.';
  const preset = config.sizes.some((s) => s.w === w && s.h === h);
  if (preset) return null;
  if (!config.allowCustomSize) return 'Choose one of the listed sizes.';
  const u = config.unit === 'ft' ? ' ft' : '"';
  if (w < config.minW || w > config.maxW) return `Width must be between ${config.minW}${u} and ${config.maxW}${u}.`;
  if (h < config.minH || h > config.maxH) return `Height must be between ${config.minH}${u} and ${config.maxH}${u}.`;
  return null;
}

export function priceFor(config: ProductConfig, sel: Selection): PriceBreakdown {
  const area = areaSqft(sel.w, sel.h, config.unit);
  const empty: PriceBreakdown = { areaSqft: area, perItem: 0, discountPct: 0, total: 0, undiscountedTotal: 0, lines: [] };

  const sizeError = validateSize(config, sel.w, sel.h);
  if (sizeError) return { ...empty, error: sizeError };
  const qty = Math.floor(sel.qty);
  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) return { ...empty, error: `Quantity must be 1 to ${MAX_QTY}.` };

  let perSqft = 0;
  let perPiece = 0;
  let multiplier = 1;
  const lines: PriceBreakdown['lines'] = [];
  for (const group of config.groups) {
    const choice = group.choices.find((c) => c.key === sel.options[group.key]) ?? group.choices[0];
    if (!choice) continue;
    perSqft += choice.perSqft ?? 0;
    perPiece += choice.perItem ?? 0;
    multiplier *= choice.multiplier && choice.multiplier > 0 ? choice.multiplier : 1;
    lines.push({ group: group.label, choice: choice.label });
  }

  const perItem = round2(Math.max(config.minimumPerItem, (area * perSqft + perPiece) * multiplier));
  const discountPct = config.qtyBreaks.filter((b) => qty >= b.min).reduce((best, b) => Math.max(best, b.discountPct), 0);
  const undiscountedTotal = round2(perItem * qty);
  const total = round2(undiscountedTotal * (1 - discountPct / 100));
  return { areaSqft: area, perItem, discountPct, total, undiscountedTotal, lines };
}

/** The selection with every group set to a valid choice (first choice by default). */
export function normaliseOptions(config: ProductConfig, options: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const g of config.groups) {
    out[g.key] = g.choices.some((c) => c.key === options[g.key]) ? options[g.key] : (g.choices[0]?.key ?? '');
  }
  return out;
}

export const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------- templates

export type TemplateKey = 'for-sale' | 'headline' | 'banner' | 'logo-center';

export type TemplateFields = {
  headline: string;
  subline: string;
  contact: string;
  footer: string;
  primary: string;
  accent: string;
  text: string;
  background: string;
};

export const TEMPLATES: Record<TemplateKey, { label: string; defaults: TemplateFields }> = {
  'for-sale': {
    label: 'For sale / for rent',
    defaults: {
      headline: 'HOUSE FOR SALE',
      subline: '(032) 238-1234',
      contact: 'agent@yourcompany.com',
      footer: 'YOUR REALTY',
      primary: '#0500FF',
      accent: '#BA006D',
      text: '#151515',
      background: '#FFFFFF',
    },
  },
  headline: {
    label: 'Headline + details',
    defaults: {
      headline: 'GRAND OPENING',
      subline: 'This Saturday, 10 AM',
      contact: 'www.yourbusiness.com',
      footer: '',
      primary: '#ED7504',
      accent: '#151515',
      text: '#151515',
      background: '#FFFFFF',
    },
  },
  banner: {
    label: 'Wide banner',
    defaults: {
      headline: 'NOW OPEN',
      subline: 'Visit us at our new branch',
      contact: '0917 000 0000',
      footer: '',
      primary: '#0500FF',
      accent: '#ED7504',
      text: '#FFFFFF',
      background: '#0500FF',
    },
  },
  'logo-center': {
    label: 'Logo + tagline',
    defaults: {
      headline: 'YOUR BRAND',
      subline: 'Your tagline here',
      contact: '',
      footer: '',
      primary: '#151515',
      accent: '#ED7504',
      text: '#151515',
      background: '#FFFFFF',
    },
  },
};

// ---------------------------------------------------------------- starter products

const c = (key: string, label: string, extra: Omit<Choice, 'key' | 'label'> = {}): Choice => ({ key, label, ...extra });

const baseConfig = (overrides: Partial<ProductConfig>): ProductConfig => ({
  unit: 'in',
  sizes: [],
  allowCustomSize: true,
  minW: 6,
  maxW: 96,
  minH: 6,
  maxH: 96,
  groups: [],
  qtyBreaks: [
    { min: 5, discountPct: 5 },
    { min: 10, discountPct: 10 },
    { min: 25, discountPct: 15 },
  ],
  minimumPerItem: 150,
  templates: ['headline', 'logo-center'],
  ...overrides,
});

/**
 * Seeded once, inactive, with PLACEHOLDER prices: an admin sets real prices on
 * Admin → Designer and switches each product on.
 */
export const STARTER_PRODUCTS: Omit<DesignProduct, 'id'>[] = [
  {
    slug: 'real-estate-panels',
    name: 'Real Estate Panels',
    description: 'Rigid aluminum or coroplast panels for property listings, with optional posts and stakes.',
    active: false,
    sort: 1,
    config: baseConfig({
      sizes: [
        { w: 18, h: 12 },
        { w: 24, h: 18 },
        { w: 36, h: 24 },
        { w: 48, h: 36 },
      ],
      maxW: 48,
      maxH: 48,
      templates: ['for-sale', 'headline', 'logo-center'],
      minimumPerItem: 350,
      groups: [
        {
          key: 'material',
          label: 'Material',
          display: 'select',
          choices: [
            c('alu-063', 'Aluminum .063', { perSqft: 260 }),
            c('alu-040', 'Aluminum .040', { perSqft: 210 }),
            c('coroplast-4mm', 'Coroplast 4mm', { perSqft: 120 }),
          ],
        },
        {
          key: 'sides',
          label: 'Sides',
          display: 'buttons',
          choices: [c('single', 'Single Sided'), c('double', 'Double Sided', { multiplier: 1.6 })],
        },
        {
          key: 'coating',
          label: 'Protective Coating',
          display: 'select',
          choices: [
            c('none', 'No coating'),
            c('gloss', 'Protective Glossy Coating', { perSqft: 40 }),
            c('matte', 'Protective Matte Coating', { perSqft: 40 }),
          ],
        },
        {
          key: 'frame',
          label: 'Frames & Posts',
          display: 'select',
          choices: [
            c('none', 'No frame / post', { mockup: 'none' }),
            c('hstake', 'H-Stake (wire)', { perItem: 180, mockup: 'hstake' }),
            c('colonial-black', 'Aluminum Colonial Post - Black', { perItem: 1800, mockup: 'post' }),
            c('colonial-white', 'Aluminum Colonial Post - White', { perItem: 1800, mockup: 'post' }),
          ],
        },
        {
          key: 'holes',
          label: 'Holes & Grommets',
          display: 'select',
          choices: [
            c('none', 'No holes', { mockup: 'none' }),
            c('top-bottom', 'Hanging Grommets (Top & Bottom)', { perItem: 60, mockup: 'grommets' }),
          ],
        },
      ],
    }),
  },
  {
    slug: 'tarpaulin-banners',
    name: 'Tarpaulin Banners',
    description: 'Full-colour tarpaulin for events, storefronts and promotions, hemmed with grommets.',
    active: false,
    sort: 2,
    config: baseConfig({
      unit: 'ft',
      sizes: [
        { w: 3, h: 2 },
        { w: 4, h: 3 },
        { w: 6, h: 3 },
        { w: 8, h: 4 },
        { w: 10, h: 5 },
      ],
      minW: 1,
      maxW: 40,
      minH: 1,
      maxH: 20,
      templates: ['banner', 'headline', 'logo-center'],
      minimumPerItem: 120,
      groups: [
        {
          key: 'material',
          label: 'Material',
          display: 'select',
          choices: [c('tarp-10oz', 'Tarpaulin 10oz', { perSqft: 18 }), c('tarp-13oz', 'Tarpaulin 13oz', { perSqft: 24 })],
        },
        {
          key: 'finishing',
          label: 'Finishing',
          display: 'select',
          choices: [
            c('cut', 'Cut only', { mockup: 'none' }),
            c('eyelets', 'Hemmed with eyelets', { perSqft: 3, mockup: 'grommets' }),
          ],
        },
      ],
    }),
  },
  {
    slug: 'acrylic-signs',
    name: 'Acrylic Signs',
    description: 'Clear or white acrylic signage with printed artwork, for lobbies and offices.',
    active: false,
    sort: 3,
    config: baseConfig({
      sizes: [
        { w: 12, h: 8 },
        { w: 18, h: 12 },
        { w: 24, h: 16 },
        { w: 36, h: 24 },
      ],
      maxW: 48,
      maxH: 48,
      minimumPerItem: 500,
      groups: [
        {
          key: 'material',
          label: 'Material',
          display: 'select',
          choices: [c('acrylic-3', 'Acrylic 3mm', { perSqft: 380 }), c('acrylic-5', 'Acrylic 5mm', { perSqft: 520 })],
        },
        {
          key: 'mounting',
          label: 'Mounting',
          display: 'select',
          choices: [
            c('none', 'No mounting', { mockup: 'none' }),
            c('standoffs', 'Stainless standoffs (4)', { perItem: 450, mockup: 'standoffs' }),
          ],
        },
      ],
    }),
  },
  {
    slug: 'pvc-signs',
    name: 'PVC (Sintra) Signs',
    description: 'Lightweight rigid PVC board signs for indoor displays and wayfinding.',
    active: false,
    sort: 4,
    config: baseConfig({
      sizes: [
        { w: 12, h: 8 },
        { w: 18, h: 12 },
        { w: 24, h: 18 },
        { w: 36, h: 24 },
      ],
      minimumPerItem: 250,
      groups: [
        {
          key: 'material',
          label: 'Material',
          display: 'select',
          choices: [c('pvc-3', 'PVC 3mm', { perSqft: 150 }), c('pvc-5', 'PVC 5mm', { perSqft: 200 })],
        },
        {
          key: 'sides',
          label: 'Sides',
          display: 'buttons',
          choices: [c('single', 'Single Sided'), c('double', 'Double Sided', { multiplier: 1.6 })],
        },
      ],
    }),
  },
  {
    slug: 'stickers',
    name: 'Stickers & Decals',
    description: 'Printed vinyl stickers and decals, laminated and cut to shape.',
    active: false,
    sort: 5,
    config: baseConfig({
      sizes: [
        { w: 3, h: 3 },
        { w: 4, h: 4 },
        { w: 6, h: 4 },
        { w: 12, h: 12 },
      ],
      minW: 1,
      minH: 1,
      maxW: 48,
      maxH: 48,
      minimumPerItem: 25,
      qtyBreaks: [
        { min: 50, discountPct: 10 },
        { min: 100, discountPct: 20 },
        { min: 500, discountPct: 30 },
      ],
      groups: [
        {
          key: 'material',
          label: 'Material',
          display: 'select',
          choices: [
            c('vinyl-gloss', 'Glossy vinyl', { perSqft: 90 }),
            c('vinyl-matte', 'Matte vinyl', { perSqft: 90 }),
            c('vinyl-clear', 'Clear vinyl', { perSqft: 110 }),
          ],
        },
        {
          key: 'lamination',
          label: 'Lamination',
          display: 'buttons',
          choices: [c('none', 'None'), c('laminated', 'Laminated', { perSqft: 30 })],
        },
        {
          key: 'cut',
          label: 'Cut',
          display: 'select',
          choices: [c('square', 'Square cut'), c('die-cut', 'Kiss / die cut to shape', { perItem: 5 })],
        },
      ],
    }),
  },
];
