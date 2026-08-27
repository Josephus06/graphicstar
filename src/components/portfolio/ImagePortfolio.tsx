'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import type { PortfolioImage } from '@/content/assets';
import { fadeUp, inViewOnce } from '@/lib/motion';

/**
 * Uniform 4:3 project grid plus a keyboard-driven lightbox: ← → to move,
 * Escape to close, Tab trapped inside, and focus returned to the thumbnail
 * that opened it.
 *
 * The lightbox is portalled to `document.body`. It is rendered from inside the
 * tab panel, and that panel runs an entrance animation — an element with a
 * filling transform animation establishes a stacking context, which would trap
 * the dialog's z-index beneath the fixed navbar however high we set it.
 */
export function ImagePortfolio({
  eyebrow,
  images,
}: {
  /** Omitted when a tab label already names the section. */
  eyebrow?: string;
  images: PortfolioImage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);
  const lastFocused = useRef<number | null>(null);
  // `document` is not available during SSR, so the portal waits for mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpenIndex(null);
    const index = lastFocused.current;
    if (index !== null) triggersRef.current[index]?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : images[openIndex];

  return (
    <section aria-labelledby="image-portfolio-heading" className="pb-16 pt-4 sm:pb-24">
      <Reveal className="shell">
        <h2 id="image-portfolio-heading" className="sr-only">
          Image portfolio
        </h2>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      </Reveal>

      {/* Uniform 3 / 2 / 1 grid. Every card is 4:3 and object-cover, so the rows
          stay level regardless of each source image's own aspect. */}
      <div className="shell mt-12 grid grid-cols-1 gap-6 xs:grid-cols-2 md:grid-cols-3">
        {images.map((image, index) => (
          <motion.div
            key={image.src}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
          >
            <button
              type="button"
              ref={(node) => {
                triggersRef.current[index] = node;
              }}
              onClick={() => {
                lastFocused.current = index;
                setOpenIndex(index);
              }}
              className="card-interactive group relative block aspect-[4/3] w-full overflow-hidden rounded-card bg-grey-line/40 text-left"
            >
              <span className="sr-only">{`Open project: ${image.title}`}</span>

              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transform-none"
              />

              {/* Overlay slides up from the foot of the card on hover, and is
                  shown outright on keyboard focus so it is never unreachable. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/95 via-ink/80 to-transparent px-5 pb-5 pt-10 transition-transform duration-[350ms] ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
              >
                <span className="flex items-end justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold leading-snug text-white">
                      {image.title}
                    </span>
                    <span className="mt-1.5 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-eyebrow text-white/90">
                      {image.category}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 20 12"
                    width="20"
                    height="12"
                    fill="none"
                    className="mb-1 shrink-0 text-white"
                  >
                    <path
                      d="M0 6h18M13 1l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </button>
          </motion.div>
        ))}
      </div>

      {active && mounted
        ? createPortal(
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
              className="fixed inset-0 z-[100] flex flex-col bg-ink/95 p-4 sm:p-6"
            >
              <div className="flex shrink-0 items-center justify-between text-white">
                <p className="text-[13px] font-medium tabular-nums">
                  {(openIndex ?? 0) + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition-colors duration-150 hover:bg-white hover:text-ink"
                >
                  <span className="sr-only">Close image viewer</span>
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none">
                    <path
                      d="M4 4l12 12M16 4L4 16"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-3 sm:gap-6">
                <LightboxArrow direction="previous" onClick={() => step(-1)} />
                {/* Capped in viewport units rather than percentages: the flex
                    parent alone let a tall image push the caption off-screen. */}
                <Image
                  key={active.src}
                  src={active.src}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                  sizes="85vw"
                  className="max-h-[68vh] w-auto max-w-[82vw] rounded-card object-contain"
                  priority
                />
                <LightboxArrow direction="next" onClick={() => step(1)} />
              </div>

              <div className="shrink-0 px-2 text-center">
                <p className="text-[16px] font-bold text-white">{active.title}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-eyebrow text-white/60">
                  {active.category}
                </p>
                <p className="mx-auto mt-2 max-w-prose text-[13px] leading-relaxed text-white/70">
                  {active.alt}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

function LightboxArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-150 hover:bg-white hover:text-ink"
    >
      <span className="sr-only">{`Show ${direction} image`}</span>
      <svg
        viewBox="0 0 20 12"
        width="20"
        height="12"
        fill="none"
        aria-hidden="true"
        className={direction === 'previous' ? 'rotate-180' : undefined}
      >
        <path
          d="M0 6h18M13 1l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
