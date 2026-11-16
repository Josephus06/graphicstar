'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { redeemReward } from '@/lib/rewards/actions/member';
import { formatPoints, rewardProgress } from '@/lib/rewards/constants';

export type RewardCardData = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  pointsRequired: number;
  pending: boolean;
};

/**
 * Reward cards with the loyalty-gfx button logic:
 * pending → "Pending…" (disabled, image greyed with an overlay);
 * enough points → "Redeem" (asks for confirmation first);
 * otherwise → "Not Enough Points" (disabled).
 */
export function RewardGrid({ rewards, totalPoints }: { rewards: RewardCardData[]; totalPoints: number }) {
  const [confirming, setConfirming] = useState<RewardCardData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <ul className="grid gap-5 xs:grid-cols-2 md:grid-cols-3">
        {rewards.map((reward) => {
          const percent = rewardProgress(totalPoints, reward.pointsRequired);
          const canRedeem = !reward.pending && totalPoints >= reward.pointsRequired;
          return (
            <li key={reward.id} className="flex flex-col rounded-media bg-white p-4 shadow-card">
              <button
                type="button"
                onClick={() => reward.image && setExpanded(reward.image)}
                className="relative block aspect-[4/3] overflow-hidden rounded-card bg-grey-bg"
                aria-label={`Enlarge image of ${reward.name}`}
                disabled={!reward.image}
              >
                {reward.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reward.image}
                    alt=""
                    className={cn('h-full w-full object-cover', reward.pending && 'opacity-50 grayscale')}
                  />
                ) : null}
                {reward.pending ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-[15px] font-bold uppercase tracking-cta text-white">
                    Pending for Redemption
                  </span>
                ) : null}
              </button>

              <h3 className="mt-4 text-[18px] font-semibold text-ink">{reward.name}</h3>
              {reward.description ? <p className="mt-1 text-[14px] text-grey-muted">{reward.description}</p> : null}
              <p className="mt-3 text-[14px] font-bold text-blue">Required: {reward.pointsRequired} Points</p>

              {/* PROGRESS BAR */}
              <div className="mt-2">
                <p className="text-[13px] text-grey-muted">
                  <b className="text-ink">{formatPoints(totalPoints)}</b> / {reward.pointsRequired} points
                </p>
                <div
                  className="mt-1.5 h-5 overflow-hidden rounded-full bg-grey-bg"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress toward ${reward.name}`}
                >
                  <div
                    className={cn(
                      'flex h-full items-center justify-center text-[11px] font-bold text-white transition-[width] duration-500',
                      percent === 100 ? 'bg-emerald-600' : percent >= 50 ? 'bg-orange' : 'bg-magenta',
                    )}
                    style={{ width: `${Math.max(percent, 8)}%` }}
                  >
                    {percent}%
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {reward.pending ? (
                  <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-grey-bg py-3 text-[12px] font-bold uppercase tracking-cta text-grey-muted">
                    Pending…
                  </button>
                ) : canRedeem ? (
                  <Button type="button" className="w-full" onClick={() => setConfirming(reward)}>
                    Redeem
                  </Button>
                ) : (
                  <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-grey-bg py-3 text-[12px] font-bold uppercase tracking-cta text-grey-muted">
                    Not Enough Points
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!confirming} onClose={() => setConfirming(null)} label="Redeem reward">
        {confirming ? (
          <div className="text-center">
            <h2 className="text-[20px] font-semibold text-ink">Redeem Reward</h2>
            {confirming.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={confirming.image} alt="" className="mx-auto mt-4 max-h-[200px] rounded-card object-contain" />
            ) : null}
            <p className="mt-4 text-[18px] font-semibold text-ink">{confirming.name}</p>
            <p className="mt-2 text-[15px] text-grey-muted">
              Are you sure you want to redeem this reward? {confirming.pointsRequired} points will be deducted.
            </p>
            <form action={redeemReward} className="mt-6 flex justify-center gap-3">
              <input type="hidden" name="reward_id" value={confirming.id} />
              <Button type="button" variant="outline" onClick={() => setConfirming(null)}>
                No
              </Button>
              <ConfirmRedeem />
            </form>
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!expanded} onClose={() => setExpanded(null)} label="Reward image" bare>
        {expanded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={expanded} alt="" className="max-h-[80vh] w-full rounded-card object-contain" />
        ) : null}
      </Dialog>
    </>
  );
}

function ConfirmRedeem() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="disabled:opacity-60">
      {pending ? 'Redeeming…' : 'Yes, Redeem'}
    </Button>
  );
}

function Dialog({
  open,
  onClose,
  label,
  bare,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  bare?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        'w-[min(92vw,520px)] rounded-media p-0 backdrop:bg-ink/60 backdrop:backdrop-blur-sm',
        bare ? 'w-[min(92vw,900px)] bg-transparent' : 'bg-white',
      )}
    >
      <div className={bare ? '' : 'p-6 sm:p-8'}>{children}</div>
    </dialog>
  );
}
