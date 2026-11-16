import { RewardsShell } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('admin');
  return <RewardsShell user={user}>{children}</RewardsShell>;
}
