'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { currentUser, requireRole } from '../auth';
import { db, findMemberByKey, getMember, totalPoints, type PointRow } from '../db';
import { parseForm, type FormState } from '../forms';
import { rules } from '../validation';

export type MemberLookup =
  | {
      ok: true;
      member: {
        id: number;
        name: string;
        email: string;
        gender: string;
        address: string;
        phone: string;
        card_no: string | null;
        dob: string;
        date: string;
        form_no: string | null;
        total_points: number;
        branch: string | null;
      };
    }
  | { ok: false; error: string };

/** "Search member" on the Add Points screen: card no, phone or e-mail. */
export async function lookupMember(query: string): Promise<MemberLookup> {
  const user = await currentUser();
  if (!user || user.role === 'member') return { ok: false, error: 'Unauthorized.' };
  const key = query.trim();
  if (!key) return { ok: false, error: 'Please enter a card number, or phone to search.' };
  const m = findMemberByKey(key);
  if (!m) return { ok: false, error: 'Member not found.' };
  return {
    ok: true,
    member: {
      id: m.id,
      name: m.name,
      email: m.email,
      gender: m.gender,
      address: m.address,
      phone: m.phone,
      card_no: m.card_no,
      dob: m.dob,
      date: m.date,
      form_no: m.form_no,
      total_points: totalPoints(m.id),
      branch: m.branch,
    },
  };
}

const pointSchema = z.object({
  member_id: rules.numeric('member id'),
  bill_no: rules.required('bill no'),
  bill_amount: rules.numeric('bill amount'),
  points: rules.numeric('points'),
});

type Area = 'admin' | 'staff';
const base = (area: Area) => `/rewards/${area}/points`;

export async function storePoint(area: Area, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole(area);
  const parsed = parseForm(pointSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;
  if (!getMember(d.member_id)) return { error: 'The selected member id is invalid.', fieldErrors: { member_id: 'Search for a member first.' } };

  db()
    .prepare(`INSERT INTO points (member_id, bill_no, bill_amount, points, user_id) VALUES (?, ?, ?, ?, ?)`)
    .run(d.member_id, d.bill_no, d.bill_amount, d.points, user.id);

  revalidatePath(base(area));
  return { success: 'Point saved successfully!' };
}

export async function updatePoint(area: Area, id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole(area);
  const point = db().prepare(`SELECT * FROM points WHERE id = ?`).get(id) as PointRow | undefined;
  if (!point) redirect(`${base(area)}?notice=${encodeURIComponent('Point record not found.')}`);
  const parsed = parseForm(pointSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;
  if (!getMember(d.member_id)) return { error: 'The selected member id is invalid.' };

  db()
    .prepare(
      `UPDATE points SET member_id = ?, bill_no = ?, bill_amount = ?, points = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(d.member_id, d.bill_no, d.bill_amount, d.points, id);

  revalidatePath(base(area));
  redirect(`${base(area)}/member/${d.member_id}?notice=${encodeURIComponent('Point record updated successfully')}`);
}

export async function deletePoint(area: Area, formData: FormData) {
  await requireRole(area);
  const id = Number(formData.get('id'));
  const point = db().prepare(`SELECT member_id FROM points WHERE id = ?`).get(id) as { member_id: number } | undefined;
  db().prepare(`DELETE FROM points WHERE id = ?`).run(id);
  revalidatePath(base(area));
  redirect(
    `${point ? `${base(area)}/member/${point.member_id}` : base(area)}?notice=${encodeURIComponent('Point record deleted successfully')}`,
  );
}
