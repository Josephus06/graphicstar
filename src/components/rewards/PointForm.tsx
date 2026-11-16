'use client';

import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Field, SubmitButton } from './Form';

export function PointForm({
  action,
  initial,
  members,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial: { member_id: number; bill_no: string; bill_amount: number; points: number };
  members: { value: string; label: string }[];
}) {
  return (
    <ActionForm action={action} className="max-w-form">
      <Field name="member_id" label="Member" options={members} required defaultValue={String(initial.member_id)} />
      <Field name="bill_no" label="Bill no." required defaultValue={initial.bill_no} />
      <Field name="bill_amount" label="Bill amount (₱)" type="number" step="0.01" required defaultValue={initial.bill_amount} />
      <Field name="points" label="Points" type="number" step="0.00001" required defaultValue={initial.points} />
      <SubmitButton>Update</SubmitButton>
    </ActionForm>
  );
}
