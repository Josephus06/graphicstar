import type { PriceBreakdown } from './model';
import { peso } from './model';

/** Notification e-mail for a Design Online quote request (table layout, inline styles). */

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export type QuoteEmailInput = {
  reference: string;
  product: string;
  size: string;
  qty: number;
  breakdown: PriceBreakdown;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  notes?: string | null;
  artworkName?: string | null;
  adminUrl: string;
};

export function renderQuoteEmail(q: QuoteEmailInput) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #DDDDDD;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#6B6B6B;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #DDDDDD;font-family:${FONT};font-size:15px;color:#151515;vertical-align:top;">${value}</td>
    </tr>`;

  const options = q.breakdown.lines.map((l) => row(esc(l.group), esc(l.choice))).join('');
  const price =
    `${peso(q.breakdown.perItem)} each × ${q.qty}` +
    (q.breakdown.discountPct ? ` − ${q.breakdown.discountPct}% = <b>${peso(q.breakdown.total)}</b>` : ` = <b>${peso(q.breakdown.total)}</b>`);

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Design quote ${esc(q.reference)}</title></head>
<body style="margin:0;padding:0;background:#EFEFEF;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEFEF;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;">
<tr><td style="padding:28px 32px 8px;font-family:${FONT};">
  <div style="font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#ED7504;">Design Online · quote request</div>
  <h1 style="margin:10px 0 4px;font-size:24px;color:#151515;">${esc(q.product)}, ${esc(q.size)} × ${q.qty}</h1>
  <div style="font-size:14px;color:#6B6B6B;">Reference ${esc(q.reference)}</div>
</td></tr>
<tr><td style="padding:8px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  ${row('Customer', esc(q.name) + (q.company ? `<br><span style="color:#6B6B6B">${esc(q.company)}</span>` : ''))}
  ${row('Email', `<a href="mailto:${encodeURIComponent(q.email)}" style="color:#0500FF;">${esc(q.email)}</a>`)}
  ${row('Phone', esc(q.phone))}
  ${row('Size', esc(q.size))}
  ${options}
  ${row('Quantity', String(q.qty))}
  ${row('Website price', price)}
  ${row('Artwork', q.artworkName ? esc(q.artworkName) + ' (attached)' : 'Made with an online template (proof attached)')}
  ${q.notes ? row('Notes', esc(q.notes).replace(/\r?\n/g, '<br>')) : ''}
</table></td></tr>
<tr><td style="padding:24px 32px 32px;font-family:${FONT};">
  <a href="${esc(q.adminUrl)}" style="display:inline-block;background:#ED7504;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;padding:14px 26px;border-radius:999px;">Open in admin</a>
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `Design Online quote request ${q.reference}`,
    `${q.product}, ${q.size} x ${q.qty}`,
    ...q.breakdown.lines.map((l) => `${l.group}: ${l.choice}`),
    `Website price: ${peso(q.breakdown.total)}${q.breakdown.discountPct ? ` (incl. ${q.breakdown.discountPct}% quantity discount)` : ''}`,
    '',
    `Customer: ${q.name}${q.company ? ` (${q.company})` : ''}`,
    `Email: ${q.email}`,
    `Phone: ${q.phone}`,
    q.notes ? `Notes: ${q.notes}` : '',
    '',
    `Admin: ${q.adminUrl}`,
  ].join('\n');

  return { subject: `Design quote ${q.reference}: ${q.product} ${q.size} × ${q.qty}`, html, text };
}
