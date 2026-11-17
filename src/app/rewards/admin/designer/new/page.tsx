import { ProductEditor } from '@/components/designer/ProductEditor';
import { PageTitle } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Add Designer Product' };

export default async function Page() {
  await requireRole('admin');
  return (
    <>
      <PageTitle title="Add product" />
      <ProductEditor />
    </>
  );
}
