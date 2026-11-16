'use client';

import { useActionState } from 'react';
import { runErpSync } from '@/lib/rewards/actions/admin';
import type { SyncReport } from '@/lib/rewards/erp-sync';
import { Button } from '@/components/ui/Button';

export function SyncPanel() {
  const [report, action, pending] = useActionState<SyncReport | null>(runErpSync, null);
  return (
    <div>
      <p className="text-[14px] text-grey-muted">
        Reads every verified member&apos;s sales invoices from the ERP (since Jan 01, 2025) and awards 1 point per ₱1,000; cancelled
        or voided invoices lose their points. Runs hourly on its own while ERP_API_URL and ERP_API_KEY are set.
      </p>
      <form action={action} className="mt-4">
        <Button type="submit" variant="outline" disabled={pending} className="disabled:opacity-60">
          {pending ? 'Syncing…' : 'Sync now'}
        </Button>
      </form>
      {report ? (
        <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-card bg-grey-panel p-4 text-[12px] text-ink">
          {report.lines.join('\n')}
        </pre>
      ) : null}
    </div>
  );
}
