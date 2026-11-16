'use client';

import { useSearchParams } from 'next/navigation';
import { Alert } from './Form';

/** Flash message passed through the redirect URL (?notice= / ?error=). */
export function Notice() {
  const params = useSearchParams();
  const notice = params.get('notice');
  const error = params.get('error');
  if (!notice && !error) return null;
  return (
    <div className="mt-4">
      {error && error !== '1' ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
    </div>
  );
}
