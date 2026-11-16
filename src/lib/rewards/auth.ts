import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db, type Role, type UserRow } from './db';

/**
 * Cookie sessions backed by the sessions table. The cookie holds a random
 * token; the table stores its SHA-256, so a leaked database cannot be replayed.
 * Lifetime is 120 minutes of inactivity (loyalty-gfx SESSION_LIFETIME=120).
 */

const COOKIE = 'gs_rewards_session';
const LIFETIME_MS = 120 * 60 * 1000;

const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export type SessionUser = Omit<UserRow, 'password'>;

export async function startSession(userId: number) {
  const token = crypto.randomBytes(32).toString('base64url');
  db().prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(Date.now());
  db().prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`).run(
    hash(token),
    userId,
    Date.now() + LIFETIME_MS,
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db().prepare(`DELETE FROM sessions WHERE id = ?`).run(hash(token));
  store.delete(COOKIE);
}

/** The signed-in user, or null. Cached per request. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const id = hash(token);
  const row = db()
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.branch, u.terms_accepted, u.terms_version, u.created_at, u.updated_at,
              s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    )
    .get(id) as (SessionUser & { expires_at: number }) | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  // Sliding expiry.
  db().prepare(`UPDATE sessions SET expires_at = ? WHERE id = ?`).run(Date.now() + LIFETIME_MS, id);
  const { expires_at: _expires, ...user } = row;
  return user;
});

export const homeFor = (role: Role) =>
  role === 'admin' ? '/rewards/admin' : role === 'staff' ? '/rewards/staff' : '/rewards/member';

/**
 * Gate for every protected page and action. Mirrors the Role middleware:
 * a user who strays into another role's area is sent to their own dashboard.
 * Staff and members who have not accepted the terms are sent to the terms page.
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect('/rewards');
  if (user.role !== role) redirect(homeFor(user.role));
  if (user.role !== 'admin' && !user.terms_accepted) redirect('/rewards/terms');
  return user;
}

/** Signed-in user of any role (terms page). */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect('/rewards');
  return user;
}
