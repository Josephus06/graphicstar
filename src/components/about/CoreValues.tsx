import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { coreValues } from '@/content/about';

/** Four numbered cards, staggered in on scroll. 4 → 2 → 1 columns. */
export function CoreValues() {
  return (
    <section aria-labelledby="core-values-heading" className="section-y">
      <div className="shell">
        <Reveal className="text-center">
          <h2 id="core-values-heading" className="section-title">
            {coreValues.heading}
          </h2>
        </Reveal>

        <RevealGroup
          as="ol"
          stagger={0.1}
          className="mt-14 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4 md:gap-6"
        >
          {coreValues.items.map((value) => (
            <RevealItem
              as="li"
              key={value.number}
              className="flex flex-col rounded-card bg-white p-7 shadow-card sm:p-8"
            >
              <span
                aria-hidden="true"
                className="text-[44px] font-light leading-none tracking-tightest text-blue/85 sm:text-[52px]"
              >
                {value.number}
              </span>
              <h3 className="mt-6 text-[19px] font-bold leading-tight tracking-tight text-ink">
                {value.name}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.65] text-ink/75">{value.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
