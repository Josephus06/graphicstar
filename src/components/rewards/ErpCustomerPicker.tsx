'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { searchErpCustomers, verifyMember } from '@/lib/rewards/actions/members';
import type { ErpCustomer } from '@/lib/rewards/erp';
import { inputClass } from './Form';

/**
 * Pick the ERP customer for one waiting member: search the ERP by name (pre-filled with the
 * member's name), then "Link" the right result. Falls back to typing the ERP customer id when
 * the ERP connection is not configured.
 */
export function ErpCustomerPicker({ memberId, memberName, erpReady }: { memberId: number; memberName: string; erpReady: boolean }) {
  const [query, setQuery] = useState(memberName);
  const [results, setResults] = useState<ErpCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = (q: string) =>
    startSearch(async () => {
      const result = await searchErpCustomers(q);
      if (result.ok) {
        setResults(result.customers);
        setError(null);
      } else {
        setResults(null);
        setError(result.error);
      }
    });

  // Search as the admin types (debounced).
  useEffect(() => {
    if (!erpReady) return;
    clearTimeout(timer.current);
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => run(query), 350);
    return () => clearTimeout(timer.current);
  }, [query, erpReady]);

  if (!erpReady) {
    return (
      <form action={verifyMember} className="flex gap-2">
        <input type="hidden" name="id" value={memberId} />
        <label htmlFor={`erp-${memberId}`} className="sr-only">
          ERP customer ID for {memberName}
        </label>
        <input id={`erp-${memberId}`} name="system_pk" required placeholder="ERP customer ID" className={inputClass} />
        <LinkButton label="Verify & link" />
      </form>
    );
  }

  return (
    <div>
      <label htmlFor={`erp-search-${memberId}`} className="sr-only">
        Search the ERP for {memberName}
      </label>
      <input
        id={`erp-search-${memberId}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ERP customers by name, company or code"
        className={inputClass}
        autoComplete="off"
      />
      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-white" aria-live="polite">
        {searching && !results ? <p className="px-3 py-2 text-[13px] text-grey-muted">Searching the ERP…</p> : null}
        {error ? <p className="px-3 py-2 text-[13px] font-medium text-magenta">{error}</p> : null}
        {results && results.length === 0 ? (
          <p className="px-3 py-2 text-[13px] text-grey-muted">No ERP customer matches “{query}”. Try part of the name.</p>
        ) : null}
        {results?.length ? (
          <ul className="divide-y divide-grey-line/70">
            {results.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-[12px] text-grey-muted">
                    ERP #{c.id}
                    {c.customer_code ? ` · ${c.customer_code}` : ''}
                    {c.company_name && c.company_name !== c.name ? ` · ${c.company_name}` : ''}
                    {c.is_active ? '' : ' · inactive'}
                  </p>
                </div>
                <form
                  action={verifyMember}
                  onSubmit={(e) => {
                    if (!window.confirm(`Link ${memberName} to ERP customer "${c.name}" (#${c.id})?`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={memberId} />
                  <input type="hidden" name="system_pk" value={c.id} />
                  <LinkButton label="Link" />
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function LinkButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-full bg-blue px-4 py-2 text-[12px] font-bold uppercase tracking-cta text-white transition-colors hover:bg-blue-deep disabled:opacity-60"
    >
      {pending ? 'Linking…' : label}
    </button>
  );
}
