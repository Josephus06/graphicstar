import { ErpCustomerPicker } from '@/components/rewards/ErpCustomerPicker';
import { Alert } from '@/components/rewards/Form';
import { Badge, PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate, formatPoints } from '@/lib/rewards/constants';
import { listMembers, totalPoints } from '@/lib/rewards/db';
import { erpConfigured } from '@/lib/rewards/erp';

export const metadata = { title: 'Verification' };

/**
 * Members not yet linked to an ERP customer. Linking sets system_pk to the ERP customer's id;
 * the ERP sync then turns that customer's sales invoices into points.
 */
export default async function VerificationPage() {
  await requireRole('admin');
  const erpReady = erpConfigured();
  const pending = listMembers(`WHERE m.system_pk IS NULL OR TRIM(m.system_pk) = ''`);
  const verified = listMembers(`WHERE m.system_pk IS NOT NULL AND TRIM(m.system_pk) <> ''`)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 20);

  return (
    <>
      <PageTitle title="Verification" sub="Link each new customer to their ERP customer so their invoices earn points." />

      {!erpReady ? (
        <div className="mb-6">
          <Alert tone="info">
            The ERP connection isn&apos;t configured (ERP_API_URL / ERP_API_KEY), so customers can&apos;t be searched. You can
            still type an ERP customer ID; points arrive once the connection is set up.
          </Alert>
        </div>
      ) : null}

      <Panel title={`Awaiting verification (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="text-grey-muted">Everyone is verified. New registrations will appear here.</p>
        ) : (
          <ul className="grid gap-4">
            {pending.map((m) => (
              <li key={m.id} className="grid gap-4 rounded-card bg-grey-panel p-4 md:grid-cols-[1fr_minmax(0,460px)] md:items-start">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-semibold text-ink">{m.name}</span>
                    <Badge tone="pending">{m.user_role === 'member' ? 'Self-registered' : 'Enrolled by staff'}</Badge>
                  </p>
                  <p className="mt-1 break-all text-[14px] text-grey-muted">
                    {m.email} · {m.phone}
                  </p>
                  <p className="text-[14px] text-grey-muted">{m.address}</p>
                  <p className="text-[14px] text-grey-muted">
                    {m.branch ?? 'No branch'} · registered {formatDate(m.created_at)}
                  </p>
                </div>
                <ErpCustomerPicker memberId={m.id} memberName={m.name} erpReady={erpReady} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recently verified" className="mt-6">
        <Table head={['Member', 'ERP customer', 'Points', 'Updated', '']} empty={verified.length === 0}>
          {verified.map((m) => (
            <tr key={m.id}>
              <td>
                <span className="font-medium">{m.name}</span>
                <span className="block break-all text-[12px] text-grey-muted">{m.email}</span>
              </td>
              <td>
                {m.erp_customer_name ?? '—'}
                <span className="block font-mono text-[12px] text-grey-muted">ERP #{m.system_pk}</span>
              </td>
              <td className="font-semibold text-blue">{formatPoints(totalPoints(m.id))}</td>
              <td className="whitespace-nowrap">{formatDate(m.updated_at)}</td>
              <td className="text-right">
                <TextLink href={`/rewards/admin/members/${m.id}`}>Change</TextLink>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
