import { db } from '@/lib/rewards/db';
import { STARTER_PRODUCTS, type DesignProduct, type ProductConfig } from './model';

/** Design Online persistence (same SQLite database as Rewards). */

type Row = { id: number; slug: string; name: string; description: string; active: number; sort: number; config: string };

let seeded = false;
function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  const { n } = db().prepare(`SELECT COUNT(*) AS n FROM design_products`).get() as { n: number };
  if (n > 0) return;
  const insert = db().prepare(
    `INSERT INTO design_products (slug, name, description, active, sort, config) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  db().transaction(() => {
    for (const p of STARTER_PRODUCTS) insert.run(p.slug, p.name, p.description, p.active ? 1 : 0, p.sort, JSON.stringify(p.config));
  })();
}

const toProduct = (r: Row): DesignProduct => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  active: !!r.active,
  sort: r.sort,
  config: JSON.parse(r.config) as ProductConfig,
});

export function listProducts({ activeOnly }: { activeOnly: boolean }): DesignProduct[] {
  ensureSeeded();
  return (
    db()
      .prepare(`SELECT * FROM design_products ${activeOnly ? 'WHERE active = 1' : ''} ORDER BY sort, name`)
      .all() as Row[]
  ).map(toProduct);
}

export function getProduct(slugOrId: string | number): DesignProduct | undefined {
  ensureSeeded();
  const row = db()
    .prepare(`SELECT * FROM design_products WHERE ${typeof slugOrId === 'number' ? 'id' : 'slug'} = ?`)
    .get(slugOrId) as Row | undefined;
  return row ? toProduct(row) : undefined;
}

export function saveProduct(p: Omit<DesignProduct, 'id'> & { id?: number }): number {
  if (p.id) {
    db()
      .prepare(
        `UPDATE design_products SET slug = ?, name = ?, description = ?, active = ?, sort = ?, config = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .run(p.slug, p.name, p.description, p.active ? 1 : 0, p.sort, JSON.stringify(p.config), p.id);
    return p.id;
  }
  return Number(
    db()
      .prepare(`INSERT INTO design_products (slug, name, description, active, sort, config) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(p.slug, p.name, p.description, p.active ? 1 : 0, p.sort, JSON.stringify(p.config)).lastInsertRowid,
  );
}

export function deleteProduct(id: number) {
  db().prepare(`DELETE FROM design_products WHERE id = ?`).run(id);
}

// ---------------------------------------------------------------- quotes

export type QuoteRow = {
  id: number;
  reference: string;
  product_id: number | null;
  product_name: string;
  selection: string;
  breakdown: string;
  total: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  notes: string | null;
  artwork_file: string | null;
  artwork_name: string | null;
  proof_file: string | null;
  design_json: string | null;
  status: 'new' | 'contacted' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
};

export const listQuotes = (status?: string) =>
  db()
    .prepare(`SELECT * FROM design_quotes ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC, id DESC`)
    .all(...(status ? [status] : [])) as QuoteRow[];

export const getQuote = (id: number) => db().prepare(`SELECT * FROM design_quotes WHERE id = ?`).get(id) as QuoteRow | undefined;

export const countNewQuotes = () =>
  (db().prepare(`SELECT COUNT(*) AS n FROM design_quotes WHERE status = 'new'`).get() as { n: number }).n;
