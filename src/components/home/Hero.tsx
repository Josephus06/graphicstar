import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import { homeAssets } from '@/content/assets';
import { homeHero } from '@/content/home';

/**
 * Full-height hero. The showcase render carries its own soft grey backdrop and
 * is baked in opaque, so it is laid in full-bleed and cropped with `object-cover`
 * rather than letterboxed — `object-contain` would expose the render's backdrop
 * as a visible rectangle against the page's lighter `grey-bg`.
 *
 * The entrance is CSS, not Framer Motion, and this stays a server component:
 * the headline is the LCP element, so it must paint from the SSR HTML rather
 * than waiting for hydration to lift it out of `opacity: 0`.
 */
export function Hero() {
  const { hero } = homeAssets;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-grey-bg pb-[8vh] pt-32 sm:pb-[10vh]"
    >
      <div className="animate-hero-settle absolute inset-0 origin-right">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          /* Narrow viewports crop hard, so bias the focal point right to keep
             the booth in frame; desktop shows the render close to full width. */
          className="object-cover object-[72%_center] sm:object-center"
        />
      </div>

      {/* Softens the render behind the headline so the type stays legible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-grey-bg via-grey-bg/55 to-transparent sm:bg-gradient-to-r sm:via-grey-bg/40"
      />

      <div className="shell-hero relative z-10">
        <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <Link
            href={homeHero.chip.href}
            className="inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-5 pr-4 shadow-pill transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="text-[11px] font-bold uppercase tracking-eyebrow text-ink">
              {homeHero.chip.label}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-grey-line" />
            <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-eyebrow text-ink/70">
              {homeHero.chip.action}
              <Arrow className="w-4" />
            </span>
          </Link>
        </div>

        <h1 id="hero-heading" className="display mt-6 sm:mt-8">
          {homeHero.headline.map((part, index) => (
            <span key={part.text} className="block overflow-hidden">
              <span
                className={`animate-rise block ${part.tone === 'orange' ? 'text-orange' : 'text-blue'}`}
                style={{ animationDelay: `${250 + index * 120}ms` }}
              >
                {part.text}
              </span>
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
}
