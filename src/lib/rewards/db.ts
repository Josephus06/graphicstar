import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

/**
 * The Rewards database: one SQLite file under REWARDS_DATA_DIR (default
 * ./data). The schema is applied on first use, and an initial admin is
 * created from REWARDS_ADMIN_EMAIL / REWARDS_ADMIN_PASSWORD when the users
 * table has no admin yet.
 */

export const dataDir = path.resolve(process.env.REWARDS_DATA_DIR ?? path.join(process.cwd(), 'data'));

declare global {
  // Survive dev-server hot reloads without opening a new handle each time.
  var __rewardsDb: Database.Database | undefined;
}

function open(): Database.Database {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, 'rewards.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(path.join(process.cwd(), 'src/lib/rewards/schema.sql'), 'utf8'));
  migrate(db);
  seedAdmin(db);
  return db;
}

/**
 * Databases created before self-registration dropped form/card no. still have
 * those columns as NOT NULL. SQLite cannot relax a constraint in place, so the
 * members table is rebuilt with the current definition, keeping every row and id.
 */
function migrate(db: Database.Database) {
  relaxMemberNumbers(db);

  // Columns added after the first release.
  const has = (table: string, column: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some((c) => c.name === column);
  if (!has('points', 'source')) {
    db.exec(`ALTER TABLE points ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'`);
    db.exec(`UPDATE points SET source = 'redeem' WHERE bill_no LIKE 'REDEEM-%' AND points < 0`);
  }
  if (!has('members', 'erp_customer_name')) db.exec(`ALTER TABLE members ADD COLUMN erp_customer_name TEXT`);
}

function relaxMemberNumbers(db: Database.Database) {
  const cols = db.prepare(`PRAGMA table_info(members)`).all() as { name: string; notnull: number }[];
  if (!cols.some((c) => c.name === 'card_no' && c.notnull)) return;

  const current = (db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'members'`).get() as { sql: string }).sql;
  const relaxed = current
    .replace(/form_no(\s+)TEXT\s+NOT NULL/, 'form_no$1TEXT')
    .replace(/card_no(\s+)TEXT\s+NOT NULL UNIQUE/, 'card_no$1TEXT    UNIQUE')
    .replace(/CREATE TABLE (IF NOT EXISTS )?"?members"?/, 'CREATE TABLE members_new');

  db.pragma('foreign_keys = OFF');
  db.transaction(() => {
    db.exec(relaxed);
    db.exec(`INSERT INTO members_new SELECT * FROM members`);
    db.exec(`DROP TABLE members`);
    db.exec(`ALTER TABLE members_new RENAME TO members`);
  })();
  db.pragma('foreign_keys = ON');
}

function seedAdmin(db: Database.Database) {
  const email = process.env.REWARDS_ADMIN_EMAIL;
  const password = process.env.REWARDS_ADMIN_PASSWORD;
  if (!email || !password) return;
  const hasAdmin = db.prepare(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`).get();
  if (hasAdmin) return;
  db.prepare(
    `INSERT INTO users (name, email, password, role, branch, terms_accepted)
     VALUES (?, ?, ?, 'admin', ?, 1)`,
  ).run('Admin User', email, bcrypt.hashSync(password, 12), 'Cebu Graphicstar Imaging Corp - Head Office');
}

export function db(): Database.Database {
  globalThis.__rewardsDb ??= open();
  return globalThis.__rewardsDb;
}

// ---------------------------------------------------------------- row types

export type Role = 'admin' | 'staff' | 'member';

export type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  branch: string | null;
  terms_accepted: number;
  terms_version: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberRow = {
  id: number;
  form_no: string | null;
  card_no: string | null;
  date: string;
  name: string;
  gender: 'M' | 'F';
  email: string;
  address: string;
  dob: string;
  phone: string;
  system_pk: string | null;
  erp_customer_name: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type PointRow = {
  id: number;
  user_id: number;
  member_id: number;
  bill_no: string;
  bill_amount: number;
  points: number;
  source: 'manual' | 'erp' | 'redeem';
  created_at: string;
  updated_at: string;
};

export type RewardRow = {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  points_required: number;
  branch: string | null;
  created_at: string;
  updated_at: string;
};

export type RedemptionRow = {
  id: number;
  member_id: number;
  reward_id: number;
  code: string;
  status: 'pending' | 'redeemed';
  created_at: string;
  updated_at: string;
};

export type GalleryRow = {
  id: number;
  image: string;
  branch: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
};

// ---------------------------------------------------------------- shared queries

/** A member plus the branch of the user they hang off (member.user.branch). */
export type MemberWithBranch = MemberRow & { branch: string | null; user_role: Role | null };

const memberSelect = `
  SELECT m.*, u.branch AS branch, u.role AS user_role
  FROM members m LEFT JOIN users u ON u.id = m.user_id`;

export function getMember(id: number) {
  return db().prepare(`${memberSelect} WHERE m.id = ?`).get(id) as MemberWithBranch | undefined;
}

export function getMemberByUser(userId: number) {
  return db().prepare(`${memberSelect} WHERE m.user_id = ? ORDER BY m.id LIMIT 1`).get(userId) as
    | MemberWithBranch
    | undefined;
}

export function listMembers(where = '', ...params: unknown[]) {
  return db()
    .prepare(`${memberSelect} ${where} ORDER BY m.created_at DESC, m.id DESC`)
    .all(...params) as MemberWithBranch[];
}

/** Card number, phone or e-mail, the same three keys loyalty-gfx searches. */
export function findMemberByKey(key: string) {
  return db()
    .prepare(`${memberSelect} WHERE m.card_no = ? OR m.phone = ? OR m.email = ? LIMIT 1`)
    .get(key, key, key) as MemberWithBranch | undefined;
}

export function totalPoints(memberId: number): number {
  const row = db().prepare(`SELECT COALESCE(SUM(points), 0) AS total FROM points WHERE member_id = ?`).get(memberId) as {
    total: number;
  };
  return Math.round(row.total * 100000) / 100000;
}

export function firstAdminId(): number | undefined {
  const row = db().prepare(`SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`).get() as
    | { id: number }
    | undefined;
  return row?.id;
}

/** Members per branch, as on the admin and staff dashboards. */
export function branchCounts() {
  return db()
    .prepare(
      `SELECT u.branch AS branch, COUNT(m.id) AS members_count
       FROM members m JOIN users u ON u.id = m.user_id
       GROUP BY u.branch ORDER BY members_count DESC`,
    )
    .all() as { branch: string | null; members_count: number }[];
}
