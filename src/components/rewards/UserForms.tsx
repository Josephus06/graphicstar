'use client';

import { BRANCHES } from '@/lib/rewards/constants';
import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Field, SubmitButton } from './Form';

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function StaffRegisterForm({ action }: { action: Action }) {
  return (
    <ActionForm action={action} className="max-w-form">
      <Field name="name" label="Name" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="branch" label="Branch" options={BRANCHES} required />
      <Field name="password" label="Password" type="password" required autoComplete="new-password" hint="At least 6 characters." />
      <SubmitButton>Register staff</SubmitButton>
    </ActionForm>
  );
}

export function UserEditForm({ action, initial }: { action: Action; initial: { name: string; email: string; branch: string | null } }) {
  // Keep any legacy branch value selectable alongside the two known branches.
  const options =
    initial.branch && !BRANCHES.some((b) => b.value === initial.branch)
      ? [...BRANCHES, { value: initial.branch, label: initial.branch }]
      : BRANCHES;
  return (
    <ActionForm action={action} className="max-w-form">
      <Field name="name" label="Name" required defaultValue={initial.name} />
      <Field name="email" label="Email" type="email" required defaultValue={initial.email} />
      <Field name="branch" label="Branch" options={options} required defaultValue={initial.branch} />
      <SubmitButton>Update user</SubmitButton>
    </ActionForm>
  );
}

export function ChangePasswordForm({ action }: { action: Action }) {
  return (
    <ActionForm action={action} className="max-w-form">
      <Field name="password" label="Current password" type="password" required autoComplete="off" />
      <Field name="new_password" label="New password" type="password" required autoComplete="new-password" hint="At least 8 characters." />
      <Field name="new_password_confirmation" label="Confirm new password" type="password" required autoComplete="new-password" />
      <SubmitButton>Change password</SubmitButton>
    </ActionForm>
  );
}
