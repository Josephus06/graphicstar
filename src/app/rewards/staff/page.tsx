import { BranchSummary, RecentMembers } from '@/components/rewards/Panels';
import { PageTitle } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { requireRole } from '@/lib/rewards/auth';
import { listMembers } from '@/lib/rewards/db';

export const metadata = { title: 'Staff Dashboard' };

export default async function StaffDashboard() {
  const staff = await requireRole('staff');
  const recent = listMembers('WHERE m.user_id = ?', staff.id).slice(0, 5);
  return (
    <div className="grid gap-6">
      <PageTitle
        title="Dashboard"
        actions={
          <>
            <ButtonLink href="/rewards/staff/points/new">Add points</ButtonLink>
            <ButtonLink href="/rewards/staff/members/new" variant="outline">
              Enrol member
            </ButtonLink>
          </>
        }
      />
      <BranchSummary />
      <RecentMembers members={recent} title="Members you enrolled recently" />
    </div>
  );
}
