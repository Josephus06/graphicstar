import { portfolioPage } from '@/content/portfolio';

/**
 * Portfolio hero. The tagline is stacked three times at falling opacity so it
 * reads as an echo receding into the page rather than three separate headings.
 *
 * Only the first line is the real `<h1>`; the repeats are `aria-hidden`, so a
 * screen reader hears the title once instead of three times.
 *
 * The entrance is CSS rather than Framer Motion for the same reason as the home
 * hero: this is the LCP element, and a JS `opacity: 0` would hold it back until
 * hydration.
 */
export function PortfolioHero() {
  const { hero } = portfolioPage;

  return (
    <section
      aria-labelledby="portfolio-heading"
      className="relative flex min-h-[55svh] flex-col justify-center overflow-hidden pb-16 pt-12 sm:pb-20"
    >
      {/* Optional soft wash behind the echo — the only gradient on the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-grey-panel via-grey-bg to-grey-bg"
      />

      <div className="shell relative z-10">
        <div className="animate-fade-up">
          <h1 id="portfolio-heading" className="display text-ink">
            {hero.headline}
          </h1>
        </div>

        {/* The echo. Decorative repeats of the line above. */}
        {[0.45, 0.2].map((opacity, index) => (
          <div
            key={opacity}
            aria-hidden="true"
            className="animate-fade-up"
            style={{ animationDelay: `${120 + index * 110}ms` }}
          >
            <p className="display text-ink" style={{ opacity }}>
              {hero.headline}
            </p>
          </div>
        ))}

        <div
          className="animate-fade-up mt-8 flex flex-col items-start gap-5 sm:mt-10 sm:flex-row sm:items-center sm:gap-7"
          style={{ animationDelay: '340ms' }}
        >
          <p className="body-copy max-w-[46ch]">{hero.subline}</p>

          {/* Ghost outline. `scroll-behavior: smooth` is set globally in
              @layer base and already respects prefers-reduced-motion. */}
          <a
            href="#portfolio-work"
            className="nudge-arrow inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-ink px-7 py-3.5 text-[12px] font-bold uppercase tracking-cta text-ink transition-[background-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-ink hover:text-white active:translate-y-0 motion-reduce:transform-none"
          >
            {hero.cta}
            <svg viewBox="0 0 20 12" width="18" height="11" fill="none" aria-hidden="true">
              <path
                d="M0 6h18M13 1l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
