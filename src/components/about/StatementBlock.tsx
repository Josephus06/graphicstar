import { Reveal } from '@/components/ui/Reveal';

/**
 * Centred Vision / Mission block: a small bold label above one large
 * light-weight statement, constrained to ~800px.
 */
export function StatementBlock({
  id,
  label,
  statement,
}: {
  id: string;
  label: string;
  statement: string;
}) {
  return (
    <section aria-labelledby={id} className="py-14 sm:py-20">
      <div className="shell flex flex-col items-center text-center">
        <Reveal>
          <h2 id={id} className="text-[15px] font-bold tracking-cta text-ink sm:text-[16px]">
            {label}
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-6 max-w-prose">
          <p className="text-[clamp(20px,2.4vw,28px)] font-light leading-[1.45] text-ink">
            {statement}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
