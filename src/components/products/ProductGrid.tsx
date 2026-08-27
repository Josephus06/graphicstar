import Image from 'next/image';
import Link from 'next/link';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';
import type { ImageAsset } from '@/content/assets';
import { cn } from '@/lib/cn';

export type ProductGridCell = {
  label: string;
  photo: ImageAsset;
  /** Omit for non-navigational item cards on a category page. */
  href?: string;
};

/**
 * Full-bleed three-across grid of near-white product panels.
 *
 * There are no gaps — a 1px light divider on every cell makes the row read as
 * one continuous band. Collapses 3 → 2 → 1 across the breakpoints.
 */
export function ProductGrid({
  cells,
  ariaLabel,
}: {
  cells: ProductGridCell[];
  ariaLabel: string;
}) {
  return (
    <RevealGroup
      as="ul"
      stagger={0.06}
      aria-label={ariaLabel}
      className="grid w-full grid-cols-1 border-t border-grey-line xs:grid-cols-2 md:grid-cols-3"
    >
      {cells.map((cell) => {
        const inner = (
          <>
            <div className="relative w-full overflow-hidden bg-grey-panel">
              <div className="relative aspect-square w-full">
                <Image
                  src={cell.photo.src}
                  alt={cell.photo.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none sm:p-12"
                />
              </div>
            </div>
            <span
              className={cn(
                'block px-6 pb-10 pt-7 text-center text-[13px] font-bold uppercase leading-snug tracking-cta text-ink',
                'transition-colors duration-150 group-hover:text-orange sm:text-[14px]',
              )}
            >
              {cell.label}
            </span>
          </>
        );

        return (
          <RevealItem
            as="li"
            key={cell.label}
            className="group border-b border-grey-line bg-white xs:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:border-r-0 md:[&:not(:nth-child(3n))]:border-r"
          >
            {cell.href ? (
              <Link href={cell.href} className="flex h-full flex-col justify-between">
                {inner}
              </Link>
            ) : (
              <div className="flex h-full flex-col justify-between">{inner}</div>
            )}
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
