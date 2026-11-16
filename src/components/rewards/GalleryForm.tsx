'use client';

import { BRANCHES } from '@/lib/rewards/constants';
import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Field, SubmitButton } from './Form';

export function GalleryForm({ action }: { action: (state: FormState, formData: FormData) => Promise<FormState> }) {
  return (
    <ActionForm action={action} className="max-w-form">
      <Field name="image" label="Image" type="file" accept="image/*" required />
      <Field name="branch" label="Branch" options={BRANCHES} required />
      <Field name="title" label="Title (optional)" />
      <Field name="description" label="Description (optional)" textarea />
      <SubmitButton>Upload</SubmitButton>
    </ActionForm>
  );
}
