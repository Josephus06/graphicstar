import { ConfirmButton } from '@/components/rewards/Form';
import { Badge, PageTitle, Panel, Table } from '@/components/rewards/Shell';
import { markRedeemed } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';
import { db } from '@/lib/rewards/db';

export const metadata = { title: 'Redemptions' };

type Row = {
  id: number;
  code: string;
  status: 'pending' | 'redeemed';
  created_at: string;
  member: string | null;
  card_no: string | null;
  reward: string | null;
  points_required: number | null;
};

export default async function RedemptionsPage({ searchParams }: { searchParams: Promise<{ code?: string; status?: string }> }) {
  await requireRole('admin');
  const sp = await searchParams;
  const code = (sp.code ?? '').trim();
  const status = sp.status === 'pending' || sp.status === 'redeemed' ? sp.status : '';

  const where: string[] = [];
  const args: string[] = [];
  if (code) {
    where.push('r.code LIKE ?');
    args.push(`%${code}%`);
  }
  if (status) {
    where.push('r.status = ?');
    args.push(status);
  }
  const rows = db()
    .prepare(
      `SELECT r.id, r.code, r.status, r.created_at, m.name AS member, m.card_no, w.name AS reward, w.points_required
       FROM redemptions r LEFT JOIN members m ON m.id = r.member_id LEFT JOIN rewards w ON w.id = r.reward_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY r.created_at DESC, r.id DESC`,
    )
    .all(...args) as Row[];

  const back = `/rewards/admin/redemptions${code || status ? `?${new URLSearchParams({ ...(code && { code }), ...(status && { status }) })}` : ''}`;

  return (
    <>
      <PageTitle title="Redemptions" sub="Scan or type the member's redeem code, then mark it redeemed when the reward is handed over." />
      <Panel>
        <form className="mb-4 flex flex-wrap gap-2">
          <label htmlFor="code" className="sr-only">
            Redeem code
          </label>
          <input
            id="code"
            name="code"
            defaultValue={code}
            placeholder="Redeem code (REWARD-…)"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-grey-line px-4 py-2.5 font-mono text-[15px] focus:border-blue focus:outline-none"
          />
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className="rounded-xl border border-grey-line px-4 py-2.5 text-[15px]">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="redeemed">Redeemed</option>
          </select>
          <button type="submit" className="rounded-full bg-ink px-5 text-[12px] font-bold uppercase tracking-cta text-white">
            Find
          </button>
        </form>
        <Table head={['Date', 'Member', 'Reward', 'Code', 'Status', '']} empty={rows.length === 0}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap">{formatDate(r.created_at)}</td>
              <td>
                <span className="font-medium">{r.member ?? '—'}</span>
                {r.card_no ? <span className="block text-[12px] text-grey-muted">{r.card_no}</span> : null}
              </td>
              <td>
                {r.reward ?? '—'}
                {r.points_required != null ? <span className="block text-[12px] text-grey-muted">{r.points_required} pts</span> : null}
              </td>
              <td className="font-mono text-[13px]">{r.code}</td>
              <td>
                <Badge tone={r.status === 'pending' ? 'pending' : 'done'}>{r.status}</Badge>
              </td>
              <td className="text-right">
                {r.status === 'pending' ? (
                  <ConfirmButton action={markRedeemed} fields={{ id: r.id, back }} tone="primary" confirm={`Mark ${r.code} as redeemed?`}>
                    Mark redeemed
                  </ConfirmButton>
                ) : null}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
