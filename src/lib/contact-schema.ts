import { z } from 'zod';

/**
 * Shared between the client form and the `/api/contact` route handler, so the
 * two can never drift apart.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(120, 'That name is a little too long.'),
  email: z.string().trim().email('Please enter a valid e-mail address.').max(200),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a contact number we can reach you on.')
    .max(40, 'That contact number is too long.')
    .regex(/^[0-9+()\-.\s]+$/, 'Please use digits, spaces and + ( ) - only.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little more — at least 10 characters.')
    .max(4000, 'Please keep your message under 4000 characters.'),
  /** Honeypot. Real people never see this field, so it must stay empty. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldName = keyof Omit<ContactInput, 'company'>;

export type ContactResponse =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<Record<ContactFieldName, string>> };
