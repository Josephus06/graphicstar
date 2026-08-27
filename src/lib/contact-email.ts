import type { ContactInput } from '@/lib/contact-schema';

/**
 * Renders the enquiry notification e-mail.
 *
 * Written to the constraints of e-mail clients rather than the browser: a
 * table-based layout, inline styles only, no external CSS or web fonts, and a
 * 600px container. Outlook ignores most of the box model on `<div>`, so every
 * band is a table cell with its own padding.
 *
 * All interpolated values are user input from a public form, so each one is
 * escaped. Nothing here is rendered as markup.
 */

type Fields = Omit<ContactInput, 'company'>;

const BRAND = {
  ink: '#151515',
  orange: '#ED7504',
  blue: '#0500FF',
  bg: '#EFEFEF',
  panel: '#F7F7F7',
  line: '#DDDDDD',
  muted: '#6B6B6B',
} as const;

/** Montserrat will not load in a mail client; this is the closest safe stack. */
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Newlines are the only formatting we carry over from the textarea. */
const toParagraphHtml = (value: string) =>
  escapeHtml(value).split(/\r?\n/).join('<br>');

/** One label/value row of the details table. */
const detailRow = (label: string, valueHtml: string, isLast = false) => `
              <tr>
                <td style="padding:14px 0;${isLast ? '' : `border-bottom:1px solid ${BRAND.line};`}font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};width:150px;vertical-align:top;">
                  ${label}
                </td>
                <td style="padding:14px 0;${isLast ? '' : `border-bottom:1px solid ${BRAND.line};`}font-family:${FONT};font-size:16px;color:${BRAND.ink};vertical-align:top;">
                  ${valueHtml}
                </td>
              </tr>`;

export function renderContactEmail({ name, email, phone, message }: Fields) {
  const receivedAt = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date());

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    `Re: your enquiry to Cebu GraphicStar`,
  )}`;

  // Shown in the inbox preview line, then hidden in the body itself.
  const preheader = escapeHtml(message.replace(/\s+/g, ' ').slice(0, 140));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>New website enquiry</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

          <!-- Brand bar. A solid rule, not a gradient: gradients do not render
               in Outlook and degrade to nothing. -->
          <tr><td style="height:5px;background-color:${BRAND.orange};font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:28px 32px 0 32px;font-family:${FONT};">
              <div style="font-size:18px;font-weight:bold;letter-spacing:0.02em;color:${BRAND.ink};">
                Cebu GraphicStar
              </div>
              <div style="margin-top:4px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.orange};">
                Creations Made Easy
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0 32px;font-family:${FONT};">
              <div style="font-size:24px;font-weight:bold;color:${BRAND.ink};">New website enquiry</div>
              <div style="margin-top:6px;font-size:13px;color:${BRAND.muted};">Received ${receivedAt}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
${detailRow('Name', safeName)}
${detailRow(
  'E-mail',
  `<a href="mailto:${safeEmail}" style="color:${BRAND.blue};text-decoration:none;">${safeEmail}</a>`,
)}
${detailRow(
  'Contact number',
  `<a href="tel:${safePhone.replace(/[^0-9+]/g, '')}" style="color:${BRAND.blue};text-decoration:none;">${safePhone}</a>`,
  true,
)}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0 32px;font-family:${FONT};">
              <div style="font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">
                Message
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-collapse:collapse;">
                <tr>
                  <td style="padding:18px 20px;background-color:${BRAND.panel};border-left:4px solid ${BRAND.orange};font-family:${FONT};font-size:16px;line-height:1.65;color:${BRAND.ink};">
                    ${toParagraphHtml(message)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA. A padded table cell rather than a styled <a>, so Outlook
               renders the full button area instead of just the text. -->
          <tr>
            <td style="padding:26px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${BRAND.orange};border-radius:999px;">
                    <a href="${replyHref}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 30px 32px;">
              <div style="border-top:1px solid ${BRAND.line};padding-top:16px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND.muted};">
                Sent from the contact form on graphicstar.ph. Replying to this
                message goes straight to the sender.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text alternative, kept in step with the HTML above. Clients that
  // refuse HTML — and most spam filters — read this instead.
  const text = [
    'NEW WEBSITE ENQUIRY',
    `Received ${receivedAt}`,
    '',
    `Name:           ${name}`,
    `E-mail:         ${email}`,
    `Contact number: ${phone}`,
    '',
    'Message:',
    message,
    '',
    '--',
    'Sent from the contact form on graphicstar.ph.',
    'Replying to this message goes straight to the sender.',
  ].join('\n');

  return { subject: `Website enquiry from ${name}`, html, text };
}
