import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { homeAssets, type ImageAsset } from '@/content/assets';
import { portfolioBento } from '@/content/home';
import { cn } from '@/lib/cn';

/**
 * Deliberately unequal cells: row 1 is 1/3 + 2/3, row 2 is 2/3 + 1/3, and a
 * wide feature cell closes the grid. The aspect ratios are chosen so both cells
 * in a row resolve to the same height at three columns.
 */
const cells: { asset: ImageAsset; span: string; ratio: string; sizes: string }[] = [
  {
    asset: homeAssets.bento[0],
    span: 'md:col-span-1',
    ratio: 'aspect-[4/5]',
    sizes: '(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 30vw',
  },
  {
    asset: homeAssets.bento[1],
    span: 'md:col-span-2',
    ratio: 'aspect-[8/5]',
    sizes: '(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 60vw',
  },
  {
    asset: homeAssets.bento[2],
    span: 'md:col-span-2',
    ratio: 'aspect-[8/5]',
    sizes: '(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 60vw',
  },
  {
    asset: homeAssets.bento[3],
    span: 'md:col-span-1',
    ratio: 'aspect-[4/5]',
    sizes: '(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 30vw',
  },
  {
    asset: homeAssets.bento[4],
    span: 'xs:col-span-2 md:col-span-3',
    ratio: 'aspect-[16/9] md:aspect-[7/3]',
    sizes: '(max-width: 480px) 90vw, 90vw',
  },
];

export function PortfolioBento() {
  return (
    <section aria-labelledby="bento-heading" className="section-y">
      <div className="shell">
        <Reveal className="mx-auto max-w-[22ch] text-center">
          <h2 id="bento-heading" className="section-title">
            {portfolioBento.heading}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-7 text-center">
          {portfolioBento.subcopy.map((line) => (
            <p key={line} className="body-copy">
              {line}
            </p>
          ))}
        </Reveal>

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 md:gap-6"
          stagger={0.09}
        >
          {cells.map((cell) => (
            <RevealItem
              key={cell.asset.src}
              className={cn('group', cell.span)}
            >
              <div
                className={cn(
                  'media-frame media-scrim card-interactive w-full rounded-media bg-grey-line/40',
                  cell.ratio,
                )}
              >
                <Image
                  src={cell.asset.src}
                  alt={cell.asset.alt}
                  fill
                  loading="lazy"
                  sizes={cell.sizes}
                  /* Scale is owned by `.media-frame img` so the frame and its image share one timing. */
                  className="object-cover"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <ButtonLink href={portfolioBento.button.href} size="lg">
            {portfolioBento.button.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
