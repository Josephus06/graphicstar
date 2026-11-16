'use client';

import { login, registerMember } from '@/lib/rewards/actions/auth';
import { BRANCHES } from '@/lib/rewards/constants';
import { ActionForm, Field, SubmitButton } from './Form';

export function LoginForm() {
  return (
    <ActionForm action={login}>
      <Field name="email" label="Email" type="email" autoComplete="email" required />
      <Field name="password" label="Password" type="password" autoComplete="current-password" required />
      <SubmitButton className="w-full">Log in</SubmitButton>
    </ActionForm>
  );
}

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

export function RegisterForm() {
  return (
    <ActionForm action={registerMember} className="grid gap-5 space-y-0 sm:grid-cols-2">
      <Field name="name" label="Full name" required autoComplete="name" className="sm:col-span-2" />
      <Field name="email" label="Email" type="email" required autoComplete="email" />
      <Field name="phone" label="Phone" type="tel" required autoComplete="tel" />
      <Field name="branch" label="Branch" options={BRANCHES} required className="sm:col-span-2" />
      <Field name="gender" label="Gender" options={GENDERS} required />
      <Field name="dob" label="Date of birth" type="date" required />
      <Field name="address" label="Address" required autoComplete="street-address" className="sm:col-span-2" />
      <Field name="password" label="Password" type="password" required autoComplete="new-password" hint="At least 6 characters." />
      <Field name="password_confirmation" label="Confirm password" type="password" required autoComplete="new-password" />
      <div className="sm:col-span-2">
        <SubmitButton className="w-full">Register</SubmitButton>
      </div>
    </ActionForm>
  );
}
