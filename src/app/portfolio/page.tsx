import type { Metadata } from 'next';
import { ClosingCta } from '@/components/layout/ClosingCta';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { ImagePortfolio } from '@/components/portfolio/ImagePortfolio';
import { VideoPortfolio } from '@/components/portfolio/VideoPortfolio';
import { PageHero } from '@/components/ui/PageHero';
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
      <PageHero title={portfolioPage.title} />
      <ImagePortfolio
        eyebrow={portfolioPage.imageSection.eyebrow}
        images={[...portfolioPage.imageSection.images]}
      />
      <VideoPortfolio
        eyebrow={portfolioPage.videoSection.eyebrow}
        videos={[...portfolioPage.videoSection.videos]}
      />
      <ClosingCta />
    </>
  );
}
