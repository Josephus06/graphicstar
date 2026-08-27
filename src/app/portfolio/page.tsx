import type { Metadata } from 'next';
import { ClientMarquee } from '@/components/home/ClientMarquee';
import { ClosingCta } from '@/components/layout/ClosingCta';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { PortfolioHero } from '@/components/portfolio/PortfolioHero';
import { PortfolioTabs } from '@/components/portfolio/PortfolioTabs';
import { portfolioPage } from '@/content/portfolio';

export const metadata: Metadata = {
  title: portfolioPage.title,
  description: portfolioPage.description,
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  return (
    <>
      <div className="pt-24 sm:pt-28">
        <TickerStrip />
      </div>

      <PortfolioHero />

      <PortfolioTabs
        images={[...portfolioPage.imageSection.images]}
        videos={[...portfolioPage.videoSection.videos]}
      />

      {/* Logo strip and CTA band are the shared home-page components, so the
          page picks up any change to them for free. */}
      <ClientMarquee />
      <ClosingCta />
    </>
  );
}
