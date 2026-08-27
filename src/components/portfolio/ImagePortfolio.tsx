'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import type { ImageAsset } from '@/content/assets';
import { fadeUp, inViewOnce } from '@/lib/motion';

/**
 * Masonry gallery (CSS columns, so mixed aspect ratios pack tightly) plus a
 * keyboard-driven lightbox: ← → to move, Escape to close, Tab trapped inside,
 * and focus returned to the thumbnail that opened it.
 */
export function ImagePortfolio({ eyebrow, images }: { eyebrow: string; images: ImageAsset[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);
  const lastFocused = useRef<number | null>(null);

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
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>

      <div className="mt-12 columns-1 gap-2 px-2 xs:columns-2 md:columns-3">
        {images.map((image, index) => (
          <motion.div
            key={image.src}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mb-2 break-inside-avoid"
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
              className="group block w-full overflow-hidden rounded-card bg-grey-line/40"
            >
              <span className="sr-only">{`Open image: ${image.alt}`}</span>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
              />
            </button>
          </motion.div>
        ))}
      </div>

      {active ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 sm:p-8"
        >
          <div className="flex items-center justify-between text-white">
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

          <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4 sm:gap-6">
            <LightboxArrow direction="previous" onClick={() => step(-1)} />
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes="90vw"
              className="max-h-full w-auto max-w-full rounded-card object-contain"
              priority
            />
            <LightboxArrow direction="next" onClick={() => step(1)} />
          </div>

          <p className="px-2 text-center text-[13px] leading-relaxed text-white/70">{active.alt}</p>
        </div>
      ) : null}
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
