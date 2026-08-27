import { ButtonLink, Arrow } from '@/components/ui/Button';
import { AutoVideo } from '@/components/ui/AutoVideo';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { digistarReels } from '@/content/assets';
import { digistarBand } from '@/content/site';

/**
 * Full-bleed magenta band carrying the Digistar reels, with the orange CTA
 * beneath. Used on the homepage and the About page.
 *
 * The reels are different shapes — a 9:16 portrait beside a 16:9 landscape — so
 * the row is sized by height rather than by equal columns: from `sm` up the
 * track gets a fixed height and each cell derives its own width from its
 * `aspect-ratio`. That keeps both tops and bottoms flush whatever aspects
 * `digistarReels` declares, without hard-coding column fractions.
 *
 * Below `sm` the two would be far too wide side by side, so they stack and each
 * takes the full width at its natural aspect.
 */
export function DigistarBand() {
  return (
    <section aria-labelledby="digistar-band-heading" className="bleed bg-magenta py-16 sm:py-24">
      <h2 id="digistar-band-heading" className="sr-only">
        Digistar digital displays
      </h2>

      <div className="mx-auto max-w-content">
        <RevealGroup
          className="mx-auto flex max-w-[980px] flex-col items-center justify-center gap-4 sm:h-[340px] sm:flex-row sm:items-stretch sm:gap-6 md:h-[400px]"
          stagger={0.1}
        >
          {digistarReels.map((reel) => (
            <RevealItem
              key={reel.src}
              /* `min-w-0` stops a wide landscape cell from forcing the flex row
                 past its max-width on narrow desktops. */
              className="w-full min-w-0 overflow-hidden rounded-media bg-magenta-dark shadow-card sm:h-full sm:w-auto"
              style={{ aspectRatio: `${reel.width} / ${reel.height}` }}
            >
              <AutoVideo
                video={reel}
                className="h-full w-full"
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 600px"
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 flex justify-center sm:mt-12" delay={0.1}>
          <ButtonLink href={digistarBand.button.href} size="lg">
            {digistarBand.button.label}
            <Arrow />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
