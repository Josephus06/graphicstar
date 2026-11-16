import { GalleryForm } from '@/components/rewards/GalleryForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { addGalleryImage } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Add Gallery Image' };

export default async function Page() {
  await requireRole('admin');
  return (
    <>
      <PageTitle title="Add gallery image" />
      <Panel>
        <GalleryForm action={addGalleryImage} />
      </Panel>
    </>
  );
}
