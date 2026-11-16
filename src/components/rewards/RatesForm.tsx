'use client';

import { useState } from 'react';
import { saveRates } from '@/lib/rewards/actions/admin';
import { formatPoints, type PointRates } from '@/lib/rewards/constants';
import { ActionForm, Field, SubmitButton } from './Form';

const ROWS: { key: keyof PointRates; label: string; hint: string }[] = [
  { key: 'graphicstar', label: 'Cebu Graphicstar: manual entry', hint: 'Used on Points → Add points for Cebu Graphicstar members.' },
  { key: 'freshTidy', label: 'Fresh & Tidy: manual entry', hint: 'Used on Points → Add points for Fresh & Tidy members, and shown in their terms.' },
  { key: 'erp', label: 'ERP paid invoices', hint: 'Used by the ERP sync for fully paid 2026 invoices.' },
];

/** Pesos per 1 point, with a live "₱X spent → Y points" example under each field. */
export function RatesForm({ rates }: { rates: PointRates }) {
  const [values, setValues] = useState<Record<keyof PointRates, string>>({
    graphicstar: String(rates.graphicstar),
    freshTidy: String(rates.freshTidy),
    erp: String(rates.erp),
  });

  return (
    <ActionForm action={saveRates} className="max-w-form">
      {ROWS.map((row) => {
        const rate = Number(values[row.key]);
        const example = rate > 0 ? `₱10,000 spent → ${formatPoints(Number((10000 / rate).toFixed(5)))} points` : '';
        return (
          <Field
            key={row.key}
            name={row.key}
            label={`${row.label}: pesos per 1 point`}
            type="number"
            step="0.01"
            required
            value={values[row.key]}
            onChange={(v) => setValues((s) => ({ ...s, [row.key]: v }))}
            hint={`${row.hint} ${example}`}
          />
        );
      })}
      <SubmitButton>Save settings</SubmitButton>
    </ActionForm>
  );
}
