import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Designer } from '@/components/designer/Designer';
import { currentUser } from '@/lib/rewards/auth';
import { getProduct } from '@/lib/designer/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  return product ? { title: `${product.name} · Design Online`, description: product.description } : {};
}

export default async function DesignProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  const user = await currentUser();
  // Hidden products are only visible to admins, as a preview.
  if (!product || (!product.active && user?.role !== 'admin')) notFound();

  return (
    <div className="shell pb-24 pt-28 sm:pt-32">
      <nav aria-label="Breadcrumb" className="mb-6 text-[14px] text-grey-muted">
        <Link href="/design" className="hover:text-ink">
          Design Online
        </Link>
        <span aria-hidden="true"> › </span>
        <span className="text-ink">{product.name}</span>
      </nav>
      {!product.active ? (
        <p className="mb-6 rounded-xl bg-orange/10 px-4 py-3 text-[14px] font-medium text-orange-dark">
          Admin preview: this product is hidden from customers. Switch it on under Admin → Designer.
        </p>
      ) : null}
      <Designer product={product} />
    </div>
  );
}
