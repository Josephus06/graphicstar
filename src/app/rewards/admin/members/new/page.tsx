import { MemberForm } from '@/components/rewards/MemberForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { adminCreateMember } from '@/lib/rewards/actions/members';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Add Member' };

export default async function Page() {
  await requireRole('admin');
  return (
    <>
      <PageTitle title="Add member" sub="Creates the member profile and their Rewards login." />
      <Panel>
        <MemberForm action={adminCreateMember} mode="admin-create" submitLabel="Create member" />
      </Panel>
    </>
  );
}
