'use client';

import { useState, useTransition } from 'react';
import { lookupMember, type MemberLookup } from '@/lib/rewards/actions/points';
import { formatPoints, formatRate, isFreshTidy, manualRateFor, pointsForBill, type PointRates } from '@/lib/rewards/constants';
import type { FormState } from '@/lib/rewards/forms';
import { ActionForm, Alert, Field, SubmitButton, inputClass } from './Form';

type Found = Extract<MemberLookup, { ok: true }>['member'];

/**
 * Add Points: look a member up by card no., phone or e-mail, then record a bill.
 * Points fill in from the bill amount using the member's branch rule
 * (Fresh & Tidy ₱100 = 1 point, otherwise ₱10,000 = 1 point) and stay editable.
 */
export function AddPoints({
  action,
  rates,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  rates: PointRates;
}) {
  const [query, setQuery] = useState('');
  const [member, setMember] = useState<Found | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [points, setPoints] = useState('');
  const [searching, startSearch] = useTransition();

  const search = () =>
    startSearch(async () => {
      setError(null);
      const result = await lookupMember(query);
      if (result.ok) {
        setMember(result.member);
        setAmount('');
        setPoints('');
      } else {
        setMember(null);
        setError(result.error);
      }
    });

  // Wrap the action so a successful save clears the bill fields and refreshes the balance.
  const save = async (state: FormState, formData: FormData) => {
    const result = await action(state, formData);
    if (result.success && member) {
      const refreshed = await lookupMember(member.email);
      if (refreshed.ok) setMember(refreshed.member);
      setAmount('');
      setPoints('');
    }
    return result;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-media bg-white p-5 shadow-card sm:p-7">
        <h2 className="text-[18px] font-semibold text-ink">Find member</h2>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label htmlFor="member-search" className="sr-only">
            Card no., phone or e-mail
          </label>
          <input
            id="member-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Card no., phone or e-mail"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={searching}
            className="shrink-0 rounded-full bg-ink px-5 text-[12px] font-bold uppercase tracking-cta text-white disabled:opacity-60"
          >
            {searching ? '…' : 'Search'}
          </button>
        </form>

        {error ? (
          <div className="mt-4">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}

        {member ? (
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
            <dt className="text-grey-muted">Name</dt>
            <dd className="font-semibold text-ink">{member.name}</dd>
            <dt className="text-grey-muted">Branch</dt>
            <dd className="text-ink">{member.branch ?? '—'}</dd>
            <dt className="text-grey-muted">Card no.</dt>
            <dd className="text-ink">{member.card_no ?? '—'}</dd>
            <dt className="text-grey-muted">Form no.</dt>
            <dd className="text-ink">{member.form_no ?? '—'}</dd>
            <dt className="text-grey-muted">Phone</dt>
            <dd className="text-ink">{member.phone}</dd>
            <dt className="text-grey-muted">Email</dt>
            <dd className="break-all text-ink">{member.email}</dd>
            <dt className="text-grey-muted">Total points</dt>
            <dd className="text-[22px] font-semibold text-blue">{formatPoints(member.total_points)}</dd>
          </dl>
        ) : null}
      </div>

      <div className="rounded-media bg-white p-5 shadow-card sm:p-7">
        <h2 className="mb-4 text-[18px] font-semibold text-ink">Record a bill</h2>
        {member ? (
          <ActionForm action={save} key={member.id} resetOnSuccess>
            <input type="hidden" name="member_id" value={member.id} />
            <Field name="bill_no" label="Bill no." required />
            <Field
              name="bill_amount"
              label="Bill amount (₱)"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(v) => {
                setAmount(v);
                setPoints(v === '' ? '' : pointsForBill(member.branch, Number(v), rates).toFixed(5));
              }}
            />
            <Field
              name="points"
              label="Points"
              type="number"
              step="0.00001"
              required
              value={points}
              onChange={setPoints}
              hint={`${isFreshTidy(member.branch) ? 'Fresh & Tidy' : 'Cebu Graphicstar'}: ${formatRate(manualRateFor(member.branch, rates))}`}
            />
            <SubmitButton>Save points</SubmitButton>
          </ActionForm>
        ) : (
          <p className="text-grey-muted">Search for a member first.</p>
        )}
      </div>
    </div>
  );
}
