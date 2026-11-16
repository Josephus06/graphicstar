import Link from 'next/link';
import { BranchSummary, RecentMembers } from '@/components/rewards/Panels';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { SyncPanel } from '@/components/rewards/SyncPanel';
import { requireRole } from '@/lib/rewards/auth';
import { db, listMembers } from '@/lib/rewards/db';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  await requireRole('admin');
  const recent = listMembers().slice(0, 5);
  const stats = db()
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM members) AS members,
         (SELECT COUNT(*) FROM members WHERE system_pk IS NULL OR TRIM(system_pk) = '') AS unverified,
         (SELECT COUNT(*) FROM redemptions WHERE status = 'pending') AS pending,
         (SELECT COALESCE(SUM(points), 0) FROM points WHERE points > 0) AS issued`,
    )
    .get() as { members: number; unverified: number; pending: number; issued: number };

  const tiles = [
    { label: 'Members', value: stats.members },
    { label: 'Awaiting verification', value: stats.unverified, href: '/rewards/admin/verification' },
    { label: 'Pending redemptions', value: stats.pending },
    { label: 'Points issued', value: Math.round(stats.issued * 100) / 100 },
  ];

  return (
    <div className="grid gap-6">
      <PageTitle title="Dashboard" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label} className="relative rounded-media bg-white p-5 shadow-card">
            <p className="text-[13px] font-medium text-grey-muted">
              {'href' in t && t.href ? (
                <Link href={t.href} className="after:absolute after:inset-0 hover:text-blue">
                  {t.label} →
                </Link>
              ) : (
                t.label
              )}
            </p>
            <p className="mt-1 text-[30px] font-semibold tracking-tightest text-ink">{t.value.toLocaleString('en-PH')}</p>
          </li>
        ))}
      </ul>
      <BranchSummary />
      <RecentMembers members={recent} />
      <Panel title="ERP points sync">
        <SyncPanel />
      </Panel>
    </div>
  );
}
