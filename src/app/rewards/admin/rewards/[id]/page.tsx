import { notFound } from 'next/navigation';
import { RewardForm } from '@/components/rewards/RewardForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { updateReward } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { db, type RewardRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'Edit Reward' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const id = Number((await params).id);
  const reward = db().prepare(`SELECT * FROM rewards WHERE id = ?`).get(id) as RewardRow | undefined;
  if (!reward) notFound();
  return (
    <>
      <PageTitle title="Edit reward" sub={reward.name} />
      <Panel>
        <RewardForm action={updateReward.bind(null, id)} initial={reward} currentImage={mediaUrl('rewards', reward.image)} />
      </Panel>
    </>
  );
}
