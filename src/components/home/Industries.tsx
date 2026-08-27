import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { industriesSection } from '@/content/home';

/** Hand-drawn-feel orange tick — a single stroked path with round caps. */
function CheckMark() {
  return (
    <svg
      viewBox="0 0 28 22"
      width="26"
      height="20"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-orange"
    >
      <path
        d="M2 11.8c2.6 1.3 5 3.3 7 6C13.4 10.4 18.6 4.6 26 1.6"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Industries() {
  return (
    <section aria-labelledby="industries-heading" className="section-y">
      <div className="shell">
        <Reveal>
          <h2 id="industries-heading" className="sr-only">
            Industries we serve
          </h2>
          <Eyebrow>{industriesSection.eyebrow}</Eyebrow>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.05}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-x-10 gap-y-6 xs:grid-cols-2 md:grid-cols-3"
        >
          {industriesSection.items.map((industry) => (
            <RevealItem as="li" key={industry} className="flex items-start gap-3">
              <CheckMark />
              <span className="text-[17px] font-medium leading-[1.5] text-ink sm:text-[18px]">
                {industry}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
