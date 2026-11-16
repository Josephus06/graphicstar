import { ConfirmButton } from '@/components/rewards/Form';
import { Badge, PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { deleteUser } from '@/lib/rewards/actions/admin';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';
import { db, type UserRow } from '@/lib/rewards/db';

export const metadata = { title: 'Users' };

export default async function UsersPage() {
  const me = await requireRole('admin');
  const users = db()
    .prepare(`SELECT id, name, email, role, branch, terms_accepted, created_at FROM users ORDER BY role, name`)
    .all() as Omit<UserRow, 'password'>[];

  return (
    <>
      <PageTitle title="Users" sub="Admin, staff and member logins." actions={<ButtonLink href="/rewards/admin/users/new">Register staff</ButtonLink>} />
      <Panel>
        <Table head={['Name', 'Email', 'Role', 'Branch', 'Terms', 'Created', '']} empty={users.length === 0}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="font-medium">{u.name}</td>
              <td className="break-all">{u.email}</td>
              <td>
                <Badge tone="neutral">{u.role}</Badge>
              </td>
              <td>{u.branch ?? '—'}</td>
              <td>{u.role === 'admin' ? '—' : u.terms_accepted ? 'Accepted' : 'Not yet'}</td>
              <td className="whitespace-nowrap">{formatDate(u.created_at)}</td>
              <td className="whitespace-nowrap text-right">
                <TextLink href={`/rewards/admin/users/${u.id}`}>Edit</TextLink>
                <TextLink href={`/rewards/admin/users/${u.id}/password`}>Password</TextLink>
                {u.id !== me.id ? (
                  <ConfirmButton action={deleteUser} fields={{ id: u.id }} confirm={`Delete ${u.name}? Members they enrolled are deleted too.`}>
                    Delete
                  </ConfirmButton>
                ) : null}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
