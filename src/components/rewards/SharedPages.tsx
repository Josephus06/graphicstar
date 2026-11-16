import { notFound } from 'next/navigation';
import { AddPoints } from '@/components/rewards/AddPoints';
import { MemberPointEntries, PointTotals, memberOptions } from '@/components/rewards/Panels';
import { PointForm } from '@/components/rewards/PointForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { storePoint, updatePoint } from '@/lib/rewards/actions/points';
import { requireRole } from '@/lib/rewards/auth';
import { formatPoints } from '@/lib/rewards/constants';
import { db, getMember, totalPoints, type PointRow } from '@/lib/rewards/db';

/** Points screens are identical for admin and staff apart from the URL prefix. */
type Area = 'admin' | 'staff';
type IdParams = { params: Promise<{ id: string }> };

export async function PointsIndexPage({ area }: { area: Area }) {
  await requireRole(area);
  return (
    <>
      <PageTitle
        title="Points"
        sub="Total points per member. Open a member to edit or delete individual entries."
        actions={<ButtonLink href={`/rewards/${area}/points/new`}>Add points</ButtonLink>}
      />
      <PointTotals area={area} />
    </>
  );
}

export async function PointsAddPage({ area }: { area: Area }) {
  await requireRole(area);
  return (
    <>
      <PageTitle title="Add points" />
      <AddPoints action={storePoint.bind(null, area)} />
    </>
  );
}

export async function MemberPointsPage({ area, params }: { area: Area } & IdParams) {
  await requireRole(area);
  const member = getMember(Number((await params).id));
  if (!member) notFound();
  return (
    <>
      <PageTitle
        title={member.name}
        sub={`Card no. ${member.card_no ?? '—'} · ${member.branch ?? 'No branch'} · ${formatPoints(totalPoints(member.id))} points`}
        actions={
          <ButtonLink href={`/rewards/${area}/points`} variant="outline">
            All members
          </ButtonLink>
        }
      />
      <MemberPointEntries area={area} member={member} />
    </>
  );
}

export async function PointEditPage({ area, params }: { area: Area } & IdParams) {
  await requireRole(area);
  const id = Number((await params).id);
  const point = db().prepare(`SELECT * FROM points WHERE id = ?`).get(id) as PointRow | undefined;
  if (!point) notFound();
  return (
    <>
      <PageTitle title="Edit points entry" sub={`Bill ${point.bill_no}`} />
      <Panel>
        <PointForm action={updatePoint.bind(null, area, id)} initial={point} members={memberOptions()} />
      </Panel>
    </>
  );
}
