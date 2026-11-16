import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { headers } from 'next/headers';
import { MemberForm } from '@/components/rewards/MemberForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { adminUpdateMember } from '@/lib/rewards/actions/members';
import { requireRole } from '@/lib/rewards/auth';
import { formatPoints } from '@/lib/rewards/constants';
import { getMember, totalPoints } from '@/lib/rewards/db';

export const metadata = { title: 'Edit Member' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const id = Number((await params).id);
  const member = getMember(id);
  if (!member) notFound();

  // Member QR: points at /rewards/q/{id}, which returns their name and available points.
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_SITE_URL
    : `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;
  const qrUrl = `${origin}/rewards/q/${member.id}`;
  const qr = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2 });

  return (
    <>
      <PageTitle title={member.name} sub={`${formatPoints(totalPoints(member.id))} points · ${member.branch ?? 'No branch'}`} />
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Panel>
          <MemberForm
            action={adminUpdateMember.bind(null, id)}
            mode="admin-edit"
            submitLabel="Update member"
            initial={member}
            branchEditable={member.user_role === 'member'}
          />
        </Panel>
        <Panel title="Member QR code" className="h-fit text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code for ${member.name}`} width={220} height={220} className="mx-auto" />
          <a href={qr} download={`member_qr_${member.id}.png`} className="mt-3 inline-block text-[14px] font-semibold text-blue">
            Download PNG
          </a>
          <p className="mt-2 break-all text-[12px] text-grey-muted">{qrUrl}</p>
        </Panel>
      </div>
    </>
  );
}
