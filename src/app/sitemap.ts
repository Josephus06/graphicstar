import type { MetadataRoute } from 'next';
import { productCategories } from '@/content/products';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const primary = [
    { path: '/', priority: 1 },
    { path: '/about', priority: 0.8 },
    { path: '/products', priority: 0.9 },
    { path: '/portfolio', priority: 0.8 },
    { path: '/contact', priority: 0.8 },
  ];

  return [
    ...primary.map(({ path, priority }) => ({
      url: new URL(path, site.url).toString(),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority,
    })),
    ...productCategories.map((category) => ({
      url: new URL(`/${category.slug}`, site.url).toString(),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
