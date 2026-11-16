import { z } from 'zod';
import { db } from './db';

/** Validation rules ported from the loyalty-gfx controllers. */

const required = (label: string) => z.string({ required_error: `The ${label} field is required.` }).min(1, `The ${label} field is required.`);
const date = (label: string) => required(label).refine((v) => !Number.isNaN(Date.parse(v)), `The ${label} must be a valid date.`);
const numeric = (label: string) =>
  required(label)
    .refine((v) => v !== '' && Number.isFinite(Number(v)), `The ${label} must be a number.`)
    .transform(Number);

export const rules = { required, date, numeric };

export const email = z.string().min(1, 'The email field is required.').email('The email must be a valid email address.');

export const memberFields = {
  form_no: required('form no'),
  card_no: required('card no'),
  date: date('date'),
  name: required('name'),
  gender: z.enum(['M', 'F'], { errorMap: () => ({ message: 'The gender field is required.' }) }),
  email,
  address: required('address'),
  dob: date('date of birth'),
  phone: required('phone'),
};

export const passwordConfirmed = (min: number) =>
  z
    .object({
      password: z.string().min(min, `The password must be at least ${min} characters.`),
      password_confirmation: z.string(),
    })
    .refine((v) => v.password === v.password_confirmation, {
      message: 'The password confirmation does not match.',
      path: ['password'],
    });

type Taken = { table: 'members' | 'users'; column: string; value: string; ignoreId?: number; message: string; field: string };

/** Laravel's unique:table,column,ignoreId rule. Returns field errors for any taken values. */
export function checkUnique(checks: Taken[]): Record<string, string> | null {
  const errors: Record<string, string> = {};
  for (const c of checks) {
    if (errors[c.field]) continue;
    const row = db()
      .prepare(`SELECT id FROM ${c.table} WHERE ${c.column} = ? COLLATE NOCASE ${c.ignoreId ? 'AND id <> ?' : ''} LIMIT 1`)
      .get(...(c.ignoreId ? [c.value, c.ignoreId] : [c.value]));
    if (row) errors[c.field] = c.message;
  }
  return Object.keys(errors).length ? errors : null;
}

export const takenMsg = (label: string) => `The ${label} has already been taken.`;
