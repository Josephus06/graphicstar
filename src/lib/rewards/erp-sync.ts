import { pointsForInvoice } from './constants';
import { db, firstAdminId, type MemberRow } from './db';
import { ErpError, erpConfigured, getInvoices } from './erp';

/**
 * ERP points sync (replaces loyalty-gfx's hourly `sync:memberpoints`).
 *
 * For every member linked to an ERP customer (members.system_pk = ERP customers.id), reads that
 * customer's sales invoices since REWARDS_ERP_SINCE (default 2025-01-01) and keeps one points row
 * per invoice (source = 'erp', bill_no = invoice no.): 1 point per ₱1,000 of the invoice's gross
 * amount, 2 decimals. An invoice later cancelled or voided in the ERP has its points removed.
 * Safe to run any number of times.
 */

export type SyncReport = { ok: boolean; lines: string[] };

const SINCE = () => (/^\d{4}-\d{2}-\d{2}$/.test(process.env.REWARDS_ERP_SINCE ?? '') ? process.env.REWARDS_ERP_SINCE! : '2025-01-01');

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

    const counts = { added: 0, updated: 0, removed: 0 };
    db().transaction(() => {
      for (const inv of invoices) {
        const existing = find.get(inv.invoice_no) as { id: number; member_id: number; bill_amount: number; points: number } | undefined;
        if (inv.cancelled || inv.gross_amount <= 0) {
          if (existing) {
            remove.run(existing.id);
            counts.removed += 1;
          }
          continue;
        }
        const points = pointsForInvoice(inv.gross_amount);
        if (!existing) {
          insert.run(member.id, inv.invoice_no, inv.gross_amount, points, systemUser, `${inv.date} 00:00:00`);
          counts.added += 1;
        } else if (existing.member_id !== member.id || existing.bill_amount !== inv.gross_amount || existing.points !== points) {
          update.run(member.id, inv.gross_amount, points, existing.id);
          counts.updated += 1;
        }
      }
    })();

    totals.added += counts.added;
    totals.updated += counts.updated;
    totals.removed += counts.removed;
    lines.push(
      `✔ ${member.name}: ${invoices.length} invoice(s) — ${counts.added} added, ${counts.updated} updated, ${counts.removed} removed`,
    );
  }

  lines.push(
    `Sync completed: ${members.length} member(s), ${totals.added} added, ${totals.updated} updated, ${totals.removed} removed` +
      (failures ? `, ${failures} failed` : '') +
      '.',
  );
  return { ok: failures === 0, lines };
}
