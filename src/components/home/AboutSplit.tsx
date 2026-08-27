import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';

type AboutSplitProps = {
  eyebrow: string;
  welcome: string;
  brand: string;
  subheadline: string;
  paragraphs: readonly string[];
  link?: { label: string; href: string };
  /** `h1` on /about, where this is the page's only top-level heading. */
  headingLevel?: 'h1' | 'h2';
  id?: string;
};

/**
 * Two-column about split — "Welcome to / Cebu GraphicStar" on the left, the
 * light sub-headline and justified body on the right. Shared by the homepage
 * (one paragraph) and the About page (the full story).
 */
export function AboutSplit({
  eyebrow,
  welcome,
  brand,
  subheadline,
  paragraphs,
  link,
  headingLevel = 'h2',
  id = 'about-heading',
}: AboutSplitProps) {
  const Heading = headingLevel;

  return (
    <section aria-labelledby={id} className="section-y">
      <div className="shell">
        <Reveal>
          <Eyebrow align="left">{eyebrow}</Eyebrow>
        </Reveal>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <Heading
              id={id}
              className="text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-tightest"
            >
              <span className="block text-ink">{welcome}</span>
              <span className="block text-blue">{brand}</span>
            </Heading>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-[clamp(26px,3.4vw,44px)] font-light leading-[1.15] tracking-tightest text-ink">
              {subheadline}
            </p>

            <div className="mt-8 space-y-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="body-copy text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {link ? (
              <Link
                href={link.href}
                className="group mt-8 inline-flex items-center gap-3 rounded-sm text-[15px] font-semibold text-blue transition-colors duration-150 hover:text-blue-deep"
              >
                {link.label}
                <Arrow className="transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none" />
              </Link>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
