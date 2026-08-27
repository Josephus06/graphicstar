import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { contactPage } from '@/content/contact';
import { branches, mapsHref, telHref } from '@/content/site';

/**
 * Three branch cards, stacked on mobile. Phone numbers are `tel:` links.
 *
 * Maps are linked out rather than embedded — an iframe per branch would pull in
 * third-party scripts and cost more Lighthouse performance than it is worth here.
 */
export function BranchCards() {
  return (
    <section aria-labelledby="branches-heading" className="section-y pt-4">
      <div className="shell">
        <Reveal>
          <h2
            id="branches-heading"
            className="text-center text-[clamp(20px,2.6vw,26px)] font-bold tracking-tight text-ink"
          >
            <span aria-hidden="true">📍 </span>
            {contactPage.branchesHeading}
          </h2>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.09}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
        >
          {branches.map((branch) => (
            <RevealItem
              as="li"
              key={branch.slug}
              className="flex flex-col rounded-card bg-white p-7 shadow-card sm:p-8"
            >
              <h3 className="text-[19px] font-bold tracking-tight text-ink">{branch.name}</h3>
              <address className="mt-3 text-[15px] not-italic leading-[1.7] text-ink/80">
                {branch.address}
              </address>

              <div className="mt-6">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink/55">
                  Operating Hours:
                </p>
                <ul className="mt-2 space-y-1 text-[15px] leading-[1.7] text-ink/80">
                  {branch.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <dl className="mt-6 space-y-1.5 text-[15px] leading-[1.7]">
                <div className="flex gap-2">
                  <dt className="text-ink/55">Landline:</dt>
                  <dd>
                    <a href={telHref(branch.landline)} className="rounded-sm font-medium text-ink hover:text-blue">
                      {branch.landline}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink/55">Mobile:</dt>
                  <dd>
                    <a href={telHref(branch.mobile)} className="rounded-sm font-medium text-ink hover:text-blue">
                      {branch.mobile}
                    </a>
                  </dd>
                </div>
              </dl>

              <a
                href={mapsHref(branch.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-grey-line px-4 py-2 text-[12px] font-bold uppercase tracking-cta text-ink transition-colors duration-150 hover:border-blue hover:text-blue"
              >
                Open in Google Maps
                <span className="sr-only">{` — ${branch.name}`}</span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
