import { PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';
import { listMembers } from '@/lib/rewards/db';

export const metadata = { title: 'Members' };

/** Staff see only the members they enrolled. */
export default async function StaffMembersPage() {
  const staff = await requireRole('staff');
  const members = listMembers('WHERE m.user_id = ?', staff.id);
  return (
    <>
      <PageTitle title="My members" sub={`${members.length} enrolled by you`} actions={<ButtonLink href="/rewards/staff/members/new">Enrol member</ButtonLink>} />
      <Panel>
        <Table head={['Name', 'Form no.', 'Card no.', 'Email', 'Phone', 'Enrolled', '']} empty={members.length === 0}>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="font-medium">{m.name}</td>
              <td>{m.form_no ?? '—'}</td>
              <td>{m.card_no ?? '—'}</td>
              <td className="break-all">{m.email}</td>
              <td>{m.phone}</td>
              <td className="whitespace-nowrap">{formatDate(m.date)}</td>
              <td className="text-right">
                <TextLink href={`/rewards/staff/members/${m.id}`}>Edit</TextLink>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
