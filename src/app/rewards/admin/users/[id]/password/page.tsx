import { notFound } from 'next/navigation';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { ChangePasswordForm } from '@/components/rewards/UserForms';
import { changePassword } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { db, type UserRow } from '@/lib/rewards/db';

export const metadata = { title: 'Change Password' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const id = Number((await params).id);
  const user = db().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  if (!user) notFound();
  return (
    <>
      <PageTitle title="Change password" sub={`${user.name} · ${user.email}`} />
      <Panel>
        <ChangePasswordForm action={changePassword.bind(null, id)} />
      </Panel>
    </>
  );
}
