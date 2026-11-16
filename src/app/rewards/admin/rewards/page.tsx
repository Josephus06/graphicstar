import { ConfirmButton } from '@/components/rewards/Form';
import { PageTitle, Panel, TextLink } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { deleteReward } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { BRANCHES } from '@/lib/rewards/constants';
import { db, type RewardRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'Manage Rewards' };

export default async function AdminRewardsPage() {
  await requireRole('admin');
  const byBranch = BRANCHES.map((b) => ({
    ...b,
    rewards: db().prepare(`SELECT * FROM rewards WHERE branch = ? ORDER BY points_required`).all(b.value) as RewardRow[],
  }));

  return (
    <>
      <PageTitle title="Rewards" actions={<ButtonLink href="/rewards/admin/rewards/new">Add reward</ButtonLink>} />
      <div className="grid gap-6">
        {byBranch.map((b) => (
          <Panel key={b.value} title={b.label}>
            {b.rewards.length === 0 ? (
              <p className="text-grey-muted">No rewards for this branch yet.</p>
            ) : (
              <ul className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
                {b.rewards.map((r) => (
                  <li key={r.id} className="flex flex-col rounded-card bg-grey-panel p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-grey-bg">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl('rewards', r.image)!} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <p className="mt-3 font-semibold text-ink">{r.name}</p>
                    {r.description ? <p className="mt-0.5 line-clamp-2 text-[13px] text-grey-muted">{r.description}</p> : null}
                    <p className="mt-1 text-[13px] font-bold text-blue">{r.points_required} points</p>
                    <div className="mt-auto flex justify-end pt-2">
                      <TextLink href={`/rewards/admin/rewards/${r.id}`}>Edit</TextLink>
                      <ConfirmButton action={deleteReward} fields={{ id: r.id }} confirm={`Delete "${r.name}"?`}>
                        Delete
                      </ConfirmButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}
