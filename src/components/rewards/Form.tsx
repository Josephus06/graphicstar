'use client';

import { createContext, useActionState, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { emptyState, type FormState } from '@/lib/rewards/forms';

/**
 * Server-action form with inline validation. Fields read the action's state
 * from context, so they show their own error and keep their value on failure.
 */

const StateContext = createContext<FormState>(emptyState);

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  encType,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  encType?: 'multipart/form-data';
}) {
  const [state, formAction] = useActionState(action, emptyState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && resetOnSuccess) ref.current?.reset();
    if (state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0];
      ref.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  }, [state, resetOnSuccess]);

  return (
    <StateContext.Provider value={state}>
      {/* React sends function actions as multipart already, so encType is not set on the element. */}
      <form ref={ref} action={formAction} data-enctype={encType} className={cn('space-y-5', className)} noValidate>
        {state.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.success ? <Alert tone="success">{state.success}</Alert> : null}
        {children}
      </form>
    </StateContext.Provider>
  );
}

export const useFormState = () => useContext(StateContext);

export function Alert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-card px-4 py-3 text-sm font-medium',
        tone === 'error' && 'bg-magenta/10 text-magenta-dark',
        tone === 'success' && 'bg-emerald-50 text-emerald-800',
        tone === 'info' && 'bg-blue/5 text-blue-deep',
      )}
    >
      {children}
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-grey-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 ' +
  'transition-colors duration-150 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15 ' +
  'aria-[invalid=true]:border-magenta';

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  step?: string;
  className?: string;
  /** Renders a <select> when given. */
  options?: ReadonlyArray<{ value: string; label: string }>;
  textarea?: boolean;
  accept?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export function Field({
  name,
  label,
  type = 'text',
  defaultValue,
  required,
  placeholder,
  hint,
  autoComplete,
  step,
  className,
  options,
  textarea,
  accept,
  readOnly,
  value,
  onChange,
}: FieldProps) {
  const state = useFormState();
  const error = state.fieldErrors?.[name];
  const id = `f-${name}`;
  // After a failed submit, show what the user typed rather than the original value.
  const initial = state.values && name in state.values ? state.values[name] : (defaultValue ?? '');
  const common = {
    id,
    name,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: inputClass,
  } as const;
  const controlled = value !== undefined ? { value, onChange: (e: { target: { value: string } }) => onChange?.(e.target.value) } : null;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
        {required ? <span className="text-magenta"> *</span> : null}
      </label>
      {options ? (
        <select key={String(initial)} {...common} {...(controlled ?? { defaultValue: String(initial) })}>
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea key={String(initial)} {...common} rows={4} placeholder={placeholder} defaultValue={String(initial)} />
      ) : type === 'file' ? (
        <input {...common} type="file" accept={accept} className={cn(inputClass, 'py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white')} />
      ) : (
        <input
          key={controlled ? undefined : String(initial)}
          {...common}
          type={type}
          step={step}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          {...(controlled ?? { defaultValue: type === 'password' ? undefined : String(initial) })}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-magenta">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-grey-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ children, className, variant }: { children: ReactNode; className?: string; variant?: 'orange' | 'outline' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant} className={cn('disabled:opacity-60', className)}>
      {pending ? 'Please wait…' : children}
    </Button>
  );
}

/** A one-button form for delete / mark-as-redeemed, with a confirm prompt. */
export function ConfirmButton({
  action,
  fields,
  confirm,
  children,
  tone = 'danger',
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  confirm?: string;
  children: ReactNode;
  tone?: 'danger' | 'primary';
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline"
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <InlineSubmit tone={tone}>{children}</InlineSubmit>
    </form>
  );
}

function InlineSubmit({ children, tone }: { children: ReactNode; tone: 'danger' | 'primary' }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50',
        tone === 'danger' ? 'text-magenta hover:bg-magenta/10' : 'bg-blue text-white hover:bg-blue-deep',
      )}
    >
      {children}
    </button>
  );
}
