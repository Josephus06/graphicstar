import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  contactSchema,
  type ContactFieldName,
  type ContactResponse,
} from '@/lib/contact-schema';

export const runtime = 'nodejs';

const TO = process.env.CONTACT_TO_EMAIL ?? 'inquiry@graphicstar.ph';
const FROM = process.env.CONTACT_FROM_EMAIL ?? 'website@graphicstar.ph';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Malformed request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactFieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactFieldName;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, message: 'Please check the highlighted fields.', fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, phone, message, company } = parsed.data;

  // Honeypot tripped — accept silently so bots get no signal.
  if (company) return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;

  // Dev stub: without a key, log the enquiry instead of sending it.
  if (!apiKey) {
    console.info('[contact] RESEND_API_KEY not set — enquiry logged instead of sent:', {
      name,
      email,
      phone,
      message,
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Cebu GraphicStar Website <${FROM}>`,
      to: [TO],
      replyTo: email,
      subject: `Website enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `E-mail: ${email}`,
        `Contact number: ${phone}`,
        '',
        message,
      ].join('\n'),
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Contact number:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('[contact] Resend rejected the message:', error);
      return NextResponse.json(
        { ok: false, message: 'We could not send your message. Please try again or call us.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact] Unexpected failure:', error);
    return NextResponse.json(
      { ok: false, message: 'We could not send your message. Please try again or call us.' },
      { status: 500 },
    );
  }
}
