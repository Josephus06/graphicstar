import { RewardForm } from '@/components/rewards/RewardForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { createReward } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Add Reward' };

export default async function Page() {
  await requireRole('admin');
  return (
    <>
      <PageTitle title="Add reward" />
      <Panel>
        <RewardForm action={createReward} />
      </Panel>
    </>
  );
}
