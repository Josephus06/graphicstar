'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '../auth';
import { BRANCHES } from '../constants';
import { db, type GalleryRow, type RewardRow, type UserRow } from '../db';
import { syncMemberPoints, type SyncReport } from '../erp-sync';
import { formValues, parseForm, type FormState } from '../forms';
import { checkImage, deleteImage, saveImage } from '../uploads';
import { checkUnique, email, rules, takenMsg } from '../validation';

const notice = (path: string, message: string) =>
  `${path}${path.includes('?') ? '&' : '?'}notice=${encodeURIComponent(message)}`;
const branchValues = BRANCHES.map((b) => b.value) as [string, ...string[]];
const branch = z.enum(branchValues, { errorMap: () => ({ message: 'The branch field is required.' }) });

// ================================================================ REWARDS

const REWARD_IMAGE = { types: ['image/jpeg', 'image/png'], maxBytes: 4096 * 1024 };

const rewardSchema = z.object({
  name: rules.required('name'),
  points_required: rules.numeric('points required'),
  branch,
  description: z.string().optional(),
});

export async function createReward(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(rewardSchema, formData);
  const image = formData.get('image') as File | null;
  const imageError = checkImage(image, REWARD_IMAGE, true);
  if (parsed.state || imageError) {
    const state = parsed.state ?? { error: 'Please fix the highlighted fields.', fieldErrors: {}, values: formValues(formData) };
    if (imageError) state.fieldErrors = { ...state.fieldErrors, image: imageError };
    return state;
  }
  const d = parsed.data;
  const file = await saveImage('rewards', image!);
  db()
    .prepare(`INSERT INTO rewards (name, image, points_required, branch, description) VALUES (?, ?, ?, ?, ?)`)
    .run(d.name, file, Math.round(d.points_required), d.branch, d.description || null);
  revalidatePath('/rewards');
  redirect(notice('/rewards/admin/rewards', 'Reward added successfully!'));
}

export async function updateReward(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const reward = db().prepare(`SELECT * FROM rewards WHERE id = ?`).get(id) as RewardRow | undefined;
  if (!reward) redirect(notice('/rewards/admin/rewards', 'Reward not found.'));
  const parsed = parseForm(rewardSchema, formData);
  const image = formData.get('image') as File | null;
  const imageError = checkImage(image, REWARD_IMAGE, false);
  if (parsed.state || imageError) {
    const state = parsed.state ?? { error: 'Please fix the highlighted fields.', fieldErrors: {}, values: formValues(formData) };
    if (imageError) state.fieldErrors = { ...state.fieldErrors, image: imageError };
    return state;
  }
  const d = parsed.data;
  let file = reward!.image;
  if (image && image.size > 0) {
    deleteImage('rewards', reward!.image);
    file = await saveImage('rewards', image);
  }
  db()
    .prepare(
      `UPDATE rewards SET name = ?, points_required = ?, branch = ?, description = ?, image = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(d.name, Math.round(d.points_required), d.branch, d.description || null, file, id);
  revalidatePath('/rewards');
  redirect(notice('/rewards/admin/rewards', 'Reward updated successfully'));
}

export async function deleteReward(formData: FormData) {
  await requireRole('admin');
  const reward = db().prepare(`SELECT * FROM rewards WHERE id = ?`).get(Number(formData.get('id'))) as RewardRow | undefined;
  if (reward) {
    deleteImage('rewards', reward.image);
    db().prepare(`DELETE FROM rewards WHERE id = ?`).run(reward.id);
  }
  revalidatePath('/rewards');
  redirect(notice('/rewards/admin/rewards', 'Reward deleted successfully'));
}

// ================================================================ REDEMPTIONS

export async function markRedeemed(formData: FormData) {
  await requireRole('admin');
  db()
    .prepare(`UPDATE redemptions SET status = 'redeemed', updated_at = datetime('now') WHERE id = ?`)
    .run(Number(formData.get('id')));
  revalidatePath('/rewards');
  const back = String(formData.get('back') || '/rewards/admin/redemptions');
  redirect(notice(back.startsWith('/rewards/admin/') ? back : '/rewards/admin/redemptions', 'Reward marked as redeemed.'));
}

// ================================================================ USERS (staff accounts)

const staffSchema = z.object({
  name: rules.required('name').pipe(z.string().max(255)),
  email,
  password: z.string().min(6, 'The password must be at least 6 characters.'),
  branch,
});

export async function registerStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(staffSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;
  const taken = checkUnique([{ table: 'users', column: 'email', value: d.email, field: 'email', message: takenMsg('email') }]);
  if (taken) return { error: 'Please fix the highlighted fields.', fieldErrors: taken, values: formValues(formData) };
  db()
    .prepare(`INSERT INTO users (name, email, password, branch, role) VALUES (?, ?, ?, ?, 'staff')`)
    .run(d.name, d.email, await bcrypt.hash(d.password, 12), d.branch);
  redirect(notice('/rewards/admin/users', 'Registration successful.'));
}

const userUpdateSchema = z.object({
  name: rules.required('name').pipe(z.string().max(255)),
  email,
  branch: rules.required('branch').pipe(z.string().max(255)),
});

export async function updateUser(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(userUpdateSchema, formData);
  if (parsed.state) return parsed.state;
  const d = parsed.data;
  const user = db().prepare(`SELECT id FROM users WHERE id = ?`).get(id);
  if (!user) return { error: 'User not found!' };
  const taken = checkUnique([
    { table: 'users', column: 'email', value: d.email, ignoreId: id, field: 'email', message: takenMsg('email') },
  ]);
  if (taken) return { error: 'Please fix the highlighted fields.', fieldErrors: taken, values: formValues(formData) };
  db()
    .prepare(`UPDATE users SET name = ?, email = ?, branch = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(d.name, d.email, d.branch, id);
  redirect(notice('/rewards/admin/users', 'User updated successfully!'));
}

export async function deleteUser(formData: FormData) {
  const admin = await requireRole('admin');
  const id = Number(formData.get('id'));
  if (id === admin.id) redirect(notice('/rewards/admin/users', 'You cannot delete your own account.'));
  const user = db().prepare(`SELECT id FROM users WHERE id = ?`).get(id);
  if (!user) redirect(notice('/rewards/admin/users', 'User not found!'));
  db().prepare(`DELETE FROM users WHERE id = ?`).run(id);
  redirect(notice('/rewards/admin/users', 'User deleted successfully!'));
}

const passwordSchema = z
  .object({
    password: z.string().min(1, 'The current password field is required.'),
    new_password: z.string().min(8, 'The new password must be at least 8 characters.'),
    new_password_confirmation: z.string(),
  })
  .refine((v) => v.new_password === v.new_password_confirmation, {
    message: 'The new password and confirmation do not match.',
    path: ['new_password'],
  });

/** As in loyalty-gfx, the admin must supply the account's current password. */
export async function changePassword(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(passwordSchema, formData);
  if (parsed.state) return parsed.state;
  const user = db().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  if (!user) return { error: 'User not found!' };
  const ok = await bcrypt.compare(parsed.data.password, user.password.replace(/^\$2y\$/, '$2a$'));
  if (!ok) return { error: 'The current password is incorrect.', fieldErrors: { password: 'The current password is incorrect.' } };
  db()
    .prepare(`UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(await bcrypt.hash(parsed.data.new_password, 12), id);
  // Sign the account out everywhere.
  db().prepare(`DELETE FROM sessions WHERE user_id = ?`).run(id);
  redirect(notice('/rewards/admin/users', `Password for user ${user.name} has been changed successfully.`));
}

// ================================================================ GALLERY

const GALLERY_IMAGE = { types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] };

const gallerySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  branch,
});

export async function addGalleryImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole('admin');
  const parsed = parseForm(gallerySchema, formData);
  const image = formData.get('image') as File | null;
  const imageError = checkImage(image, GALLERY_IMAGE, true);
  if (parsed.state || imageError) {
    const state = parsed.state ?? { error: 'Please fix the highlighted fields.', fieldErrors: {}, values: formValues(formData) };
    if (imageError) state.fieldErrors = { ...state.fieldErrors, image: imageError };
    return state;
  }
  const d = parsed.data;
  const file = await saveImage('gallery', image!);
  db()
    .prepare(`INSERT INTO galleries (image, title, description, branch) VALUES (?, ?, ?, ?)`)
    .run(file, d.title || null, d.description || null, d.branch);
  revalidatePath('/rewards');
  redirect(notice('/rewards/admin/gallery', 'Image added to gallery successfully.'));
}

export async function deleteGalleryImage(formData: FormData) {
  await requireRole('admin');
  const row = db().prepare(`SELECT * FROM galleries WHERE id = ?`).get(Number(formData.get('id'))) as GalleryRow | undefined;
  if (row) {
    deleteImage('gallery', row.image);
    db().prepare(`DELETE FROM galleries WHERE id = ?`).run(row.id);
  }
  revalidatePath('/rewards');
  redirect(notice('/rewards/admin/gallery', 'Image deleted.'));
}

// ================================================================ ERP SYNC

export async function runErpSync(_prev: SyncReport | null): Promise<SyncReport> {
  await requireRole('admin');
  const report = await syncMemberPoints();
  revalidatePath('/rewards');
  return report;
}
