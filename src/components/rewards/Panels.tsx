import Link from 'next/link';
import { ConfirmButton } from '@/components/rewards/Form';
import { Panel, Table, TextLink } from '@/components/rewards/Shell';
import { deletePoint } from '@/lib/rewards/actions/points';
import { formatDate, formatPeso, formatPoints } from '@/lib/rewards/constants';
import { branchCounts, db, type MemberWithBranch, type PointRow } from '@/lib/rewards/db';

/**
 * Server-rendered building blocks shared by the admin and staff panels.
 */

const BRANCH_COLORS = ['#0500FF', '#ED7504', '#BA006D', '#232536', '#0B10A0'];

export function BranchSummary() {
  const branches = branchCounts();
  const total = branches.reduce((sum, b) => sum + b.members_count, 0);
  return (
    <Panel title="Members per branch">
      {branches.length === 0 ? (
        <p className="text-grey-muted">No members yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b, i) => {
            const pct = total ? Math.round((b.members_count / total) * 100) : 0;
            const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
            return (
              <li key={b.branch ?? 'none'} className="flex items-center gap-4 rounded-card bg-grey-panel p-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-[14px] font-bold text-ink"
                  style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, #DDDDDD 0deg)` }}
                  role="img"
                  aria-label={`${pct}% of members`}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-grey-panel">{pct}%</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{b.branch ?? 'No branch'}</p>
                  <p className="text-[14px] text-grey-muted">
                    {b.members_count} member{b.members_count === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[14px] text-grey-muted">Total members: {total}</p>
    </Panel>
  );
}

export function RecentMembers({ members, title = 'Recent members' }: { members: MemberWithBranch[]; title?: string }) {
  return (
    <Panel title={title}>
      <Table head={['Name', 'Card no.', 'Email', 'Phone', 'Branch', 'Joined']} empty={members.length === 0}>
        {members.map((m) => (
          <tr key={m.id}>
            <td className="font-medium">{m.name}</td>
            <td>{m.card_no ?? '—'}</td>
            <td className="break-all">{m.email}</td>
            <td>{m.phone}</td>
            <td>{m.branch ?? '—'}</td>
            <td className="whitespace-nowrap">{formatDate(m.created_at)}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/** Totals per member (the points index). */
export function PointTotals({ area }: { area: 'admin' | 'staff' }) {
  const rows = db()
    .prepare(
      `SELECT m.id, m.name, m.card_no, u.branch, ROUND(SUM(p.points), 5) AS total_points, COUNT(p.id) AS entries
       FROM points p JOIN members m ON m.id = p.member_id LEFT JOIN users u ON u.id = m.user_id
       GROUP BY m.id ORDER BY m.name`,
    )
    .all() as { id: number; name: string; card_no: string | null; branch: string | null; total_points: number; entries: number }[];

  return (
    <Panel>
      <Table head={['Member', 'Card no.', 'Branch', 'Entries', 'Total points', '']} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="font-medium">{r.name}</td>
            <td>{r.card_no ?? '—'}</td>
            <td>{r.branch ?? '—'}</td>
            <td>{r.entries}</td>
            <td className="font-semibold text-blue">{formatPoints(r.total_points)}</td>
            <td className="text-right">
              <TextLink href={`/rewards/${area}/points/member/${r.id}`}>Entries</TextLink>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/** Every points entry for one member, with edit / delete. */
export function MemberPointEntries({ area, member }: { area: 'admin' | 'staff'; member: MemberWithBranch }) {
  const entries = db()
    .prepare(
      `SELECT p.*, u.name AS added_by FROM points p LEFT JOIN users u ON u.id = p.user_id
       WHERE p.member_id = ? ORDER BY p.created_at DESC, p.id DESC`,
    )
    .all(member.id) as (PointRow & { added_by: string | null })[];
  const remove = deletePoint.bind(null, area);

  return (
    <Panel>
      <Table head={['Date', 'Bill no.', 'Amount', 'Points', 'Added by', '']} empty={entries.length === 0}>
        {entries.map((p) => (
          <tr key={p.id}>
            <td className="whitespace-nowrap">{formatDate(p.created_at)}</td>
            <td className="font-medium">{p.bill_no}</td>
            <td>{formatPeso(p.bill_amount)}</td>
            <td className={p.points < 0 ? 'font-semibold text-magenta' : 'font-semibold text-emerald-700'}>{formatPoints(p.points)}</td>
            <td>{p.added_by ?? '—'}</td>
            <td className="whitespace-nowrap text-right">
              <Link href={`/rewards/${area}/points/${p.id}`} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-blue hover:bg-blue/5">
                Edit
              </Link>
              <ConfirmButton action={remove} fields={{ id: p.id }} confirm="Delete this points entry?">
                Delete
              </ConfirmButton>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

export function memberOptions() {
  return (db().prepare(`SELECT id, name, card_no FROM members ORDER BY name`).all() as { id: number; name: string; card_no: string | null }[]).map(
    (m) => ({ value: String(m.id), label: m.card_no ? `${m.name} (${m.card_no})` : m.name }),
  );
}
