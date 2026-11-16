-- Rewards schema. A port of the loyalty-gfx (Laravel) tables:
-- users, members, points, rewards, redemptions, galleries, settings,
-- plus a sessions table for logins. Idempotent: safe to run on every boot.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password        TEXT    NOT NULL,
  role            TEXT    NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'member')),
  branch          TEXT,
  terms_accepted  INTEGER NOT NULL DEFAULT 0,
  terms_version   TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- user_id is the member's own login (role = member) when the member registered
-- or was added by an admin, or the staff account that enrolled them.
-- Branch is always read from that user, exactly as loyalty-gfx does.
-- form_no / card_no are empty for self-registered members; system_pk (the ERP
-- customer) is empty until an admin verifies the member.
CREATE TABLE IF NOT EXISTS members (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  form_no     TEXT,
  card_no     TEXT    UNIQUE,
  date        TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  gender      TEXT    NOT NULL CHECK (gender IN ('M', 'F')),
  email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  address     TEXT    NOT NULL,
  dob         TEXT    NOT NULL,
  phone       TEXT    NOT NULL UNIQUE,
  system_pk   TEXT,             -- ERP customer id, set on the Verification page
  erp_customer_name TEXT,       -- that ERP customer's name, for display
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS points (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id    INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  bill_no      TEXT    NOT NULL,
  bill_amount  REAL    NOT NULL,
  points       REAL    NOT NULL,
  -- manual (admin/staff entry), erp (invoice sync, bill_no = ERP invoice no.) or redeem
  source       TEXT    NOT NULL DEFAULT 'manual',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS points_member_idx ON points (member_id);
CREATE INDEX IF NOT EXISTS points_bill_idx ON points (bill_no);

CREATE TABLE IF NOT EXISTS rewards (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  image            TEXT,
  description      TEXT,
  points_required  INTEGER NOT NULL DEFAULT 0,
  branch           TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS redemptions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reward_id   INTEGER NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  code        TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS redemptions_code_idx ON redemptions (code);

CREATE TABLE IF NOT EXISTS galleries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  image        TEXT    NOT NULL,
  branch       TEXT,
  title        TEXT,
  description  TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT    NOT NULL UNIQUE,
  value        TEXT,
  type         TEXT,
  description  TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL
);
