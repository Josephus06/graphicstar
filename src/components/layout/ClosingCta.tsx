import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { closingCta } from '@/content/site';

/** Large centred headline + orange CTA. Reused at the foot of most pages. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-cta-heading" className="section-y">
      <div className="shell flex flex-col items-center text-center">
        <Reveal>
          <h2 id="closing-cta-heading" className="section-title max-w-[16ch]">
            {closingCta.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="mt-9 sm:mt-11">
          <ButtonLink href={closingCta.button.href} size="lg">
            {closingCta.button.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
