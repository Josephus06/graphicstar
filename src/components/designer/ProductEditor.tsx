'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/rewards/Form';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { saveDesignProduct } from '@/lib/designer/actions';
import {
  TEMPLATES,
  normaliseOptions,
  peso,
  priceFor,
  sizeLabel,
  type Choice,
  type DesignProduct,
  type OptionGroup,
  type ProductConfig,
  type TemplateKey,
} from '@/lib/designer/model';

const input =
  'w-full rounded-lg border border-grey-line bg-white px-3 py-2 text-[14px] text-ink focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15';
const lbl = 'mb-1 block text-[12px] font-semibold uppercase tracking-eyebrow text-grey-muted';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
const keyFrom = (s: string, taken: string[]) => {
  const base = slugify(s) || 'option';
  let k = base;
  for (let i = 2; taken.includes(k); i++) k = `${base}-${i}`;
  return k;
};
const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

const sizesToText = (c: ProductConfig) => c.sizes.map((s) => `${s.w}x${s.h}`).join(', ');
const parseSizes = (text: string) =>
  text
    .split(/[,\n]/)
    .map((t) => t.trim().toLowerCase().replace(/["′'ft\s]/g, ''))
    .filter(Boolean)
    .map((t) => {
      const [w, h] = t.split(/[x×*]/).map(Number);
      return { w, h };
    });

const EMPTY: Omit<DesignProduct, 'id'> = {
  slug: '',
  name: '',
  description: '',
  active: false,
  sort: 10,
  config: {
    unit: 'in',
    sizes: [{ w: 24, h: 18 }],
    allowCustomSize: true,
    minW: 6,
    maxW: 96,
    minH: 6,
    maxH: 96,
    groups: [{ key: 'material', label: 'Material', display: 'select', choices: [{ key: 'standard', label: 'Standard', perSqft: 100 }] }],
    qtyBreaks: [{ min: 10, discountPct: 10 }],
    minimumPerItem: 100,
    templates: ['headline', 'logo-center'],
  },
};

export function ProductEditor({ product }: { product?: DesignProduct }) {
  const router = useRouter();
  const [p, setP] = useState<Omit<DesignProduct, 'id'> & { id?: number }>(product ?? EMPTY);
  const [sizesText, setSizesText] = useState(sizesToText((product ?? EMPTY).config));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const cfg = p.config;
  const setCfg = (patch: Partial<ProductConfig>) => setP((x) => ({ ...x, config: { ...x.config, ...patch } }));
  const setGroup = (gi: number, patch: Partial<OptionGroup>) =>
    setCfg({ groups: cfg.groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)) });
  const setChoice = (gi: number, ci: number, patch: Partial<Choice>) =>
    setGroup(gi, { choices: cfg.groups[gi].choices.map((c, i) => (i === ci ? { ...c, ...patch } : c)) });

  const sizes = parseSizes(sizesText);
  const sizesValid = sizes.every((s) => s.w > 0 && s.h > 0);
  const sample = sizes[0] && sizesValid ? priceFor({ ...cfg, sizes }, { ...sizes[0], qty: 1, options: normaliseOptions(cfg, {}) }) : null;

  async function save() {
    setMessage(null);
    if (!sizesValid) return setMessage({ tone: 'error', text: 'Sizes must look like 24x18, 36x24 (width x height).' });
    setBusy(true);
    const result = await saveDesignProduct({ ...p, slug: p.slug || slugify(p.name), config: { ...cfg, sizes } });
    setBusy(false);
    if (!result.ok) return setMessage({ tone: 'error', text: result.message });
    setMessage({ tone: 'success', text: 'Saved.' });
    if (!p.id) router.replace(`/rewards/admin/designer/${result.id}?notice=${encodeURIComponent('Product created.')}`);
    else router.refresh();
  }

  const u = cfg.unit === 'ft' ? 'ft' : 'in';

  return (
    <div className="grid gap-6">
      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}

      <section className="grid gap-4 rounded-media bg-white p-5 shadow-card sm:grid-cols-2 sm:p-7">
        <div>
          <label className={lbl} htmlFor="pe-name">
            Product name
          </label>
          <input id="pe-name" className={input} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value, slug: p.id ? p.slug : slugify(e.target.value) })} />
        </div>
        <div>
          <label className={lbl} htmlFor="pe-slug">
            Web address
          </label>
          <div className="flex items-center gap-1 text-[14px] text-grey-muted">
            /design/
            <input id="pe-slug" className={input} value={p.slug} onChange={(e) => setP({ ...p, slug: slugify(e.target.value) })} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={lbl} htmlFor="pe-desc">
            Short description
          </label>
          <textarea id="pe-desc" rows={2} className={input} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
        </div>
        <label className="flex items-center gap-3 text-[15px] font-semibold text-ink">
          <input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} className="h-5 w-5 accent-blue" />
          Show on the website
        </label>
        <div className="flex items-center gap-3">
          <label className={cn(lbl, 'mb-0')} htmlFor="pe-sort">
            Order
          </label>
          <input id="pe-sort" type="number" className={cn(input, 'w-24')} value={p.sort} onChange={(e) => setP({ ...p, sort: Number(e.target.value) || 0 })} />
        </div>
      </section>

      <section className="grid gap-4 rounded-media bg-white p-5 shadow-card sm:p-7">
        <h2 className="text-[18px] font-semibold text-ink">Sizes</h2>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div>
            <label className={lbl} htmlFor="pe-unit">
              Unit
            </label>
            <select id="pe-unit" className={input} value={cfg.unit} onChange={(e) => setCfg({ unit: e.target.value as ProductConfig['unit'] })}>
              <option value="in">Inches</option>
              <option value="ft">Feet</option>
            </select>
          </div>
          <div>
            <label className={lbl} htmlFor="pe-sizes">
              Preset sizes (width x height, comma separated)
            </label>
            <input id="pe-sizes" className={cn(input, !sizesValid && 'border-magenta')} value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="18x12, 24x18, 36x24" />
            <p className="mt-1 text-[12px] text-grey-muted">{sizesValid ? sizes.map((s) => sizeLabel(s.w, s.h, cfg.unit)).join(' · ') : 'Use the form 24x18'}</p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-[14px] font-medium text-ink">
          <input type="checkbox" checked={cfg.allowCustomSize} onChange={(e) => setCfg({ allowCustomSize: e.target.checked })} className="h-4 w-4 accent-blue" />
          Customers may enter a custom size
        </label>
        {cfg.allowCustomSize ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ['minW', 'Min width'],
                ['maxW', 'Max width'],
                ['minH', 'Min height'],
                ['maxH', 'Max height'],
              ] as const
            ).map(([k, t]) => (
              <div key={k}>
                <label className={lbl} htmlFor={`pe-${k}`}>
                  {t} ({u})
                </label>
                <input id={`pe-${k}`} type="number" className={input} value={cfg[k]} onChange={(e) => setCfg({ [k]: Number(e.target.value) } as Partial<ProductConfig>)} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 rounded-media bg-white p-5 shadow-card sm:p-7">
        <div>
          <h2 className="text-[18px] font-semibold text-ink">Options and prices</h2>
          <p className="mt-1 text-[13px] text-grey-muted">
            Price per piece = (area in sq ft × total ₱/sq ft + total ₱/piece) × multipliers, never below the minimum. Leave a price empty for ₱0, and the multiplier empty for ×1.
          </p>
        </div>

        {cfg.groups.map((g, gi) => (
          <div key={gi} className="rounded-card border border-grey-line p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <label className={lbl}>Option group</label>
                <input className={input} value={g.label} onChange={(e) => setGroup(gi, { label: e.target.value })} placeholder="e.g. Material" />
              </div>
              <div>
                <label className={lbl}>Shown as</label>
                <select className={input} value={g.display} onChange={(e) => setGroup(gi, { display: e.target.value as OptionGroup['display'] })}>
                  <option value="select">Dropdown</option>
                  <option value="buttons">Buttons</option>
                </select>
              </div>
              <div className="flex gap-1">
                <IconBtn label="Move up" disabled={gi === 0} onClick={() => setCfg({ groups: swap(cfg.groups, gi, gi - 1) })}>
                  ↑
                </IconBtn>
                <IconBtn label="Move down" disabled={gi === cfg.groups.length - 1} onClick={() => setCfg({ groups: swap(cfg.groups, gi, gi + 1) })}>
                  ↓
                </IconBtn>
                <IconBtn label="Remove group" danger onClick={() => setCfg({ groups: cfg.groups.filter((_, i) => i !== gi) })}>
                  ✕
                </IconBtn>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] text-[14px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-eyebrow text-grey-muted">
                    <th className="py-2 pr-2 font-semibold">Choice</th>
                    <th className="w-28 py-2 pr-2 font-semibold">₱ / sq ft</th>
                    <th className="w-28 py-2 pr-2 font-semibold">₱ / piece</th>
                    <th className="w-24 py-2 pr-2 font-semibold">× price</th>
                    <th className="w-36 py-2 pr-2 font-semibold">Preview</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {g.choices.map((c, ci) => (
                    <tr key={ci}>
                      <td className="py-1 pr-2">
                        <input className={input} value={c.label} onChange={(e) => setChoice(gi, ci, { label: e.target.value })} aria-label="Choice name" />
                      </td>
                      <td className="py-1 pr-2">
                        <input className={input} type="number" step="0.01" min="0" value={c.perSqft ?? ''} onChange={(e) => setChoice(gi, ci, { perSqft: num(e.target.value) })} aria-label="Pesos per square foot" />
                      </td>
                      <td className="py-1 pr-2">
                        <input className={input} type="number" step="0.01" min="0" value={c.perItem ?? ''} onChange={(e) => setChoice(gi, ci, { perItem: num(e.target.value) })} aria-label="Pesos per piece" />
                      </td>
                      <td className="py-1 pr-2">
                        <input className={input} type="number" step="0.01" min="0" value={c.multiplier ?? ''} onChange={(e) => setChoice(gi, ci, { multiplier: num(e.target.value) })} aria-label="Price multiplier" placeholder="1" />
                      </td>
                      <td className="py-1 pr-2">
                        <select className={input} value={c.mockup ?? 'none'} onChange={(e) => setChoice(gi, ci, { mockup: e.target.value as Choice['mockup'] })} aria-label="Preview hardware">
                          <option value="none">Nothing</option>
                          <option value="post">Post + arm</option>
                          <option value="hstake">H-stake</option>
                          <option value="grommets">Grommets</option>
                          <option value="standoffs">Standoffs</option>
                        </select>
                      </td>
                      <td className="py-1">
                        <IconBtn label="Remove choice" danger disabled={g.choices.length === 1} onClick={() => setGroup(gi, { choices: g.choices.filter((_, i) => i !== ci) })}>
                          ✕
                        </IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-2 text-[13px] font-semibold text-blue"
              onClick={() => setGroup(gi, { choices: [...g.choices, { key: keyFrom('choice', g.choices.map((c) => c.key)), label: 'New choice' }] })}
            >
              + Add choice
            </button>
          </div>
        ))}
        <button
          type="button"
          className="w-fit rounded-full border border-ink px-4 py-2 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white"
          onClick={() =>
            setCfg({
              groups: [
                ...cfg.groups,
                { key: keyFrom('option', cfg.groups.map((g) => g.key)), label: 'New option', display: 'select', choices: [{ key: 'standard', label: 'Standard' }] },
              ],
            })
          }
        >
          + Add option group
        </button>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={lbl} htmlFor="pe-min">
              Minimum price per piece (₱)
            </label>
            <input id="pe-min" type="number" min="0" className={input} value={cfg.minimumPerItem} onChange={(e) => setCfg({ minimumPerItem: Number(e.target.value) || 0 })} />
          </div>
          <div className="self-end text-[14px] text-ink">
            {sample && !sample.error ? (
              <>
                Example: {sizeLabel(sizes[0].w, sizes[0].h, cfg.unit)} with the first choice of each option = <b>{peso(sample.perItem)}</b>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-media bg-white p-5 shadow-card sm:p-7">
        <h2 className="text-[18px] font-semibold text-ink">Quantity discounts</h2>
        {cfg.qtyBreaks.map((b, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 text-[14px] text-ink">
            Buy
            <input type="number" min="2" className={cn(input, 'w-24')} value={b.min} onChange={(e) => setCfg({ qtyBreaks: cfg.qtyBreaks.map((x, j) => (j === i ? { ...x, min: Number(e.target.value) } : x)) })} aria-label="Minimum quantity" />
            or more, save
            <input type="number" min="0" max="90" className={cn(input, 'w-20')} value={b.discountPct} onChange={(e) => setCfg({ qtyBreaks: cfg.qtyBreaks.map((x, j) => (j === i ? { ...x, discountPct: Number(e.target.value) } : x)) })} aria-label="Discount percent" />
            %
            <IconBtn label="Remove discount" danger onClick={() => setCfg({ qtyBreaks: cfg.qtyBreaks.filter((_, j) => j !== i) })}>
              ✕
            </IconBtn>
          </div>
        ))}
        <button type="button" className="w-fit text-[13px] font-semibold text-blue" onClick={() => setCfg({ qtyBreaks: [...cfg.qtyBreaks, { min: 25, discountPct: 15 }] })}>
          + Add discount
        </button>
      </section>

      <section className="grid gap-3 rounded-media bg-white p-5 shadow-card sm:p-7">
        <h2 className="text-[18px] font-semibold text-ink">Starter templates</h2>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(TEMPLATES) as TemplateKey[]).map((t) => (
            <label key={t} className="flex items-center gap-2 text-[14px] text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue"
                checked={cfg.templates.includes(t)}
                onChange={(e) => setCfg({ templates: e.target.checked ? [...cfg.templates, t] : cfg.templates.filter((x) => x !== t) })}
              />
              {TEMPLATES[t].label}
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={save} disabled={busy} className="disabled:opacity-60">
          {busy ? 'Saving…' : 'Save product'}
        </Button>
        {p.id && p.slug ? (
          <Link href={`/design/${p.slug}`} target="_blank" className="inline-flex items-center rounded-full border border-ink px-6 text-[12px] font-bold uppercase tracking-cta text-ink hover:bg-ink hover:text-white">
            {p.active ? 'View on website' : 'Preview'} ↗
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full text-[14px] transition-colors disabled:opacity-30',
        danger ? 'text-magenta hover:bg-magenta/10' : 'text-ink hover:bg-grey-bg',
      )}
    >
      {children}
    </button>
  );
}
