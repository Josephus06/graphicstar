import type { Metadata } from 'next';
import { AboutSplit } from '@/components/home/AboutSplit';
import { Certifications } from '@/components/home/Certifications';
import { ClientMarquee } from '@/components/home/ClientMarquee';
import { Hero } from '@/components/home/Hero';
import { Industries } from '@/components/home/Industries';
import { PortfolioBento } from '@/components/home/PortfolioBento';
import { ClosingCta } from '@/components/layout/ClosingCta';
import { DigistarBand } from '@/components/layout/DigistarBand';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { homeAbout } from '@/content/home';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description:
    'Large-format printing, signage, digital displays, apparel and awards from Cebu GraphicStar — serving the Visayas and Mindanao since 1996.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerStrip />
      <PortfolioBento />
      <ClientMarquee />
      <Industries />
      <Certifications />
      <AboutSplit
        eyebrow={homeAbout.eyebrow}
        welcome={homeAbout.welcome}
        brand={homeAbout.brand}
        subheadline={homeAbout.subheadline}
        paragraphs={homeAbout.paragraphs}
        link={homeAbout.link}
      />
      <DigistarBand />
      <ClosingCta />
    </>
  );
}
