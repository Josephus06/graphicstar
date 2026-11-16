'use client';

import { BRANCHES } from '@/lib/rewards/constants';
import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Field, SubmitButton } from './Form';

export function RewardForm({
  action,
  initial,
  currentImage,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: { name: string; points_required: number; branch: string | null; description: string | null };
  currentImage?: string | null;
}) {
  return (
    <ActionForm action={action} encType="multipart/form-data" className="max-w-form">
      <Field name="name" label="Reward name" required defaultValue={initial?.name} />
      <Field name="points_required" label="Points required" type="number" step="1" required defaultValue={initial?.points_required} />
      <Field name="branch" label="Branch" options={BRANCHES} required defaultValue={initial?.branch} />
      <Field name="description" label="Description" textarea defaultValue={initial?.description} />
      {currentImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentImage} alt="Current reward image" className="max-h-40 rounded-card" />
      ) : null}
      <Field
        name="image"
        label={currentImage ? 'Replace image' : 'Image'}
        type="file"
        accept="image/jpeg,image/png"
        required={!currentImage}
        hint="JPG or PNG, up to 4 MB."
      />
      <SubmitButton>{initial ? 'Update reward' : 'Add reward'}</SubmitButton>
    </ActionForm>
  );
}
