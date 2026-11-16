import { pointsForInvoice } from './constants';
import { db, firstAdminId, type MemberRow } from './db';
import { getRates } from './settings';
import { ErpError, customerLabel, erpConfigured, getCustomer, getInvoices } from './erp';

/**
 * ERP points sync (replaces loyalty-gfx's hourly `sync:memberpoints`).
 *
 * For every member linked to an ERP customer (members.system_pk = ERP customers.id), reads that
 * customer's sales invoices and keeps one points row per qualifying invoice (source = 'erp',
 * bill_no = invoice no.): gross amount / the ERP rate on Admin → Settings (default ₱1,000), 2 decimals.
 * A rate change applies to newly synced invoices; points already awarded are kept unless the
 * invoice's amount itself changes in the ERP.
 *
 * Qualifying = dated on/after REWARDS_ERP_SINCE (default 2026-01-01) AND fully paid
 * (status in REWARDS_ERP_STATUSES, default "paid_in_full"). The member's ERP points are kept in
 * step with that set: an unpaid invoice starts earning once it is paid, and points for anything
 * that stops qualifying (cancelled, voided, re-opened, or outside the date range) are removed.
 * Safe to run any number of times.
 */

export type SyncReport = { ok: boolean; lines: string[] };

const SINCE = () => (/^\d{4}-\d{2}-\d{2}$/.test(process.env.REWARDS_ERP_SINCE ?? '') ? process.env.REWARDS_ERP_SINCE! : '2026-01-01');
const STATUSES = () =>
  (process.env.REWARDS_ERP_STATUSES || 'paid_in_full')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Pass a member id to sync just that member (used right after verification). */
export async function syncMemberPoints(onlyMemberId?: number): Promise<SyncReport> {
  if (!erpConfigured()) return { ok: false, lines: ['The ERP connection is not configured (ERP_API_URL / ERP_API_KEY).'] };
  const systemUser = firstAdminId();
  if (!systemUser) return { ok: false, lines: ['No admin user exists to own synced points.'] };

  const members = db()
    .prepare(`SELECT * FROM members WHERE system_pk IS NOT NULL AND TRIM(system_pk) <> '' ${onlyMemberId ? 'AND id = ?' : ''}`)
    .all(...(onlyMemberId ? [onlyMemberId] : [])) as MemberRow[];

  const find = db().prepare(`SELECT id, member_id, bill_amount, points FROM points WHERE source = 'erp' AND bill_no = ?`);
  const insert = db().prepare(
    `INSERT INTO points (member_id, bill_no, bill_amount, points, user_id, source, created_at) VALUES (?, ?, ?, ?, ?, 'erp', ?)`,
  );
  const update = db().prepare(
    `UPDATE points SET member_id = ?, bill_amount = ?, points = ?, updated_at = datetime('now') WHERE id = ?`,
  );
  const remove = db().prepare(`DELETE FROM points WHERE id = ?`);

  const rate = getRates().erp;
  const lines: string[] = [];
  let failures = 0;
  const totals = { added: 0, updated: 0, removed: 0 };

  for (const member of members) {
    let invoices;
    try {
      invoices = await getInvoices(member.system_pk!, SINCE());
    } catch (error) {
      failures += 1;
      lines.push(`Failed fetching invoices for ${member.name}: ${(error as ErpError).message}`);
      continue;
    }

    // Members linked before the ERP connection existed have no customer name yet.
    if (!member.erp_customer_name) {
      try {
        const customer = await getCustomer(member.system_pk!);
        db().prepare(`UPDATE members SET erp_customer_name = ? WHERE id = ?`).run(customerLabel(customer), member.id);
      } catch {
        // Cosmetic only; the points still sync.
      }
    }

    const since = SINCE();
    const statuses = STATUSES();
    const qualifying = invoices.filter(
      (inv) => !inv.cancelled && inv.gross_amount > 0 && inv.date >= since && statuses.includes(inv.status),
    );
    const keep = new Set(qualifying.map((inv) => inv.invoice_no));

    const counts = { added: 0, updated: 0, removed: 0 };
    db().transaction(() => {
      // Drop this member's ERP points for invoices that no longer qualify.
      const held = db().prepare(`SELECT id, bill_no FROM points WHERE source = 'erp' AND member_id = ?`).all(member.id) as {
        id: number;
        bill_no: string;
      }[];
      for (const row of held) {
        if (!keep.has(row.bill_no)) {
          remove.run(row.id);
          counts.removed += 1;
        }
      }

      for (const inv of qualifying) {
        const existing = find.get(inv.invoice_no) as { id: number; member_id: number; bill_amount: number; points: number } | undefined;
        if (!existing) {
          const points = pointsForInvoice(inv.gross_amount, rate);
          insert.run(member.id, inv.invoice_no, inv.gross_amount, points, systemUser, `${inv.date} 00:00:00`);
          counts.added += 1;
        } else if (existing.member_id !== member.id || existing.bill_amount !== inv.gross_amount) {
          const points = existing.bill_amount !== inv.gross_amount ? pointsForInvoice(inv.gross_amount, rate) : existing.points;
          update.run(member.id, inv.gross_amount, points, existing.id);
          counts.updated += 1;
        }
      }
    })();

    totals.added += counts.added;
    totals.updated += counts.updated;
    totals.removed += counts.removed;
    lines.push(
      `✔ ${member.name}: ${qualifying.length} of ${invoices.length} invoice(s) qualify — ${counts.added} added, ${counts.updated} updated, ${counts.removed} removed`,
    );
  }

  lines.push(
    `Sync completed: ${members.length} member(s), ${totals.added} added, ${totals.updated} updated, ${totals.removed} removed` +
      (failures ? `, ${failures} failed` : '') +
      '.',
  );
  return { ok: failures === 0, lines };
}
