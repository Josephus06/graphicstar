'use server';

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { z } from 'zod';
import { site } from '@/content/site';
import { currentUser, requireRole } from '@/lib/rewards/auth';
import { db } from '@/lib/rewards/db';
import { renderQuoteEmail, type QuoteEmailInput } from './email';
import { ARTWORK_MAX_BYTES, ARTWORK_TYPES, PROOF_MAX_BYTES, saveQuoteFile } from './files';
import { normaliseOptions, priceFor, sizeLabel, type DesignProduct, type ProductConfig } from './model';
import { deleteProduct, getProduct, saveProduct } from './store';

// ================================================================ public: quote request

export type QuoteResult = { ok: true; reference: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid e-mail address.').max(200),
  phone: z.string().trim().min(7, 'Please enter a phone number we can reach you on.').max(40),
  company: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(2000).optional(),
  website: z.string().optional(), // honeypot
});

const selectionSchema = z.object({
  w: z.number(),
  h: z.number(),
  qty: z.number().int(),
  options: z.record(z.string()),
});

const reference = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `DQ-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

/**
 * Quote request from /design/[slug]. The price is recalculated here from the
 * stored product, never taken from the browser.
 */
export async function submitDesignQuote(formData: FormData): Promise<QuoteResult> {
  const contact = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    company: formData.get('company') || undefined,
    notes: formData.get('notes') || undefined,
    website: formData.get('website') || undefined,
  });
  if (!contact.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of contact.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, message: 'Please check the highlighted fields.', fieldErrors };
  }
  if (contact.data.website) return { ok: true, reference: 'DQ-0' }; // bot

  const product = getProduct(Number(formData.get('productId')));
  const user = await currentUser();
  if (!product || (!product.active && user?.role !== 'admin')) return { ok: false, message: 'This product is not available.' };

  let selection: z.infer<typeof selectionSchema>;
  try {
    selection = selectionSchema.parse(JSON.parse(String(formData.get('selection') ?? '')));
  } catch {
    return { ok: false, message: 'Your selection could not be read. Please refresh and try again.' };
  }
  selection.options = normaliseOptions(product.config, selection.options);
  const breakdown = priceFor(product.config, selection);
  if (breakdown.error) return { ok: false, message: breakdown.error };

  const artwork = formData.get('artwork');
  const proof = formData.get('proof');
  const artworkFile = artwork instanceof File && artwork.size > 0 ? artwork : null;
  const proofFile = proof instanceof File && proof.size > 0 ? proof : null;
  if (artworkFile && (!ARTWORK_TYPES[artworkFile.type] || artworkFile.size > ARTWORK_MAX_BYTES)) {
    return { ok: false, message: 'Artwork must be a PNG, JPG, WEBP or PDF file up to 20 MB.' };
  }
  if (proofFile && (proofFile.type !== 'image/png' || proofFile.size > PROOF_MAX_BYTES)) {
    return { ok: false, message: 'The design preview could not be attached. Please try again.' };
  }

  const ref = reference();
  const artworkStored = artworkFile ? `${ref}-artwork.${ARTWORK_TYPES[artworkFile.type]}` : null;
  const proofStored = proofFile ? `${ref}-proof.png` : null;
  if (artworkFile && artworkStored) await saveQuoteFile(artworkStored, artworkFile);
  if (proofFile && proofStored) await saveQuoteFile(proofStored, proofFile);

  const design = String(formData.get('design') ?? '').slice(0, 20_000) || null;
  const c = contact.data;
  const id = Number(
    db()
      .prepare(
        `INSERT INTO design_quotes (reference, product_id, product_name, selection, breakdown, total, name, email, phone, company, notes,
                                    artwork_file, artwork_name, proof_file, design_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        ref,
        product.id,
        product.name,
        JSON.stringify(selection),
        JSON.stringify(breakdown),
        breakdown.total,
        c.name,
        c.email,
        c.phone,
        c.company ?? null,
        c.notes ?? null,
        artworkStored,
        artworkFile ? artworkFile.name.slice(0, 200) : null,
        proofStored,
        design,
      ).lastInsertRowid,
  );

  await notify({
    id,
    reference: ref,
    product: product.name,
    size: sizeLabel(selection.w, selection.h, product.config.unit),
    qty: selection.qty,
    breakdown,
    ...c,
    artworkName: artworkFile?.name ?? null,
    proof: proofFile,
    artwork: artworkFile && artworkFile.size <= 10 * 1024 * 1024 ? artworkFile : null,
  });

  revalidatePath('/rewards/admin/quotes');
  return { ok: true, reference: ref };
}

type NotifyInput = Omit<QuoteEmailInput, 'adminUrl'> & { id: number; proof: File | null; artwork: File | null };

async function notify(q: NotifyInput) {
  const { subject, html, text } = renderQuoteEmail({ ...q, adminUrl: `${site.url}/rewards/admin/quotes/${q.id}` });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[design-quote] RESEND_API_KEY not set; quote saved, e-mail not sent:', q.reference);
    return;
  }
  const attachments = [];
  if (q.proof) attachments.push({ filename: `${q.reference}-proof.png`, content: Buffer.from(await q.proof.arrayBuffer()) });
  if (q.artwork) attachments.push({ filename: q.artwork.name || `${q.reference}-artwork`, content: Buffer.from(await q.artwork.arrayBuffer()) });
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: `Cebu GraphicStar Website <${process.env.CONTACT_FROM_EMAIL ?? 'website@graphicstar.ph'}>`,
      to: [process.env.CONTACT_TO_EMAIL ?? 'inquiry@graphicstar.ph'],
      replyTo: q.email,
      subject,
      html,
      text,
      attachments,
    });
    if (error) console.error('[design-quote] e-mail failed', q.reference, error);
  } catch (error) {
    // The quote is saved either way; the team still sees it under Admin → Quotes.
    console.error('[design-quote] e-mail failed', q.reference, error);
  }
}

// ================================================================ admin: products

const choiceSchema = z.object({
  key: z.string().min(1),
  label: z.string().trim().min(1, 'Every choice needs a name.'),
  perSqft: z.number().min(0).optional(),
  perItem: z.number().min(0).optional(),
  multiplier: z.number().positive().optional(),
  mockup: z.enum(['none', 'post', 'hstake', 'grommets', 'standoffs']).optional(),
});

const configSchema: z.ZodType<ProductConfig> = z
  .object({
    unit: z.enum(['in', 'ft']),
    sizes: z.array(z.object({ w: z.number().positive(), h: z.number().positive() })),
    allowCustomSize: z.boolean(),
    minW: z.number().positive(),
    maxW: z.number().positive(),
    minH: z.number().positive(),
    maxH: z.number().positive(),
    groups: z.array(
      z.object({
        key: z.string().min(1),
        label: z.string().trim().min(1, 'Every option group needs a name.'),
        display: z.enum(['buttons', 'select']),
        choices: z.array(choiceSchema).min(1, 'Every option group needs at least one choice.'),
      }),
    ),
    qtyBreaks: z.array(z.object({ min: z.number().int().min(2), discountPct: z.number().min(0).max(90) })),
    minimumPerItem: z.number().min(0),
    templates: z.array(z.enum(['for-sale', 'headline', 'banner', 'logo-center'])),
  })
  .refine((c) => c.sizes.length > 0 || c.allowCustomSize, 'Add at least one size, or allow custom sizes.')
  .refine((c) => c.minW <= c.maxW && c.minH <= c.maxH, 'Minimum sizes must not exceed maximum sizes.');

const productSchema = z.object({
  id: z.number().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes for the web address.'),
  name: z.string().trim().min(2, 'Enter a product name.'),
  description: z.string().trim().max(400),
  active: z.boolean(),
  sort: z.number().int(),
  config: configSchema,
});

export type SaveProductResult = { ok: true; id: number } | { ok: false; message: string };

export async function saveDesignProduct(input: Omit<DesignProduct, 'id'> & { id?: number }): Promise<SaveProductResult> {
  await requireRole('admin');
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
  const clash = db()
    .prepare(`SELECT id FROM design_products WHERE slug = ? AND id <> ?`)
    .get(parsed.data.slug, parsed.data.id ?? 0);
  if (clash) return { ok: false, message: 'Another product already uses that web address.' };
  const id = saveProduct(parsed.data);
  revalidatePath('/design');
  revalidatePath('/rewards/admin/designer');
  return { ok: true, id };
}

export async function deleteDesignProduct(formData: FormData) {
  await requireRole('admin');
  deleteProduct(Number(formData.get('id')));
  revalidatePath('/design');
  redirect(`/rewards/admin/designer?notice=${encodeURIComponent('Product deleted.')}`);
}

// ================================================================ admin: quotes

export async function setQuoteStatus(formData: FormData) {
  await requireRole('admin');
  const status = String(formData.get('status'));
  const id = Number(formData.get('id'));
  if (!['new', 'contacted', 'won', 'lost'].includes(status)) return;
  db().prepare(`UPDATE design_quotes SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
  revalidatePath('/rewards/admin/quotes');
  redirect(`/rewards/admin/quotes/${id}?notice=${encodeURIComponent(`Marked as ${status}.`)}`);
}
