'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '../auth';
import { BRANCHES } from '../constants';
import { db, getMember } from '../db';
import { formValues, parseForm, type FormState } from '../forms';
import { checkUnique, memberFields, passwordConfirmed, rules, takenMsg } from '../validation';
import { ErpError, customerLabel, erpConfigured, getCustomer, searchCustomers, type ErpCustomer } from '../erp';
import { syncMemberPoints } from '../erp-sync';

const notice = (path: string, message: string) =>
  `${path}${path.includes('?') ? '&' : '?'}notice=${encodeURIComponent(message)}`;
const fail = (fieldErrors: Record<string, string>, formData: FormData): FormState => ({
  error: 'Please fix the highlighted fields.',
  fieldErrors,
  values: formValues(formData),
});

const branchValues = BRANCHES.map((b) => b.value) as [string, ...string[]];
const branch = z.enum(branchValues, { errorMap: () => ({ message: 'The branch field is required.' }) });

const memberSchema = z.object(memberFields);

function uniqueMemberChecks(d: { card_no?: string | null; email: string; phone: string }, ignoreId?: number) {
  return [
    ...(d.card_no
      ? [{ table: 'members' as const, column: 'card_no', value: d.card_no, ignoreId, field: 'card_no', message: takenMsg('card no') }]
      : []),
    { table: 'members' as const, column: 'email', value: d.email, ignoreId, field: 'email', message: takenMsg('email') },
    { table: 'members' as const, column: 'phone', value: d.phone, ignoreId, field: 'phone', message: takenMsg('phone') },
  ];
}

// ================================================================ ADMIN

const adminCreateSchema = memberSchema
  .extend({ system_pk: rules.required('system pk'), branch })
  .and(passwordConfirmed(6));

/** Admin enrolment: creates the member's own login (role member) and the member profile. */
export async function adminCreateMember(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(adminCreateSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;

  const taken = checkUnique([
    ...uniqueMemberChecks(d),
    { table: 'users', column: 'email', value: d.email, field: 'email', message: takenMsg('email') },
  ]);
  if (taken) return fail(taken, formData);

  const hashed = await bcrypt.hash(d.password, 12);
  db().transaction(() => {
    const user = db()
      .prepare(`INSERT INTO users (name, email, password, branch, role) VALUES (?, ?, ?, ?, 'member')`)
      .run(d.name, d.email, hashed, d.branch);
    db()
      .prepare(
        `INSERT INTO members (form_no, card_no, date, name, gender, email, address, dob, phone, system_pk, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(d.form_no, d.card_no, d.date, d.name, d.gender, d.email, d.address, d.dob, d.phone, d.system_pk, user.lastInsertRowid);
  })();

  revalidatePath('/rewards/admin');
  redirect(notice('/rewards/admin/members', 'Member created successfully with QR Code.'));
}

// Self-registered members have no form/card no. or ERP customer yet, so editing
// must not demand them; the ERP link is normally made on the Verification page.
const optionalText = z
  .string()
  .optional()
  .transform((v) => (v ? v : null));
const adminUpdateSchema = memberSchema.extend({
  form_no: optionalText,
  card_no: optionalText,
  system_pk: optionalText,
  branch: branch.optional(),
});

export async function adminUpdateMember(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const member = getMember(id);
  if (!member) redirect(notice('/rewards/admin/members', 'Member not found.'));
  const parsed = parseForm(adminUpdateSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;

  const ownLogin = member!.user_role === 'member';
  const taken = checkUnique([
    ...uniqueMemberChecks(d, id),
    ...(ownLogin
      ? [{ table: 'users' as const, column: 'email', value: d.email, ignoreId: member!.user_id, field: 'email', message: takenMsg('email') }]
      : []),
  ]);
  if (taken) return fail(taken, formData);
  if (d.system_pk) {
    const clash = db()
      .prepare(`SELECT name FROM members WHERE system_pk = ? AND id <> ? LIMIT 1`)
      .get(d.system_pk, id) as { name: string } | undefined;
    if (clash) return fail({ system_pk: `This ERP customer is already linked to ${clash.name}.` }, formData);
  }

  db().transaction(() => {
    db()
      .prepare(
        `UPDATE members SET form_no = ?, card_no = ?, date = ?, name = ?, gender = ?, email = ?, address = ?, dob = ?,
         phone = ?, erp_customer_name = CASE WHEN system_pk IS ? THEN erp_customer_name ELSE NULL END,
         system_pk = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(d.form_no, d.card_no, d.date, d.name, d.gender, d.email, d.address, d.dob, d.phone, d.system_pk, d.system_pk, id);
    // Keep the member's own login in step with the profile.
    if (ownLogin) {
      db()
        .prepare(`UPDATE users SET name = ?, email = ?, branch = COALESCE(?, branch), updated_at = datetime('now') WHERE id = ?`)
        .run(d.name, d.email, d.branch ?? null, member!.user_id);
    }
  })();

  revalidatePath('/rewards/admin');
  redirect(notice('/rewards/admin/members', 'Member updated successfully.'));
}

export async function adminDeleteMember(formData: FormData) {
  await requireRole('admin');
  const member = getMember(Number(formData.get('id')));
  if (member) {
    db().transaction(() => {
      db().prepare(`DELETE FROM members WHERE id = ?`).run(member.id);
      // Remove the member's own login too, so it cannot sign in to an empty account.
      if (member.user_role === 'member') db().prepare(`DELETE FROM users WHERE id = ?`).run(member.user_id);
    })();
  }
  revalidatePath('/rewards/admin');
  redirect(notice('/rewards/admin/members', 'Member deleted successfully.'));
}

// ================================================================ STAFF

/** Staff enrolment: a member profile owned by the staff account (no login). */
export async function staffCreateMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireRole('staff');
  const parsed = parseForm(memberSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;

  const taken = checkUnique(uniqueMemberChecks(d));
  if (taken) return fail(taken, formData);

  db()
    .prepare(
      `INSERT INTO members (form_no, card_no, date, name, gender, email, address, dob, phone, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(d.form_no, d.card_no, d.date, d.name, d.gender, d.email, d.address, d.dob, d.phone, staff.id);

  revalidatePath('/rewards/staff');
  redirect(notice('/rewards/staff/members', 'Member created successfully.'));
}

export async function staffUpdateMember(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireRole('staff');
  const member = getMember(id);
  if (!member || member.user_id !== staff.id) redirect(notice('/rewards/staff/members', 'Member not found.'));
  const parsed = parseForm(memberSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;

  const taken = checkUnique(uniqueMemberChecks(d, id));
  if (taken) return fail(taken, formData);

  db()
    .prepare(
      `UPDATE members SET form_no = ?, card_no = ?, date = ?, name = ?, gender = ?, email = ?, address = ?, dob = ?,
       phone = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(d.form_no, d.card_no, d.date, d.name, d.gender, d.email, d.address, d.dob, d.phone, id);

  revalidatePath('/rewards/staff');
  redirect(notice('/rewards/staff/members', 'Member updated successfully.'));
}

// ================================================================ VERIFICATION

export type ErpSearchResult = { ok: true; customers: ErpCustomer[] } | { ok: false; error: string };

/** Customer picker on the Verification page: searches the ERP by name, company, code or id. */
export async function searchErpCustomers(q: string): Promise<ErpSearchResult> {
  await requireRole('admin');
  if (q.trim().length < 2) return { ok: true, customers: [] };
  try {
    return { ok: true, customers: await searchCustomers(q.trim()) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Link a member to an ERP customer (members.system_pk = ERP customers.id). The ERP sync then
 * reads that customer's sales invoices and awards points; this member's invoices are pulled
 * straight away.
 */
export async function verifyMember(formData: FormData) {
  await requireRole('admin');
  const page = '/rewards/admin/verification';
  const id = Number(formData.get('id'));
  const erpId = String(formData.get('system_pk') ?? '').trim();
  const member = getMember(id);
  const err = (message: string) => redirect(`${page}?error=${encodeURIComponent(message)}`);

  if (!member) err('Member not found.');
  if (!erpId) err(`Choose the ERP customer for ${member!.name}.`);

  let label: string | null = null;
  if (erpConfigured()) {
    try {
      label = customerLabel(await getCustomer(erpId));
    } catch (error) {
      err(error instanceof ErpError ? `ERP customer ${erpId}: ${error.message}` : 'The ERP lookup failed.');
    }
  }

  const clash = db()
    .prepare(`SELECT name FROM members WHERE system_pk = ? AND id <> ? LIMIT 1`)
    .get(erpId, id) as { name: string } | undefined;
  if (clash) err(`That ERP customer is already linked to ${clash.name}.`);

  db()
    .prepare(`UPDATE members SET system_pk = ?, erp_customer_name = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(erpId, label, id);

  let message = `${member!.name} is verified and linked to ERP customer ${label ?? erpId}.`;
  if (erpConfigured()) {
    const report = await syncMemberPoints(id);
    message += report.ok ? ` ${report.lines[0].replace(/^✔ [^:]+: /, '')}.` : ` ${report.lines[0]} Points will arrive on the next sync.`;
  } else {
    message += ' Points will arrive once the ERP connection is configured.';
  }

  revalidatePath('/rewards');
  redirect(`${page}?notice=${encodeURIComponent(message)}`);
}
