import { notFound } from 'next/navigation';
import { ProductEditor } from '@/components/designer/ProductEditor';
import { PageTitle } from '@/components/rewards/Shell';
import { getProduct } from '@/lib/designer/store';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Edit Designer Product' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const product = getProduct(Number((await params).id));
  if (!product) notFound();
  return (
    <>
      <PageTitle title={product.name} sub={product.active ? 'Live on the website' : 'Hidden from customers'} />
      <ProductEditor key={product.id} product={product} />
    </>
  );
}
