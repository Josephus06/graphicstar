/**
 * Product taxonomy.
 *
 * `productCategories` drives both the `/products` grid and the seven category
 * routes — every category page is the same component reading the config below.
 *
 * To add items to a category, fill in its `items` array. Each item needs a
 * `label` and a `photo`; add a matching placeholder with `npm run placeholders`
 * (or drop the real photo into /public/images/products/).
 */

import { productPhoto, type ImageAsset } from './assets';

export type ProductItem = {
  label: string;
  photo: ImageAsset;
};

export type CategoryTheme = 'default' | 'digistar';

export type ProductCategory = {
  /** Route slug — the page lives at `/${slug}`. */
  slug: string;
  /** Uppercase label used on the /products grid. */
  label: string;
  /** Title shown on the category page itself. */
  title: string;
  /** Photo shown on the /products grid card. */
  photo: ImageAsset;
  /** Colours the sub-brand wordmark and the BACK button. */
  theme: CategoryTheme;
  metaDescription: string;
  items: ProductItem[];
};

const item = (label: string, slug: string): ProductItem => ({
  label,
  photo: productPhoto(slug, label),
});

export const productCategories: ProductCategory[] = [
  {
    slug: 'digital-products',
    label: 'Digital Displays',
    title: 'Digital Products',
    photo: productPhoto('category-digital-displays', 'Digital displays'),
    theme: 'digistar',
    metaDescription:
      'Digistar by Cebu GraphicStar — LED walls, transparent displays, LED fences, platforms and banners for indoor and outdoor use.',
    // Source: https://www.graphicstar.ph/digital-products
    items: [
      item('LCD Topper', 'lcd-topper'),
      item('LED Curve', 'led-curve'),
      item('LED Fence', 'led-fence'),
      item('Flight Case', 'flight-case'),
      item('LED Platform', 'led-platform'),
      item('LED Transparent', 'led-transparent'),
      item('LED Wall Indoor/Outdoor', 'led-wall-indoor-outdoor'),
      item('LED Banner Indoor/Outdoor', 'led-banner-indoor-outdoor'),
    ],
  },
  {
    slug: 'apparels',
    label: 'Apparel',
    title: 'Apparels',
    photo: productPhoto('category-apparel', 'Apparel'),
    theme: 'default',
    metaDescription:
      'Custom apparel from Cebu GraphicStar — printed and embroidered shirts, uniforms, jerseys and corporate giveaways.',
    // Source: https://www.graphicstar.ph/apparels
    items: [item('Polo Shirts', 'polo-shirts'), item('T-Shirts', 't-shirts')],
  },
  {
    slug: 'signages-and-modular-displays',
    label: 'Signages and Modular Displays',
    title: 'Signages and Modular Displays',
    photo: productPhoto('category-signages', 'Signages and modular displays'),
    theme: 'default',
    metaDescription:
      'Signages and modular displays from Cebu GraphicStar — build-up letters, light boxes, pylons and reusable exhibition systems.',
    // TODO — fill from https://www.graphicstar.ph/signages-and-modular-displays
    items: [],
  },
  {
    slug: 'small-format-prints',
    label: 'Small Format Prints',
    title: 'Small Format Prints',
    photo: productPhoto('category-small-format', 'Small format prints'),
    theme: 'default',
    metaDescription:
      'Small format printing from Cebu GraphicStar — business cards, brochures, stickers, packaging and marketing collateral.',
    // TODO — fill from https://www.graphicstar.ph/small-format-prints
    items: [],
  },
  {
    slug: 'large-format-prints',
    label: 'Large Format Prints',
    title: 'Large Format Prints',
    photo: productPhoto('category-large-format', 'Large format prints'),
    theme: 'default',
    metaDescription:
      'Large format printing from Cebu GraphicStar — tarpaulins, banners, wall murals, vehicle wraps and backdrops.',
    // TODO — fill from https://www.graphicstar.ph/large-format-prints
    items: [],
  },
  {
    slug: 'frames-and-awards',
    label: 'Frames and Awards',
    title: 'Frames and Awards',
    photo: productPhoto('category-frames-awards', 'Frames and awards'),
    theme: 'default',
    metaDescription:
      'Frames and awards from Cebu GraphicStar — acrylic and wood trophies, plaques, certificates and custom framing.',
    // TODO — fill from https://www.graphicstar.ph/frames-and-awards
    items: [],
  },
  {
    slug: 'booths-and-carts',
    label: 'Booths and Carts',
    title: 'Booths and Carts',
    photo: productPhoto('category-booths-carts', 'Booths and carts'),
    theme: 'default',
    metaDescription:
      'Booths and carts from Cebu GraphicStar — mall kiosks, activation booths, retail carts and portable stands.',
    // TODO — fill from https://www.graphicstar.ph/booths-and-carts
    items: [],
  },
];

export const getCategory = (slug: string): ProductCategory | undefined =>
  productCategories.find((category) => category.slug === slug);

export const productsPage = {
  title: 'Products',
  description:
    'Explore the full range of Cebu GraphicStar creations — from digital displays and signage to apparel, awards and large-format print.',
} as const;
