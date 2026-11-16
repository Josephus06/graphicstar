import type { ZodError, ZodTypeAny, z } from 'zod';

/** What every Rewards server action hands back to its form. */
export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of the submitted values so the form can repopulate after an error. */
  values?: Record<string, string>;
};

export const emptyState: FormState = {};

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$ACTION') && !key.includes('password')) values[key] = value;
  }
  return values;
}

export function fieldErrorsOf(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    out[key] ??= issue.message;
  }
  return out;
}

type Parsed<S extends ZodTypeAny> = { data: z.infer<S>; state?: undefined } | { data?: undefined; state: FormState };

export function parseForm<S extends ZodTypeAny>(schema: S, formData: FormData): Parsed<S> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') raw[key] = value.trim();
  }
  const result = schema.safeParse(raw);
  if (result.success) return { data: result.data };
  return {
    state: {
      error: 'Please fix the highlighted fields.',
      fieldErrors: fieldErrorsOf(result.error),
      values: formValues(formData),
    },
  };
}

/** SQLite unique-constraint failures, turned into a field message. */
export function uniqueViolation(error: unknown): string | null {
  const message = (error as Error)?.message ?? '';
  const match = message.match(/UNIQUE constraint failed: \w+\.(\w+)/);
  return match ? match[1] : null;
}
