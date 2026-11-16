import { RewardGrid, type RewardCardData } from '@/components/rewards/RewardGrid';
import { Badge, PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate, formatPoints } from '@/lib/rewards/constants';
import { db, getMemberByUser, totalPoints, type RewardRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'Redeemable Rewards' };

export default async function MemberRewardsPage() {
  const user = await requireRole('member');
  const member = getMemberByUser(user.id);
  const total = member ? totalPoints(member.id) : 0;

  const rewards = db().prepare(`SELECT * FROM rewards WHERE branch = ? ORDER BY points_required`).all(user.branch) as RewardRow[];

  const pending = new Set(
    member
      ? (
          db()
            .prepare(`SELECT reward_id FROM redemptions WHERE member_id = ? AND status = 'pending'`)
            .all(member.id) as { reward_id: number }[]
        ).map((r) => r.reward_id)
      : [],
  );

  const history = member
    ? (db()
        .prepare(
          `SELECT r.id, r.code, r.status, r.created_at, w.name AS reward
           FROM redemptions r JOIN rewards w ON w.id = r.reward_id
           WHERE r.member_id = ? ORDER BY r.created_at DESC, r.id DESC`,
        )
        .all(member.id) as { id: number; code: string; status: 'pending' | 'redeemed'; created_at: string; reward: string }[])
    : [];

  const cards: RewardCardData[] = rewards.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    image: mediaUrl('rewards', r.image),
    pointsRequired: r.points_required,
    pending: pending.has(r.id),
  }));

  return (
    <>
      <PageTitle title="Rewards" sub={`You have ${formatPoints(total)} points to spend.`} />

      {cards.length ? (
        <RewardGrid rewards={cards} totalPoints={total} />
      ) : (
        <Panel>
          <p className="text-grey-muted">No rewards have been posted for your branch yet.</p>
        </Panel>
      )}

      {history.length ? (
        <Panel title="My redemptions" className="mt-8">
          <Table head={['Date', 'Reward', 'Code', 'Status', '']}>
            {history.map((h) => (
              <tr key={h.id}>
                <td className="whitespace-nowrap">{formatDate(h.created_at)}</td>
                <td className="font-medium">{h.reward}</td>
                <td className="font-mono text-[13px]">{h.code}</td>
                <td>
                  <Badge tone={h.status === 'pending' ? 'pending' : 'done'}>{h.status}</Badge>
                </td>
                <td className="text-right">
                  {h.status === 'pending' ? <TextLink href={`/rewards/member/redemptions/${h.id}`}>Show QR</TextLink> : null}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      ) : null}
    </>
  );
}
