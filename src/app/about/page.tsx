import type { Metadata } from 'next';
import { CoreValues } from '@/components/about/CoreValues';
import { MediaHero } from '@/components/about/MediaHero';
import { StatementBlock } from '@/components/about/StatementBlock';
import { AboutSplit } from '@/components/home/AboutSplit';
import { DigistarBand } from '@/components/layout/DigistarBand';
import { TickerStrip } from '@/components/layout/TickerStrip';
import { aboutBody, mission, vision } from '@/content/about';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Cebu GraphicStar is a visual solutions provider serving the Visayas and Mindanao since 1996 — read our story, vision, mission and core values.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <MediaHero />
      <TickerStrip />
      <AboutSplit
        headingLevel="h1"
        id="about-page-heading"
        eyebrow={aboutBody.eyebrow}
        welcome={aboutBody.welcome}
        brand={aboutBody.brand}
        subheadline={aboutBody.subheadline}
        paragraphs={aboutBody.paragraphs}
      />
      <StatementBlock id="vision-heading" label={vision.label} statement={vision.statement} />
      <StatementBlock id="mission-heading" label={mission.label} statement={mission.statement} />
      <CoreValues />
      <DigistarBand />
    </>
  );
}
