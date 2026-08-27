import type { Metadata } from 'next';
import { ClosingCta } from '@/components/layout/ClosingCta';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { ProductGrid } from '@/components/products/ProductGrid';
import { PageHero } from '@/components/ui/PageHero';
import { productCategories, productsPage } from '@/content/products';

export const metadata: Metadata = {
  title: productsPage.title,
  description: productsPage.description,
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  const cells = productCategories.map((category) => ({
    label: category.label,
    photo: category.photo,
    href: `/${category.slug}`,
  }));

  return (
    <>
      <div className="pt-24 sm:pt-28">
        <TickerStrip />
      </div>
      <PageHero title={productsPage.title} />
      <section aria-labelledby="page-heading">
        <ProductGrid cells={cells} ariaLabel="Product categories" />
      </section>
      <ClosingCta />
    </>
  );
}
