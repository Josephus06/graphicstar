import { db } from './db';
import { DEFAULT_RATES, type PointRates } from './constants';

/**
 * Point rates ("pesos per 1 point"), editable on Admin → Settings and stored in the settings
 * table. A changed rate only affects points awarded from then on.
 */

const KEYS: Record<keyof PointRates, string> = {
  graphicstar: 'rate_pesos_per_point_graphicstar',
  freshTidy: 'rate_pesos_per_point_fresh_tidy',
  erp: 'rate_pesos_per_point_erp',
};

export function getRates(): PointRates {
  const rows = db()
    .prepare(`SELECT key, value FROM settings WHERE key IN (${Object.values(KEYS).map(() => '?').join(',')})`)
    .all(...Object.values(KEYS)) as { key: string; value: string }[];
  const byKey = new Map(rows.map((r) => [r.key, Number(r.value)]));
  const pick = (k: keyof PointRates) => {
    const v = byKey.get(KEYS[k]);
    return v && Number.isFinite(v) && v > 0 ? v : DEFAULT_RATES[k];
  };
  return { graphicstar: pick('graphicstar'), freshTidy: pick('freshTidy'), erp: pick('erp') };
}

export function setRates(rates: PointRates) {
  const upsert = db().prepare(
    `INSERT INTO settings (key, value, type, description) VALUES (?, ?, 'number', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
  );
  db().transaction(() => {
    upsert.run(KEYS.graphicstar, String(rates.graphicstar), 'Pesos per point, manual entry, Cebu Graphicstar');
    upsert.run(KEYS.freshTidy, String(rates.freshTidy), 'Pesos per point, manual entry, Fresh and Tidy');
    upsert.run(KEYS.erp, String(rates.erp), 'Pesos per point, paid ERP invoices');
  })();
}
