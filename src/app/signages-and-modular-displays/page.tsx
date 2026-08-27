import type { Metadata } from 'next';
import { CategoryPage, categoryMetadata } from '@/components/products/CategoryPage';

const SLUG = 'signages-and-modular-displays';

export const metadata: Metadata = categoryMetadata(SLUG);

export default function Page() {
  return <CategoryPage slug={SLUG} />;
}
