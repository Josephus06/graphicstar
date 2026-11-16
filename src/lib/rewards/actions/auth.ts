'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { endSession, homeFor, requireUser, startSession } from '../auth';
import { BRANCHES } from '../constants';
import { db, type UserRow } from '../db';
import { formValues, parseForm, type FormState } from '../forms';
import { checkUnique, email, memberFields, passwordConfirmed, rules, takenMsg } from '../validation';

// ---------------------------------------------------------------- login

const loginSchema = z.object({
  email,
  password: z.string().min(6, 'The password must be at least 6 characters.'),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(loginSchema, formData);
  if (parsed.state) return parsed.state;

  const user = db().prepare(`SELECT * FROM users WHERE email = ? COLLATE NOCASE`).get(parsed.data.email) as
    | UserRow
    | undefined;
  // Laravel writes $2y$ bcrypt hashes; bcryptjs reads them once the prefix is normalised.
  const ok = user && (await bcrypt.compare(parsed.data.password, user.password.replace(/^\$2y\$/, '$2a$')));
  if (!user || !ok) return { error: 'Invalid credentials.', values: formValues(formData) };

  await startSession(user.id);

  // Admins skip the terms; staff and members must accept them first.
  if (user.role !== 'admin' && !user.terms_accepted) redirect('/rewards/terms');
  redirect(homeFor(user.role));
}

export async function logout() {
  await endSession();
  redirect('/');
}

// ---------------------------------------------------------------- public member registration

const branchValues = BRANCHES.map((b) => b.value) as [string, ...string[]];

const registerSchema = z
  .object({
    name: rules.required('name').pipe(z.string().max(255)),
    email,
    branch: z.enum(branchValues, { errorMap: () => ({ message: 'The branch field is required.' }) }),
    gender: memberFields.gender,
    address: memberFields.address,
    dob: memberFields.dob,
    phone: memberFields.phone,
  })
  .and(passwordConfirmed(6));

/**
 * Public sign-up. Form no., card no. and the ERP customer are left empty: the
 * member waits on the admin Verification page until their ERP customer is linked.
 */
export async function registerMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(registerSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;

  const taken = checkUnique([
    { table: 'users', column: 'email', value: d.email, field: 'email', message: takenMsg('email') },
    { table: 'members', column: 'email', value: d.email, field: 'email', message: takenMsg('email') },
    { table: 'members', column: 'phone', value: d.phone, field: 'phone', message: takenMsg('phone') },
  ]);
  if (taken) return { error: 'Please fix the highlighted fields.', fieldErrors: taken, values: formValues(formData) };

  const hashed = await bcrypt.hash(d.password, 12);
  db().transaction(() => {
    const user = db()
      .prepare(`INSERT INTO users (name, email, password, branch, role) VALUES (?, ?, ?, ?, 'member')`)
      .run(d.name, d.email, hashed, d.branch);
    db()
      .prepare(
        `INSERT INTO members (date, name, gender, email, address, dob, phone, user_id)
         VALUES (date('now'), ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(d.name, d.gender, d.email, d.address, d.dob, d.phone, user.lastInsertRowid);
  })();

  redirect(`/rewards?notice=${encodeURIComponent('Registration successful. You can log in now. Points from your purchases appear once our team verifies your account.')}`);
}

// ---------------------------------------------------------------- terms

export async function acceptTerms(formData: FormData) {
  const user = await requireUser();
  if (formData.get('agree') !== 'on') redirect('/rewards/terms?error=1');
  const version = String(formData.get('terms_version') || 'default');
  db()
    .prepare(`UPDATE users SET terms_accepted = 1, terms_version = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(version, user.id);
  redirect(homeFor(user.role));
}
