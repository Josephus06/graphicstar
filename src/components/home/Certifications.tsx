'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { certificationsSection } from '@/content/home';
import { cn } from '@/lib/cn';

const ITEMS = certificationsSection.items;
const LAST = ITEMS.length - 1;

/** Viewport heights of scrolling spent on each slide-to-slide transition. */
const VH_PER_SLIDE = 70;
/** Share of the pinned scroll held on the first/last slide before it releases. */
const DWELL = 0.1;
/** Extra scroll height beyond the pinned viewport, dwell included. */
const TRAVEL_VH = Math.round((LAST * VH_PER_SLIDE) / (1 - 2 * DWELL));

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Scroll-driven certification carousel. The section pins for `TRAVEL_VH` of
 * page scroll and maps that distance onto the track, so scrolling walks the
 * cards one at a time; once the last card lands, the pin releases and the page
 * carries on as normal.
 *
 * The track is written straight to the DOM inside a rAF instead of through
 * state — this runs on every scroll frame, and re-rendering three cards 60
 * times a second is wasted work. Only the active dot goes through React.
 *
 * `prefers-reduced-motion` opts out of the pin entirely and falls back to a
 * plain grid, since a hijacked scroll is exactly what that setting asks us to
 * avoid.
 */
export function Certifications() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [selected, setSelected] = useState(0);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPinned(!query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!pinned) return;

    let frame = 0;

    const render = () => {
      frame = 0;
      const wrapper = wrapperRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const first = slideRefs.current[0];
      if (!wrapper || !viewport || !track || !first) return;

      const travel = wrapper.offsetHeight - window.innerHeight;
      const raw = travel > 0 ? clamp(-wrapper.getBoundingClientRect().top / travel, 0, 1) : 0;
      // Trim the dwell zones so the first and last card each get a beat of
      // stillness at the ends of the pin.
      const progress = clamp((raw - DWELL) / (1 - 2 * DWELL), 0, 1);
      const position = progress * LAST;

      const slideWidth = first.offsetWidth;
      const offset = viewport.clientWidth / 2 - slideWidth / 2 - position * slideWidth;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const distance = Math.min(1, Math.abs(index - position));
        slide.style.opacity = `${1 - distance * 0.4}`;
        slide.style.transform = `scale(${1 - distance * 0.05})`;
      });

      setSelected(Math.round(position));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pinned]);

  // Dots scroll the page to the slice of the pin that shows that card, so the
  // page position and the visible card never disagree.
  const scrollToSlide = useCallback((index: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const travel = wrapper.offsetHeight - window.innerHeight;
    if (travel <= 0) return;
    const top = wrapper.getBoundingClientRect().top + window.scrollY;
    const share = LAST === 0 ? 0 : index / LAST;
    window.scrollTo({ top: top + (DWELL + share * (1 - 2 * DWELL)) * travel });
  }, []);

  const heading = (
    <h2 id="certifications-heading" className="sr-only">
      Licenses and certifications
    </h2>
  );

  if (!pinned) {
    return (
      <section aria-labelledby="certifications-heading" className="section-y">
        <div className="shell">
          {heading}
          <Eyebrow>{certificationsSection.eyebrow}</Eyebrow>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((cert, index) => (
              <li key={cert.id}>
                <Card cert={cert} index={index} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <div ref={wrapperRef} style={{ height: `calc(100svh + ${TRAVEL_VH}vh)` }}>
      <section
        aria-labelledby="certifications-heading"
        className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-24 sm:pt-28"
      >
        <div className="shell">
          {heading}
          <Eyebrow>{certificationsSection.eyebrow}</Eyebrow>
        </div>

        <div ref={viewportRef} className="mt-12 overflow-hidden">
          <ul ref={trackRef} className="flex will-change-transform">
            {ITEMS.map((cert, index) => (
              <li
                key={cert.id}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className="min-w-0 shrink-0 grow-0 basis-[86%] px-3 will-change-transform sm:basis-[520px] sm:px-4"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${ITEMS.length}`}
              >
                <Card cert={cert} index={index} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-2.5">
          {ITEMS.map((cert, index) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => scrollToSlide(index)}
              aria-label={`Show ${cert.caption}`}
              aria-current={selected === index}
              className={cn(
                'h-2.5 rounded-full transition-all duration-200',
                selected === index ? 'w-7 bg-orange' : 'w-2.5 bg-grey-line hover:bg-ink/30',
              )}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Seal card. The logo drifts on a long, low-amplitude loop — alternating the
 * two timings by index stops a row of seals from bobbing in lockstep.
 */
function Card({ cert, index }: { cert: (typeof ITEMS)[number]; index: number }) {
  return (
    <figure className="card-interactive flex h-[300px] flex-col items-center justify-center gap-7 rounded-media bg-white px-8 text-center shadow-card sm:h-[350px]">
      <Image
        src={cert.logo.src}
        alt={cert.logo.alt}
        width={cert.logo.width}
        height={cert.logo.height}
        loading="lazy"
        sizes="240px"
        className={cn(
          "h-auto w-[200px] sm:w-[240px]",
          index % 2 === 0 ? "float-slow" : "float-slow-alt",
        )}
      />
      <figcaption className="text-[15px] font-bold uppercase tracking-cta text-ink sm:text-[16px]">
        {cert.caption}
      </figcaption>
    </figure>
  );
}
