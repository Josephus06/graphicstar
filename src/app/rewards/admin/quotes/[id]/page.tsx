import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ConfirmButton } from '@/components/rewards/Form';
import { Badge, PageTitle, Panel } from '@/components/rewards/Shell';
import { setQuoteStatus } from '@/lib/designer/actions';
import { peso, sizeLabel, type PriceBreakdown, type Selection } from '@/lib/designer/model';
import { getProduct, getQuote } from '@/lib/designer/store';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';

export const metadata = { title: 'Design Quote' };

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const q = getQuote(Number((await params).id));
  if (!q) notFound();
  const sel = JSON.parse(q.selection) as Selection;
  const b = JSON.parse(q.breakdown) as PriceBreakdown;
  const unit = (q.product_id ? getProduct(q.product_id)?.config.unit : undefined) ?? 'in';
  const file = (which: 'artwork' | 'proof') => `/rewards/admin/quotes/${q.id}/file/${which}`;
  const tone = q.status === 'new' ? 'pending' : q.status === 'won' ? 'done' : 'neutral';

  const rows: [string, ReactNode][] = [
    [
      'Customer',
      <>
        {q.name}
        {q.company ? <span className="block text-grey-muted">{q.company}</span> : null}
      </>,
    ],
    [
      'Email',
      <a key="email" href={`mailto:${q.email}?subject=${encodeURIComponent(`Your quote ${q.reference}`)}`} className="text-blue">
        {q.email}
      </a>,
    ],
    [
      'Phone',
      <a key="phone" href={`tel:${q.phone}`} className="text-blue">
        {q.phone}
      </a>,
    ],
    ['Product', q.product_name],
    ['Size', sizeLabel(sel.w, sel.h, unit)],
    ...b.lines.map((l): [string, ReactNode] => [l.group, l.choice]),
    ['Quantity', String(sel.qty)],
    [
      'Website price',
      <>
        {peso(b.perItem)} each{b.discountPct ? `, ${b.discountPct}% quantity discount` : ''} · <b>{peso(b.total)}</b>
      </>,
    ],
    ['Notes', q.notes ?? '—'],
  ];

  return (
    <>
      <PageTitle title={q.reference} sub={`Received ${formatDate(q.created_at)}`} actions={<Badge tone={tone}>{q.status}</Badge>} />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Request">
          <dl className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2.5 text-[14px]">
            {rows.map(([k, v], i) => (
              <div key={`${k}-${i}`} className="contents">
                <dt className="text-grey-muted">{k}</dt>
                <dd className="break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {(['contacted', 'won', 'lost', 'new'] as const)
              .filter((s) => s !== q.status)
              .map((s) => (
                <ConfirmButton key={s} action={setQuoteStatus} fields={{ id: q.id, status: s }} tone="primary">
                  Mark {s}
                </ConfirmButton>
              ))}
          </div>
        </Panel>
        <Panel title="Design">
          {q.proof_file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file('proof')} alt={`Design proof for ${q.reference}`} className="w-full rounded-card border border-grey-line" />
          ) : (
            <p className="text-grey-muted">No preview (the customer uploaded a PDF).</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-[14px] font-semibold">
            {q.proof_file ? (
              <a href={file('proof')} download className="text-blue">
                Download proof PNG
              </a>
            ) : null}
            {q.artwork_file ? (
              <a href={file('artwork')} download={q.artwork_name ?? undefined} className="text-blue">
                Download customer artwork{q.artwork_name ? ` (${q.artwork_name})` : ''}
              </a>
            ) : (
              <span className="font-normal text-grey-muted">Made with an online template</span>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
