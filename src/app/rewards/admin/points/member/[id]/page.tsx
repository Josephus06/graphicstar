import { MemberPointsPage } from '@/components/rewards/SharedPages';

export const metadata = { title: 'Member Points' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MemberPointsPage area="admin" params={params} />;
}
