import { notFound } from 'next/navigation';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { UserEditForm } from '@/components/rewards/UserForms';
import { updateUser } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { db, type UserRow } from '@/lib/rewards/db';

export const metadata = { title: 'Edit User' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const id = Number((await params).id);
  const user = db().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  if (!user) notFound();
  return (
    <>
      <PageTitle title="Edit user" sub={`${user.name} · ${user.role}`} />
      <Panel>
        <UserEditForm action={updateUser.bind(null, id)} initial={user} />
      </Panel>
    </>
  );
}
