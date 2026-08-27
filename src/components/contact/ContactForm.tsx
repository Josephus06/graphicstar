'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { contactPage } from '@/content/contact';
import {
  contactSchema,
  type ContactFieldName,
  type ContactResponse,
} from '@/lib/contact-schema';
import { cn } from '@/lib/cn';
import { EASE_OUT } from '@/lib/motion';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldClass =
  'w-full border-0 border-b border-grey-line bg-transparent px-0 py-3 text-[16px] text-ink ' +
  'placeholder:text-ink/35 focus:border-blue focus:outline-none focus:ring-0 transition-colors duration-150';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<ContactFieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    // Client-side pass first, using the same schema the API validates with.
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<ContactFieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as ContactFieldName;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus('idle');
      // Move the user to the first problem.
      const first = Object.keys(fieldErrors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as ContactResponse;

      if (result.ok) {
        setStatus('success');
        return;
      }

      setStatus('error');
      setErrors(result.fieldErrors ?? {});
      setFormError(result.message || contactPage.form.errorBody);
    } catch {
      setStatus('error');
      setFormError(contactPage.form.errorBody);
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        role="status"
        className="mx-auto max-w-form rounded-card bg-white p-9 text-center shadow-card"
      >
        <p className="text-[24px] font-bold tracking-tight text-ink">
          {contactPage.form.successTitle}
        </p>
        <p className="body-copy mt-3">{contactPage.form.successBody}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-form">
      {/* Honeypot — off-screen and skipped by assistive tech. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-7">
        {contactPage.form.fields.map((field) => {
          const name = field.name as ContactFieldName;
          const error = errors[name];
          const describedBy = error ? `${name}-error` : undefined;

          return (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-[12px] font-medium uppercase tracking-[0.08em] text-ink/55"
              >
                {field.label}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={4}
                  placeholder={field.placeholder}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={cn(fieldClass, 'resize-y', error && 'border-orange')}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={cn(fieldClass, error && 'border-orange')}
                />
              )}

              {error ? (
                <p id={`${name}-error`} className="mt-2 text-[13px] font-medium text-orange">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {formError ? (
        <p role="alert" className="mt-6 text-[14px] font-medium text-orange">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={status === 'submitting'}
        className="mt-10 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? contactPage.form.submittingLabel : contactPage.form.submitLabel}
      </Button>
    </form>
  );
}
