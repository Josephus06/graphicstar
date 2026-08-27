import { tickerPhrase } from '@/content/site';
import { cn } from '@/lib/cn';

/**
 * Thin full-width strip scrolling `CREATIONS MADE EASY` with an orange dot
 * separator. Pure CSS transform loop: two identical halves inside a `w-max`
 * track translated by -50%, so the seam never shows.
 *
 * Pauses on hover/focus-within; disabled entirely under prefers-reduced-motion
 * (see `.marquee-track` in globals.css).
 */
export function TickerStrip({
  repeat = 8,
  className,
}: {
  repeat?: number;
  className?: string;
}) {
  const half = Array.from({ length: repeat });

  const Half = () => (
    <>
      {half.map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-5 text-[11px] font-bold uppercase tracking-eyebrow text-ink sm:px-7 sm:text-[12px]">
            {tickerPhrase}
          </span>
          <span aria-hidden="true" className="block h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn(
        'marquee-paused w-full overflow-hidden border-y border-grey-line bg-white py-3',
        className,
      )}
    >
      {/* One announcement for assistive tech; the visual loop is decorative. */}
      <span className="sr-only">{tickerPhrase}</span>
      <div
        aria-hidden="true"
        className="marquee-track"
        style={{ '--marquee-duration': `${repeat * 3.2}s` } as React.CSSProperties}
      >
        <Half />
        <Half />
      </div>
    </div>
  );
}
