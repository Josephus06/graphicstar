import { ConfirmButton } from '@/components/rewards/Form';
import { PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { adminDeleteMember } from '@/lib/rewards/actions/members';
import { requireRole } from '@/lib/rewards/auth';
import { listMembers } from '@/lib/rewards/db';

export const metadata = { title: 'Members' };

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole('admin');
  const q = ((await searchParams).q ?? '').trim();
  const like = `%${q}%`;
  const members = q
    ? listMembers(`WHERE m.name LIKE ? OR m.card_no LIKE ? OR m.email LIKE ? OR m.phone LIKE ?`, like, like, like, like)
    : listMembers();

  return (
    <>
      <PageTitle title="Members" sub={`${members.length} member${members.length === 1 ? '' : 's'}`} actions={<ButtonLink href="/rewards/admin/members/new">Add member</ButtonLink>} />
      <Panel>
        <form className="mb-4 flex gap-2">
          <label htmlFor="q" className="sr-only">
            Search members
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search name, card no., e-mail or phone"
            className="w-full rounded-xl border border-grey-line px-4 py-2.5 text-[15px] focus:border-blue focus:outline-none"
          />
        </form>
        <Table head={['#', 'Name', 'Form no.', 'Card no.', 'Email', 'Phone', 'Branch', 'ERP customer', '']} empty={members.length === 0}>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="text-grey-muted">{m.id}</td>
              <td className="font-medium">{m.name}</td>
              <td>{m.form_no ?? '—'}</td>
              <td>{m.card_no ?? '—'}</td>
              <td className="break-all">{m.email}</td>
              <td>{m.phone}</td>
              <td>{m.branch ?? '—'}</td>
              <td>{m.system_pk ? (m.erp_customer_name ?? `#${m.system_pk}`) : <span className="text-orange-dark">Not verified</span>}</td>
              <td className="whitespace-nowrap text-right">
                <TextLink href={`/rewards/admin/members/${m.id}`}>Edit</TextLink>
                <ConfirmButton action={adminDeleteMember} fields={{ id: m.id }} confirm={`Delete ${m.name}? Their points and redemptions are deleted too.`}>
                  Delete
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
