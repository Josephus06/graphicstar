import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { TickerStrip } from '@/components/layout/TickerStrip';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <div className="pt-24 sm:pt-28">
        <TickerStrip />
      </div>
      <section className="shell flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="page-title mt-6">Page not found</h1>
        <p className="body-copy mt-6 max-w-prose">
          The page you are looking for has moved or no longer exists. Try our products, or get in
          touch and we will point you the right way.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" size="lg">
            Browse Products
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Back Home
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
