import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { PrintButton } from '@/components/rewards/PrintButton';
import { Badge } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate } from '@/lib/rewards/constants';
import { db, getMemberByUser, type RedemptionRow, type RewardRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'Redemption Receipt' };

export default async function RedemptionReceipt({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('member');
  const member = getMemberByUser(user.id);
  const { id } = await params;

  const redemption = db().prepare(`SELECT * FROM redemptions WHERE id = ?`).get(Number(id)) as RedemptionRow | undefined;
  if (!member || !redemption || redemption.member_id !== member.id) notFound();
  const reward = db().prepare(`SELECT * FROM rewards WHERE id = ?`).get(redemption.reward_id) as RewardRow;

  const qr = await QRCode.toDataURL(redemption.code, { width: 480, margin: 2 });
  const image = mediaUrl('rewards', reward.image);

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[480px] rounded-media bg-white p-7 text-center shadow-card print:shadow-none sm:p-9">
        <PrintButton />
        <h1 className="text-[24px] font-semibold tracking-tightest text-ink">Reward Redemption Receipt</h1>
        <p className="mt-2">
          <Badge tone={redemption.status === 'pending' ? 'pending' : 'done'}>{redemption.status}</Badge>
        </p>

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="mx-auto mt-6 max-h-[220px] rounded-card object-contain" />
        ) : null}
        <h2 className="mt-5 text-[20px] font-semibold text-ink">{reward.name}</h2>
        <p className="mt-1 text-[14px] text-grey-muted">
          {reward.points_required} points · {formatDate(redemption.created_at)}
        </p>

        <p className="mt-6 text-[15px] font-medium text-grey-muted">Show this QR code to redeem:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`QR code for redeem code ${redemption.code}`} width={240} height={240} className="mx-auto mt-3" />
        <p className="mt-2 text-[14px] text-grey-muted">
          Redeem Code: <strong className="font-mono text-ink">{redemption.code}</strong>
        </p>

        <ButtonLink href="/rewards/member/rewards" className="mt-8 print:hidden">
          Back to Rewards
        </ButtonLink>
      </div>
    </div>
  );
}
