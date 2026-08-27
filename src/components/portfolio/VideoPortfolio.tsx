'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { VIDEO_ASSETS_READY, type PortfolioVideo } from '@/content/assets';
import { cn } from '@/lib/cn';

/**
 * Video portfolio.
 *
 * Landscape and portrait reels have opposite aspects, so a uniform grid wastes
 * a lot of space on one or the other. Instead the landscape clips stack in a
 * single column and each portrait clip takes a full-height column beside them.
 *
 * The columns are equal width, which lands the portrait cells at very close to
 * 9:16 for free: three stacked 16:9 cards plus their gaps come out roughly
 * 16/9 of a column tall. The portrait cards stretch to the row height and
 * object-cover absorbs the small remainder, so the tops and bottoms stay flush
 * at any width.
 *
 * A card shows its poster until activated, then plays inline with controls. On
 * pointer-fine devices, hovering starts a muted preview; touch never previews.
 */
export function VideoPortfolio({
  eyebrow,
  videos,
}: {
  /** Omitted when a tab label already names the section. */
  eyebrow?: string;
  videos: PortfolioVideo[];
}) {
  const landscape = videos.filter((video) => video.orientation === 'landscape');
  const portrait = videos.filter((video) => video.orientation === 'portrait');

  return (
    <section aria-labelledby="video-portfolio-heading" className="section-y pt-0">
      <Reveal className="shell">
        <h2 id="video-portfolio-heading" className="sr-only">
          Video portfolio
        </h2>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      </Reveal>

      <div className="shell">
        <RevealGroup
          as="ul"
          stagger={0.08}
          className="mt-12 grid grid-cols-1 gap-5 md:auto-cols-fr md:grid-flow-col md:items-stretch md:gap-6"
        >
          {/* Landscape column. A nested list keeps the markup valid while the
              stack still reads as one cell of the outer grid. */}
          {landscape.length > 0 ? (
            <RevealItem as="li" className="md:h-full">
              <ul className="flex h-full flex-col gap-5 md:gap-6">
                {landscape.map((video) => (
                  <li key={video.src}>
                    <VideoCard video={video} />
                  </li>
                ))}
              </ul>
            </RevealItem>
          ) : null}

          {portrait.map((video) => (
            <RevealItem as="li" key={video.src} className="md:h-full">
              <VideoCard video={video} stretch />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function VideoCard({ video, stretch = false }: { video: PortfolioVideo; stretch?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const canPreview = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const preview = (on: boolean) => {
    if (playing || !canPreview() || !ref.current) return;
    if (on) void ref.current.play().catch(() => undefined);
    else {
      ref.current.pause();
      ref.current.currentTime = 0;
    }
  };

  const start = () => {
    setPlaying(true);
    const element = ref.current;
    if (!element) return;
    element.muted = false;
    element.controls = true;
    void element.play().catch(() => undefined);
  };

  // When stretching, the column height wins and the aspect is dropped —
  // object-cover on the media absorbs the difference.
  const ratio = stretch ? undefined : { aspectRatio: `${video.width} / ${video.height}` };
  const frame = cn(
    'relative w-full overflow-hidden rounded-media bg-grey-line/40',
    stretch
      ? 'min-h-[420px] flex-1 md:min-h-0'
      : video.orientation === 'portrait'
        ? 'aspect-[9/16]'
        : 'aspect-video',
  );
  const figureClass = stretch ? 'flex h-full flex-col' : undefined;

  // Until the real .mp4 files land, a card is its poster still and title.
  if (!VIDEO_ASSETS_READY) {
    return (
      <figure className={figureClass}>
        <div className={frame}>
          <Image
            src={video.poster.src}
            alt={video.poster.alt}
            fill
            loading="lazy"
            sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-3 text-[14px] font-medium text-ink">{video.title}</figcaption>
      </figure>
    );
  }

  return (
    <figure className={figureClass}>
      <div
        className={cn(frame, 'group')}
        onMouseEnter={() => preview(true)}
        onMouseLeave={() => preview(false)}
      >
        <video
          ref={ref}
          poster={video.poster.src}
          width={video.width}
          height={video.height}
          muted
          loop={!playing}
          playsInline
          preload="none"
          style={ratio}
          className={cn('h-full w-full object-cover', stretch && 'absolute inset-0')}
          aria-label={video.title}
        >
          <source src={video.src} type="video/mp4" />
        </video>

        {!playing ? (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 bg-ink/5 transition-colors duration-200 hover:bg-ink/15"
          >
            <span className="sr-only">{`Play video: ${video.title}`}</span>
            {/* Corner badge marks the card as video at a glance. The whole
                card stays the click target; this is just the affordance. */}
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-lift transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transform-none"
            >
              <svg viewBox="0 0 16 18" width="13" height="15" fill="currentColor">
                <path d="M15 8.13a1 1 0 0 1 0 1.74l-13 7.4A1 1 0 0 1 .5 16.4V1.6A1 1 0 0 1 2 .73l13 7.4Z" />
              </svg>
            </span>
          </button>
        ) : null}
      </div>
      <figcaption className="mt-3 text-[14px] font-medium text-ink">{video.title}</figcaption>
    </figure>
  );
}
