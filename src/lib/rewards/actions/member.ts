'use server';

import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { requireRole } from '../auth';
import { db, getMemberByUser, totalPoints, type RewardRow } from '../db';

const back = (message: string) => redirect(`/rewards/member/rewards?error=${encodeURIComponent(message)}`);

/** PHP uniqid('REWARD-'): prefix + 13 hex chars derived from the clock. */
function rewardCode() {
  const micros = BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000));
  const sec = (micros / 1_000_000n).toString(16).padStart(8, '0');
  const usec = (micros % 1_000_000n).toString(16).padStart(5, '0');
  return `REWARD-${sec}${usec}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

/**
 * Redeem a reward: the member needs at least points_required points. A
 * negative points row (bill_no REDEEM-{rewardId}) deducts them, and a pending
 * redemption with a unique code is created for the counter to scan.
 */
export async function redeemReward(formData: FormData) {
  const user = await requireRole('member');
  const member = getMemberByUser(user.id);
  if (!member) back('Member profile not found.');

  const rewardId = Number(formData.get('reward_id'));
  const reward = db().prepare(`SELECT * FROM rewards WHERE id = ?`).get(rewardId) as RewardRow | undefined;
  if (!reward) back('Reward not found.');

  // Only rewards offered to the member's own branch.
  if ((reward!.branch ?? '') !== (user.branch ?? '')) back('This reward is not available for your branch.');

  // A reward already waiting at the counter cannot be requested again.
  const pending = db()
    .prepare(`SELECT 1 FROM redemptions WHERE member_id = ? AND reward_id = ? AND status = 'pending'`)
    .get(member!.id, reward!.id);
  if (pending) back('This reward is already pending for redemption.');

  if (totalPoints(member!.id) < reward!.points_required) back('Not enough points.');

  const code = rewardCode();
  const redemptionId = db().transaction(() => {
    db()
      .prepare(`INSERT INTO points (bill_no, bill_amount, points, member_id, user_id, source) VALUES (?, 0, ?, ?, ?, 'redeem')`)
      .run(`REDEEM-${reward!.id}`, -reward!.points_required, member!.id, user.id);
    return db()
      .prepare(`INSERT INTO redemptions (member_id, reward_id, code, status) VALUES (?, ?, ?, 'pending')`)
      .run(member!.id, reward!.id, code).lastInsertRowid;
  })();

  redirect(`/rewards/member/redemptions/${redemptionId}`);
}
