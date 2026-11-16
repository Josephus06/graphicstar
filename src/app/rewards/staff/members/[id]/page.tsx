import { notFound } from 'next/navigation';
import { MemberForm } from '@/components/rewards/MemberForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { staffUpdateMember } from '@/lib/rewards/actions/members';
import { requireRole } from '@/lib/rewards/auth';
import { getMember } from '@/lib/rewards/db';

export const metadata = { title: 'Edit Member' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireRole('staff');
  const id = Number((await params).id);
  const member = getMember(id);
  if (!member || member.user_id !== staff.id) notFound();
  return (
    <>
      <PageTitle title="Edit member" sub={member.name} />
      <Panel>
        <MemberForm action={staffUpdateMember.bind(null, id)} mode="staff" submitLabel="Update member" initial={member} />
      </Panel>
    </>
  );
}
