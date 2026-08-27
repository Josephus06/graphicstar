import Image from 'next/image';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { clientLogos } from '@/content/assets';
import { clientsSection } from '@/content/home';

/**
 * Infinite auto-scrolling logo row. The array is rendered twice inside a `w-max`
 * track that translates -50%, which makes the loop seamless.
 */
export function ClientMarquee() {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {clientLogos.map((logo) => (
        <li key={logo.src} className="flex shrink-0 items-center px-8 sm:px-12">
          <Image
            src={logo.src}
            alt={hidden ? '' : logo.alt}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            sizes="160px"
            className="h-14 w-auto opacity-70 transition-opacity duration-200 hover:opacity-100 sm:h-16"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="clients-heading" className="section-y">
      <Reveal className="shell">
        <h2 id="clients-heading" className="sr-only">
          Our clients
        </h2>
        <Eyebrow>{clientsSection.eyebrow}</Eyebrow>
      </Reveal>

      <div className="marquee-paused mt-12 w-full overflow-hidden">
        <div className="marquee-track" style={{ '--marquee-duration': '48s' } as React.CSSProperties}>
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
