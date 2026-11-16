import { PointEditPage } from '@/components/rewards/SharedPages';

export const metadata = { title: 'Edit Points' };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PointEditPage area="admin" params={params} />;
}
