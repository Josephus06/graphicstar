import { ButtonLink, Arrow } from '@/components/ui/Button';
import { AutoVideo } from '@/components/ui/AutoVideo';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { digistarReels } from '@/content/assets';
import { digistarBand } from '@/content/site';

/**
 * Full-bleed magenta band with two portrait 9:16 reels side by side and the
 * orange CTA beneath. Used on the homepage and the About page.
 */
export function DigistarBand() {
  return (
    <section aria-labelledby="digistar-band-heading" className="bleed bg-magenta py-16 sm:py-24">
      <h2 id="digistar-band-heading" className="sr-only">
        Digistar digital displays
      </h2>

      <div className="mx-auto max-w-content">
        <RevealGroup className="mx-auto grid max-w-[720px] grid-cols-2 gap-4 sm:gap-6" stagger={0.1}>
          {digistarReels.map((reel) => (
            <RevealItem
              key={reel.src}
              className="overflow-hidden rounded-media bg-magenta-dark shadow-card"
            >
              <AutoVideo video={reel} sizes="(max-width: 768px) 45vw, 350px" />
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
