import { MemberForm } from '@/components/rewards/MemberForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { staffCreateMember } from '@/lib/rewards/actions/members';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Enrol Member' };

export default async function Page() {
  const staff = await requireRole('staff');
  return (
    <>
      <PageTitle title="Enrol member" sub={`The member joins your branch: ${staff.branch ?? 'none set'}.`} />
      <Panel>
        <MemberForm action={staffCreateMember} mode="staff" submitLabel="Create member" />
      </Panel>
    </>
  );
}
