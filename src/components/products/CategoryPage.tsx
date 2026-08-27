import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClosingCta } from '@/components/layout/ClosingCta';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { brandAssets } from '@/content/assets';
import { getCategory } from '@/content/products';

/** Per-route metadata, built from the same config the page renders. */
export function categoryMetadata(slug: string): Metadata {
  const category = getCategory(slug);
  if (!category) return {};

  return {
    title: category.title,
    description: category.metaDescription,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${category.title} — Cebu GraphicStar`,
      description: category.metaDescription,
      url: `/${slug}`,
    },
  };
}

/**
 * One template for all seven product category routes. Everything that varies
 * lives in `productCategories` in `src/content/products.ts`.
 */
export function CategoryPage({ slug }: { slug: string }) {
  const category = getCategory(slug);
  if (!category) notFound();

  const isDigistar = category.theme === 'digistar';
  const wordmark = brandAssets.digistarWordmark;

  return (
    <>
      <div className="pt-24 sm:pt-28">
        <TickerStrip />
      </div>

      <PageHero
        title={category.title}
        above={
          isDigistar ? (
            <Image
              src={wordmark.src}
              alt={wordmark.alt}
              width={wordmark.width}
              height={wordmark.height}
              priority
              sizes="280px"
              className="h-auto w-[220px] sm:w-[280px]"
            />
          ) : undefined
        }
        below={
          <ButtonLink
            href="/products"
            variant={isDigistar ? 'outline-magenta' : 'outline'}
            size="md"
          >
            Back
          </ButtonLink>
        }
      />

      <section aria-labelledby="page-heading">
        {category.items.length > 0 ? (
          <ProductGrid cells={category.items} ariaLabel={`${category.title} items`} />
        ) : (
          <Reveal className="shell pb-6 text-center">
            <p className="body-copy mx-auto max-w-prose">
              We produce a wide range of {category.title.toLowerCase()} to order. Tell us what you
              need — sizes, materials, quantities — and our team will put together a quote and
              samples for you.
            </p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/contact" size="lg">
                Request a Quote
              </ButtonLink>
            </div>
          </Reveal>
        )}
      </section>

      <ClosingCta />
    </>
  );
}
