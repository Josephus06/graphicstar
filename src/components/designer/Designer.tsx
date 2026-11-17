'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { submitDesignQuote } from '@/lib/designer/actions';
import {
  MAX_QTY,
  TEMPLATES,
  normaliseOptions,
  peso,
  priceFor,
  sizeLabel,
  type DesignProduct,
  type TemplateFields,
  type TemplateKey,
} from '@/lib/designer/model';
import { MockupScene } from './MockupScene';
import { SignArtwork, artworkToPng, type ArtworkState } from './SignArtwork';

const field =
  'w-full rounded-xl border border-grey-line bg-white px-4 py-3 text-[15px] text-ink transition-colors focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15';
const label = 'mb-1.5 block text-[14px] font-semibold text-ink';

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export function Designer({ product }: { product: DesignProduct }) {
  const cfg = product.config;
  const unitSuffix = cfg.unit === 'ft' ? ' ft' : '"';

  // ---------------------------------------------------------------- options
  const [sizeIdx, setSizeIdx] = useState<number | 'custom'>(cfg.sizes.length ? Math.min(1, cfg.sizes.length - 1) : 'custom');
  const [customW, setCustomW] = useState(String(cfg.sizes[0]?.w ?? cfg.minW));
  const [customH, setCustomH] = useState(String(cfg.sizes[0]?.h ?? cfg.minH));
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<Record<string, string>>(() => normaliseOptions(cfg, {}));

  const size = sizeIdx === 'custom' ? { w: Number(customW), h: Number(customH) } : cfg.sizes[sizeIdx];
  const selection = { w: size.w, h: size.h, qty, options };
  const price = priceFor(cfg, selection);
  const nextBreak = cfg.qtyBreaks.filter((b) => b.min > qty).sort((a, b) => a.min - b.min)[0];

  const chosen = cfg.groups.map((g) => g.choices.find((c) => c.key === options[g.key]) ?? g.choices[0]).filter(Boolean);
  const mockups = chosen.map((c) => c!.mockup).filter((m): m is NonNullable<typeof m> => !!m && m !== 'none');
  const doubleSided = chosen.some((c) => /double/i.test(c!.key) || /double/i.test(c!.label));

  // ---------------------------------------------------------------- design
  const templates = cfg.templates.length ? cfg.templates : (['headline'] as TemplateKey[]);
  const [mode, setMode] = useState<'template' | 'upload'>('template');
  const [template, setTemplate] = useState<TemplateKey>(templates[0]);
  const [fields, setFields] = useState<TemplateFields>(TEMPLATES[templates[0]].defaults);
  const [logo, setLogo] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ file: File | null; dataUrl: string | null; isPdf: boolean }>({ file: null, dataUrl: null, isPdf: false });
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('contain');
  const [uploadBg, setUploadBg] = useState('#FFFFFF');
  const [fileError, setFileError] = useState<string | null>(null);

  const art: ArtworkState = useMemo(
    () =>
      mode === 'template'
        ? { mode, template, fields, logo }
        : { mode, image: upload.dataUrl, fileName: upload.file?.name ?? null, isPdf: upload.isPdf, fit: fitMode, background: uploadBg },
    [mode, template, fields, logo, upload, fitMode, uploadBg],
  );

  const pickTemplate = (key: TemplateKey) => {
    setTemplate(key);
    // Keep what the customer typed; only colours follow the template's style.
    setFields((f) => ({ ...TEMPLATES[key].defaults, headline: f.headline, subline: f.subline, contact: f.contact, footer: f.footer }));
  };

  const onArtwork = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    const ok = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type);
    if (!ok) return setFileError('Please upload a PNG, JPG, WEBP or PDF file.');
    if (file.size > 20 * 1024 * 1024) return setFileError('Files up to 20 MB, please. For larger files, send them after your quote.');
    const isPdf = file.type === 'application/pdf';
    setUpload({ file, isPdf, dataUrl: isPdf ? null : await readDataUrl(file) });
  };

  const onLogo = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return setFileError('Logo must be an image up to 5 MB.');
    setLogo(await readDataUrl(file));
  };

  // ---------------------------------------------------------------- quote
  const proofRef = useRef<SVGSVGElement>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
      {/* LEFT: preview + design editor */}
      <div className="min-w-0">
        <div className="overflow-hidden rounded-media bg-white shadow-card">
          <MockupScene w={size.w || 1} h={size.h || 1} unit={cfg.unit} art={art} mockups={mockups} doubleSided={doubleSided} />
        </div>

        <section className="mt-6 rounded-media bg-white p-5 shadow-card sm:p-7" aria-labelledby="design-heading">
          <h2 id="design-heading" className="text-[18px] font-semibold text-ink">
            Your design
          </h2>
          <div role="tablist" aria-label="Design method" className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-grey-bg p-1">
            {(['template', 'upload'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors',
                  mode === m ? 'bg-white text-ink shadow-pill' : 'text-grey-muted hover:text-ink',
                )}
              >
                {m === 'template' ? 'Start from a template' : 'Upload my artwork'}
              </button>
            ))}
          </div>

          {mode === 'template' ? (
            <div className="mt-5 grid gap-4">
              {templates.length > 1 ? (
                <div>
                  <span className={label}>Template</span>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => pickTemplate(t)}
                        aria-pressed={template === t}
                        className={cn(
                          'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                          template === t ? 'border-blue bg-blue/5 text-blue' : 'border-grey-line text-ink hover:border-ink',
                        )}
                      >
                        {TEMPLATES[t].label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <TextInput id="d-headline" text="Headline" value={fields.headline} onChange={(v) => setFields({ ...fields, headline: v })} />
              <TextInput id="d-subline" text="Second line" value={fields.subline} onChange={(v) => setFields({ ...fields, subline: v })} />
              <TextInput id="d-contact" text="Contact / website" value={fields.contact} onChange={(v) => setFields({ ...fields, contact: v })} />
              {template === 'for-sale' ? (
                <TextInput id="d-footer" text="Company / brand (top band)" value={fields.footer} onChange={(v) => setFields({ ...fields, footer: v })} />
              ) : null}
              <div className="grid grid-cols-2 gap-3 xs:grid-cols-4">
                {(
                  [
                    ['primary', 'Main colour'],
                    ['accent', 'Accent'],
                    ['text', 'Text'],
                    ['background', 'Background'],
                  ] as const
                ).map(([key, text]) => (
                  <label key={key} className="flex items-center gap-2 rounded-xl border border-grey-line px-3 py-2 text-[13px] font-medium text-ink">
                    <input
                      type="color"
                      value={fields[key]}
                      onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                      className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    {text}
                  </label>
                ))}
              </div>
              {template === 'logo-center' || template === 'headline' ? (
                <div>
                  <label htmlFor="d-logo" className={label}>
                    Logo (optional)
                  </label>
                  <input id="d-logo" type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} className={cn(field, 'py-2.5')} />
                  {logo ? (
                    <button type="button" onClick={() => setLogo(null)} className="mt-1 text-[13px] font-semibold text-magenta">
                      Remove logo
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              <div>
                <label htmlFor="d-artwork" className={label}>
                  Artwork file
                </label>
                <input
                  id="d-artwork"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => onArtwork(e.target.files?.[0])}
                  className={cn(field, 'py-2.5')}
                />
                <p className="mt-1.5 text-[13px] text-grey-muted">
                  PNG, JPG, WEBP or PDF up to 20 MB. For a sharp print, use at least 150 dpi at the final size
                  {size.w ? ` (about ${Math.round(size.w * (cfg.unit === 'ft' ? 12 : 1) * 150)} px wide)` : ''}.
                </p>
              </div>
              {upload.dataUrl ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className={label}>Placement</span>
                    <div className="grid grid-cols-2 gap-1 rounded-full bg-grey-bg p-1">
                      {(['contain', 'cover'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFitMode(f)}
                          aria-pressed={fitMode === f}
                          className={cn('rounded-full py-2 text-[13px] font-semibold', fitMode === f ? 'bg-white shadow-pill' : 'text-grey-muted')}
                        >
                          {f === 'contain' ? 'Fit' : 'Fill'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-end gap-2 text-[13px] font-medium text-ink">
                    <span className="flex items-center gap-2 rounded-xl border border-grey-line px-3 py-2">
                      <input type="color" value={uploadBg} onChange={(e) => setUploadBg(e.target.value)} className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0" />
                      Background
                    </span>
                  </label>
                </div>
              ) : null}
              {upload.isPdf ? (
                <p className="rounded-xl bg-blue/5 px-4 py-3 text-[14px] text-blue-deep">
                  PDFs can&apos;t be previewed here, but the file is attached to your quote and our team will check it.
                </p>
              ) : null}
            </div>
          )}
          {fileError ? (
            <p role="alert" className="mt-3 text-[13px] font-medium text-magenta">
              {fileError}
            </p>
          ) : null}
        </section>
      </div>

      {/* RIGHT: options + price */}
      <div className="min-w-0">
        <h1 className="text-[32px] font-semibold leading-tight tracking-tightest text-ink sm:text-[40px]">{product.name}</h1>
        {product.description ? <p className="body-copy mt-3">{product.description}</p> : null}

        <div className="mt-8 grid gap-6">
          <div>
            <label htmlFor="d-size" className={label}>
              Size (W × H)
            </label>
            <select
              id="d-size"
              value={String(sizeIdx)}
              onChange={(e) => setSizeIdx(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
              className={field}
            >
              {cfg.sizes.map((s, i) => (
                <option key={`${s.w}x${s.h}`} value={i}>
                  {sizeLabel(s.w, s.h, cfg.unit)}
                </option>
              ))}
              {cfg.allowCustomSize ? <option value="custom">Custom size…</option> : null}
            </select>
            {sizeIdx === 'custom' ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberInput id="d-w" text={`Width (${cfg.minW}–${cfg.maxW}${unitSuffix})`} value={customW} onChange={setCustomW} />
                <NumberInput id="d-h" text={`Height (${cfg.minH}–${cfg.maxH}${unitSuffix})`} value={customH} onChange={setCustomH} />
              </div>
            ) : null}
          </div>

          {cfg.groups.map((g) => (
            <div key={g.key}>
              {g.display === 'buttons' ? (
                <>
                  <span className={label} id={`d-${g.key}-label`}>
                    {g.label}
                  </span>
                  <div role="radiogroup" aria-labelledby={`d-${g.key}-label`} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${g.choices.length}, minmax(0,1fr))` }}>
                    {g.choices.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        role="radio"
                        aria-checked={options[g.key] === c.key}
                        onClick={() => setOptions({ ...options, [g.key]: c.key })}
                        className={cn(
                          'rounded-xl border px-3 py-3.5 text-[14px] font-medium transition-colors',
                          options[g.key] === c.key ? 'border-emerald-600 bg-emerald-50 text-ink' : 'border-grey-line bg-white text-ink hover:border-ink',
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor={`d-${g.key}`} className={label}>
                    {g.label}
                  </label>
                  <select id={`d-${g.key}`} value={options[g.key]} onChange={(e) => setOptions({ ...options, [g.key]: e.target.value })} className={field}>
                    {g.choices.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ))}

          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-grey-line pt-6">
            <div>
              <span className={label} id="d-qty-label">
                Quantity
              </span>
              <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-grey-line bg-white" role="group" aria-labelledby="d-qty-label">
                <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 bg-grey-bg text-[18px] text-ink">
                  −
                </button>
                <input
                  aria-labelledby="d-qty-label"
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(MAX_QTY, Number(e.target.value.replace(/\D/g, '')) || 1)))}
                  className="w-16 text-center text-[15px] text-ink focus:outline-none"
                />
                <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="w-11 bg-grey-bg text-[18px] text-ink">
                  +
                </button>
              </div>
              {nextBreak ? (
                <p className="mt-2 text-[13px] font-semibold text-emerald-700">
                  Buy {nextBreak.min}+, save {nextBreak.discountPct}%
                </p>
              ) : null}
            </div>
            <div className="text-right" aria-live="polite">
              <p className="text-[14px] font-semibold text-ink">Price</p>
              {price.error ? (
                <p className="mt-1 max-w-[260px] text-[14px] font-medium text-magenta">{price.error}</p>
              ) : (
                <>
                  <p className="text-[32px] font-semibold leading-none tracking-tightest text-emerald-700">
                    {peso(price.total / Math.max(1, qty))}
                    <span className="ml-1 text-[15px] font-medium text-ink">ea.</span>
                  </p>
                  {price.discountPct ? (
                    <p className="mt-1 text-[13px] text-grey-muted">
                      <s>{peso(price.perItem)}</s> <span className="font-semibold text-emerald-700">Save {price.discountPct}%</span>
                    </p>
                  ) : null}
                  <p className="mt-1 text-[14px] text-ink">
                    Total <b>{peso(price.total)}</b>
                  </p>
                </>
              )}
            </div>
          </div>

          <Button type="button" size="lg" className="w-full disabled:opacity-50" disabled={!!price.error} onClick={() => setQuoteOpen(true)}>
            Request this quote
          </Button>
          <p className="-mt-3 text-center text-[13px] text-grey-muted">
            No payment now. Our team confirms the final price, artwork and lead time with you.
          </p>
        </div>
      </div>

      {/* Full-size artwork, off screen, used to make the proof image */}
      <div aria-hidden="true" className="pointer-events-none fixed -left-[10000px] top-0 w-[1000px]">
        <SignArtwork ref={proofRef} w={size.w || 1} h={size.h || 1} art={art} />
      </div>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        summary={`${product.name}, ${sizeLabel(size.w, size.h, cfg.unit)} × ${qty} · ${peso(price.total)}`}
        build={async () => {
          const fd = new FormData();
          fd.set('productId', String(product.id));
          fd.set('selection', JSON.stringify(selection));
          fd.set('design', JSON.stringify(mode === 'template' ? { mode, template, fields } : { mode, fit: fitMode, background: uploadBg }));
          if (mode === 'upload' && upload.file) fd.set('artwork', upload.file);
          if (proofRef.current && !(mode === 'upload' && (upload.isPdf || !upload.dataUrl))) {
            const png = await artworkToPng(proofRef.current).catch(() => null);
            if (png) fd.set('proof', new File([png], 'proof.png', { type: 'image/png' }));
          }
          return fd;
        }}
      />
    </div>
  );
}

function TextInput({ id, text, value, onChange }: { id: string; text: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input id={id} value={value} maxLength={80} onChange={(e) => onChange(e.target.value)} className={field} />
    </div>
  );
}

function NumberInput({ id, text, value, onChange }: { id: string; text: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-grey-muted">
        {text}
      </label>
      <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))} className={field} />
    </div>
  );
}

function QuoteDialog({
  open,
  onClose,
  summary,
  build,
}: {
  open: boolean;
  onClose: () => void;
  summary: string;
  build: () => Promise<FormData>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Read the form now: React clears currentTarget once the handler yields at an await.
    const contact = new FormData(e.currentTarget);
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const fd = await build();
      for (const [k, v] of contact.entries()) fd.set(k, v);
      const result = await submitDesignQuote(fd);
      if (result.ok) setDone(result.reference);
      else {
        setMessage(result.message);
        setErrors(result.fieldErrors ?? {});
      }
    } catch {
      setMessage('Something went wrong sending your request. Please try again, or contact us directly.');
    } finally {
      setBusy(false);
    }
  }

  const input = (name: string, text: string, type = 'text', required = true, auto?: string) => (
    <div>
      <label htmlFor={`q-${name}`} className={label}>
        {text}
        {required ? <span className="text-magenta"> *</span> : null}
      </label>
      <input id={`q-${name}`} name={name} type={type} required={required} autoComplete={auto} aria-invalid={errors[name] ? true : undefined} className={field} />
      {errors[name] ? <p className="mt-1 text-[13px] font-medium text-magenta">{errors[name]}</p> : null}
    </div>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="q-title"
      className="w-[min(94vw,560px)] rounded-media bg-white p-0 backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        {done ? (
          <div className="text-center" role="status">
            <p className="eyebrow text-orange">Request sent</p>
            <h2 id="q-title" className="mt-3 text-[24px] font-semibold text-ink">
              Thank you!
            </h2>
            <p className="mt-3 text-[15px] text-grey-muted">
              Your reference is <b className="text-ink">{done}</b>. Our team will contact you to confirm the price, artwork and schedule.
            </p>
            <Button type="button" className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4">
            <div>
              <h2 id="q-title" className="text-[22px] font-semibold text-ink">
                Request a quote
              </h2>
              <p className="mt-1 text-[14px] text-grey-muted">{summary}</p>
            </div>
            {message ? (
              <p role="alert" className="rounded-xl bg-magenta/10 px-4 py-3 text-[14px] font-medium text-magenta-dark">
                {message}
              </p>
            ) : null}
            {input('name', 'Your name', 'text', true, 'name')}
            <div className="grid gap-4 xs:grid-cols-2">
              {input('email', 'Email', 'email', true, 'email')}
              {input('phone', 'Phone', 'tel', true, 'tel')}
            </div>
            {input('company', 'Company', 'text', false, 'organization')}
            <div>
              <label htmlFor="q-notes" className={label}>
                Notes
              </label>
              <textarea id="q-notes" name="notes" rows={3} maxLength={2000} className={field} placeholder="Deadline, delivery address, anything we should know" />
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="flex-1 disabled:opacity-60">
                {busy ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
