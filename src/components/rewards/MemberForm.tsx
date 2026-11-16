'use client';

import { BRANCHES } from '@/lib/rewards/constants';
import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Field, SubmitButton } from './Form';

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

export type MemberFormValues = {
  form_no?: string | null;
  card_no?: string | null;
  date?: string;
  name?: string;
  gender?: string;
  email?: string;
  address?: string;
  dob?: string;
  phone?: string;
  system_pk?: string | null;
  branch?: string | null;
};

/**
 * Member add/edit form.
 * - admin-create: also creates the member's login (password) and needs system pk + branch.
 * - admin-edit: form/card no. and ERP customer optional (self-registered members start without them).
 * - staff: the basic profile; the member inherits the staff account's branch.
 */
export function MemberForm({
  action,
  mode,
  initial = {},
  submitLabel,
  branchEditable = true,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  mode: 'admin-create' | 'admin-edit' | 'staff';
  initial?: MemberFormValues;
  submitLabel: string;
  branchEditable?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <ActionForm action={action} className="grid gap-5 space-y-0 sm:grid-cols-2">
      <Field name="name" label="Full name" required defaultValue={initial.name} className="sm:col-span-2" />
      <Field name="form_no" label="Form no." required={mode !== 'admin-edit'} defaultValue={initial.form_no} />
      <Field name="card_no" label="Card no." required={mode !== 'admin-edit'} defaultValue={initial.card_no} />
      <Field name="date" label="Date enrolled" type="date" required defaultValue={initial.date ?? today} />
      <Field name="gender" label="Gender" options={GENDERS} required defaultValue={initial.gender} />
      <Field name="email" label="Email" type="email" required defaultValue={initial.email} />
      <Field name="phone" label="Phone" type="tel" required defaultValue={initial.phone} />
      <Field name="dob" label="Date of birth" type="date" required defaultValue={initial.dob} />
      <Field name="address" label="Address" required defaultValue={initial.address} />

      {mode !== 'staff' ? (
        <>
          <Field
            name="system_pk"
            label="ERP customer ID"
            required={mode === 'admin-create'}
            defaultValue={initial.system_pk}
            hint="Invoices for this customer earn points through the ERP sync."
          />
          {branchEditable ? (
            <Field name="branch" label="Branch" options={BRANCHES} required defaultValue={initial.branch} />
          ) : (
            <div />
          )}
        </>
      ) : null}

      {mode === 'admin-create' ? (
        <>
          <Field name="password" label="Login password" type="password" required autoComplete="new-password" hint="At least 6 characters." />
          <Field name="password_confirmation" label="Confirm password" type="password" required autoComplete="new-password" />
        </>
      ) : null}

      <div className="sm:col-span-2">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
