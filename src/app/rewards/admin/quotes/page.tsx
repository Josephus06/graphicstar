import Link from 'next/link';
import { Badge, PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { cn } from '@/lib/cn';
import { peso } from '@/lib/designer/model';
import { listQuotes } from '@/lib/designer/store';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';

export const metadata = { title: 'Design Quotes' };

const STATUSES = ['new', 'contacted', 'won', 'lost'] as const;

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole('admin');
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const quotes = listQuotes(status);
  return (
    <>
      <PageTitle title="Design quotes" sub="Requests sent from Design Online, with the customer's options, artwork and website price." />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? 'all'}
            href={s ? `?status=${s}` : '?'}
            aria-current={status === s ? 'page' : undefined}
            className={cn('rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize', status === s ? 'bg-ink text-white' : 'bg-white text-ink')}
          >
            {s ?? 'All'}
          </Link>
        ))}
      </nav>
      <Panel>
        <Table head={['Date', 'Reference', 'Customer', 'Product', 'Total', 'Status', '']} empty={quotes.length === 0}>
          {quotes.map((q) => {
            const sel = JSON.parse(q.selection) as { qty: number };
            return (
              <tr key={q.id}>
                <td className="whitespace-nowrap">{formatDate(q.created_at)}</td>
                <td className="font-mono text-[13px]">{q.reference}</td>
                <td>
                  <span className="font-medium">{q.name}</span>
                  <span className="block text-[12px] text-grey-muted">{q.company ?? q.email}</span>
                </td>
                <td>
                  {q.product_name} × {sel.qty}
                </td>
                <td className="font-semibold">{peso(q.total)}</td>
                <td>
                  <Badge tone={q.status === 'new' ? 'pending' : q.status === 'won' ? 'done' : 'neutral'}>{q.status}</Badge>
                </td>
                <td className="text-right">
                  <TextLink href={`/rewards/admin/quotes/${q.id}`}>Open</TextLink>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </>
  );
}
