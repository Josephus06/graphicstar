import type { ReactNode } from 'react';

/**
 * Inner-page hero: generous space, a centred light-weight title, and optional
 * slots above (a sub-brand wordmark) and below (a BACK button).
 *
 * The entrance is CSS rather than Framer Motion, and this stays a server
 * component — the title is each inner page's LCP element, so it has to paint
 * straight from the SSR HTML instead of waiting on hydration.
 */
export function PageHero({
  title,
  id = 'page-heading',
  above,
  below,
}: {
  title: string;
  id?: string;
  above?: ReactNode;
  below?: ReactNode;
}) {
  return (
    <section className="pb-16 pt-20 sm:pb-20 sm:pt-24 md:pb-24 md:pt-28">
      <div className="shell flex flex-col items-center text-center">
        {above ? <div className="animate-fade-up mb-8">{above}</div> : null}

        <h1
          id={id}
          className="page-title animate-fade-up"
          style={above ? { animationDelay: '80ms' } : undefined}
        >
          {title}
        </h1>

        {below ? (
          <div className="animate-fade-up mt-10" style={{ animationDelay: '160ms' }}>
            {below}
          </div>
        ) : null}
      </div>
    </section>
  );
}
