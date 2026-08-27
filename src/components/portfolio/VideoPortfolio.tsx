'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { VIDEO_ASSETS_READY, type PortfolioVideo } from '@/content/assets';
import { cn } from '@/lib/cn';

/**
 * Grid of video cards mixing landscape and portrait reels. A card shows its
 * poster until it is activated, then plays inline with controls. On pointer-fine
 * devices, hovering starts a muted preview; touch devices never preview.
 */
export function VideoPortfolio({ eyebrow, videos }: { eyebrow: string; videos: PortfolioVideo[] }) {
  return (
    <section aria-labelledby="video-portfolio-heading" className="section-y pt-0">
      <Reveal className="shell">
        <h2 id="video-portfolio-heading" className="sr-only">
          Video portfolio
        </h2>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>

      <div className="shell">
        <RevealGroup
          as="ul"
          stagger={0.08}
          className="mt-12 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 md:gap-6"
        >
          {videos.map((video) => (
            <RevealItem as="li" key={video.src}>
              <VideoCard video={video} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function VideoCard({ video }: { video: PortfolioVideo }) {
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

  const ratio = { aspectRatio: `${video.width} / ${video.height}` };
  const frame = cn(
    'relative w-full overflow-hidden rounded-media bg-grey-line/40',
    video.orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video',
  );

  // Until the real .mp4 files land, a card is its poster still and title.
  if (!VIDEO_ASSETS_READY) {
    return (
      <figure>
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
    <figure>
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
          className="h-full w-full object-cover"
          aria-label={video.title}
        >
          <source src={video.src} type="video/mp4" />
        </video>

        {!playing ? (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center bg-ink/10 transition-colors duration-150 hover:bg-ink/20"
          >
            <span className="sr-only">{`Play video: ${video.title}`}</span>
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink shadow-lift transition-transform duration-150 group-hover:scale-105 motion-reduce:transform-none"
            >
              <svg viewBox="0 0 16 18" width="18" height="20" fill="currentColor">
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
