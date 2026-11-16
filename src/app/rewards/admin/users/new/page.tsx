import { PageTitle, Panel } from '@/components/rewards/Shell';
import { StaffRegisterForm } from '@/components/rewards/UserForms';
import { registerStaff } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Register Staff' };

export default async function Page() {
  await requireRole('admin');
  return (
    <>
      <PageTitle title="Register staff" sub="Staff can enrol members and record points for any member." />
      <Panel>
        <StaffRegisterForm action={registerStaff} />
      </Panel>
    </>
  );
}
