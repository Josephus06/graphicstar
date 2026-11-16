import { RewardsShell } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('member');
  return <RewardsShell user={user}>{children}</RewardsShell>;
}
