'use client';

import { useRef, useState } from 'react';
import { ImagePortfolio } from '@/components/portfolio/ImagePortfolio';
import { VideoPortfolio } from '@/components/portfolio/VideoPortfolio';
import type { PortfolioImage, PortfolioVideo } from '@/content/assets';
import { cn } from '@/lib/cn';

type TabId = 'image' | 'video';

const TABS: { id: TabId; label: string }[] = [
  { id: 'image', label: 'Image Portfolio' },
  { id: 'video', label: 'Video Portfolio' },
];

/**
 * Image / Video switch over the portfolio grid, following the WAI-ARIA tabs
 * pattern: roving tabindex, arrow-key and Home/End navigation, and only the
 * active tab in the tab order.
 *
 * The underline is a single absolutely-positioned bar translated between the
 * two halves rather than a border on each tab, so the movement is one
 * compositor-friendly transform instead of a paint on both tabs.
 *
 * Both panels stay mounted and the inactive one is hidden with `hidden`, which
 * keeps the video elements' buffered data and the lightbox's state alive across
 * a switch. `hidden` also removes it from the a11y tree, so nothing offscreen is
 * announced or focusable.
 */
export function PortfolioTabs({
  images,
  videos,
}: {
  images: PortfolioImage[];
  videos: PortfolioVideo[];
}) {
  const [active, setActive] = useState<TabId>('image');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = TABS.findIndex((tab) => tab.id === active);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1;
    else if (event.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="portfolio-work-heading" id="portfolio-work" className="scroll-mt-28">
      <h2 id="portfolio-work-heading" className="sr-only">
        Selected work
      </h2>

      <div className="shell">
        <div
          role="tablist"
          aria-label="Portfolio type"
          onKeyDown={onKeyDown}
          className="relative mx-auto grid max-w-[520px] grid-cols-2 border-b border-grey-line"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={cn(
                'px-4 py-4 text-[12px] font-bold uppercase tracking-cta transition-colors duration-200 sm:text-[13px]',
                active === tab.id ? 'text-orange' : 'text-ink/55 hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding underline. One transform, not a border swap. */}
          <span
            aria-hidden="true"
            className="absolute bottom-[-1px] left-0 h-[2px] w-1/2 bg-orange transition-transform duration-[350ms] ease-out motion-reduce:transition-none"
            style={{ transform: `translate3d(${activeIndex * 100}%, 0, 0)` }}
          />
        </div>
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
          hidden={active !== tab.id}
          /* `animate-fade-up` replays on each switch because the panel is
             keyed by its active state, giving the fade+lift on filter change. */
          className={cn(active === tab.id && 'animate-fade-up')}
        >
          {tab.id === 'image' ? (
            <ImagePortfolio images={images} />
          ) : (
            <VideoPortfolio videos={videos} />
          )}
        </div>
      ))}
    </section>
  );
}
