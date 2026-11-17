import Link from 'next/link';
import { MockupScene } from '@/components/designer/MockupScene';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { TEMPLATES, normaliseOptions, peso, priceFor } from '@/lib/designer/model';
import { listProducts } from '@/lib/designer/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Design Online',
  description: 'Choose a size and material, design your sign online, see the price, and request a quote.',
};

export default function DesignIndexPage() {
  const products = listProducts({ activeOnly: true });

  return (
    <>
      <PageHero title="Design Online" />
      <section className="shell pb-24">
        {products.length === 0 ? (
          <div className="mx-auto max-w-prose rounded-media bg-white p-8 text-center shadow-card">
            <p className="text-[18px] font-semibold text-ink">Online design is coming soon.</p>
            <p className="body-copy mt-2">In the meantime, tell us what you need and we&apos;ll send you a quote.</p>
            <ButtonLink href="/contact" className="mt-6">
              Request a Quote
            </ButtonLink>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const s = p.config.sizes[0] ?? { w: p.config.minW, h: p.config.minH };
              const from = priceFor(p.config, { w: s.w, h: s.h, qty: 1, options: normaliseOptions(p.config, {}) });
              const tpl = p.config.templates[0] ?? 'headline';
              return (
                <li key={p.id}>
                  <Link href={`/design/${p.slug}`} className="card-interactive block overflow-hidden rounded-media bg-white shadow-card">
                    <MockupScene
                      w={s.w}
                      h={s.h}
                      unit={p.config.unit}
                      art={{ mode: 'template', template: tpl, fields: TEMPLATES[tpl].defaults, logo: null }}
                      mockups={[]}
                      doubleSided={false}
                    />
                    <div className="p-5">
                      <h2 className="text-[20px] font-semibold text-ink">{p.name}</h2>
                      {p.description ? <p className="mt-1 line-clamp-2 text-[14px] text-grey-muted">{p.description}</p> : null}
                      {!from.error ? <p className="mt-3 text-[14px] font-semibold text-emerald-700">From {peso(from.perItem)}</p> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
