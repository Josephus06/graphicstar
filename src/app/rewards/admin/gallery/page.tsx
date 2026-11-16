import { ConfirmButton } from '@/components/rewards/Form';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { deleteGalleryImage } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { db, type GalleryRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'Gallery' };

export default async function GalleryPage() {
  await requireRole('admin');
  const images = db().prepare(`SELECT * FROM galleries ORDER BY created_at DESC, id DESC`).all() as GalleryRow[];

  return (
    <>
      <PageTitle
        title="Gallery"
        sub="Promo images shown on member dashboards for the matching branch."
        actions={<ButtonLink href="/rewards/admin/gallery/new">Add image</ButtonLink>}
      />
      <Panel>
        {images.length === 0 ? (
          <p className="text-grey-muted">No images yet.</p>
        ) : (
          <ul className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
            {images.map((g) => (
              <li key={g.id} className="rounded-card bg-grey-panel p-3">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-grey-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl('gallery', g.image)!} alt={g.title ?? ''} className="h-full w-full object-cover" />
                </div>
                {g.title ? <p className="mt-2 font-semibold text-ink">{g.title}</p> : null}
                <p className="text-[13px] text-grey-muted">{g.branch ?? 'No branch'}</p>
                <div className="mt-1 text-right">
                  <ConfirmButton action={deleteGalleryImage} fields={{ id: g.id }} confirm="Delete this image?">
                    Delete
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
