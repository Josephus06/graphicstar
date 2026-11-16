/**
 * Client for the ERP's read-only loyalty feed (GSUITE ERP: server/src/routes/loyaltyIntegration.js).
 *
 *   ERP_API_URL=https://<erp-host>/api/integrations/loyalty
 *   ERP_API_KEY=<same value as LOYALTY_API_KEY on the ERP>
 */

export type ErpCustomer = {
  id: number;
  customer_code: string | null;
  name: string;
  company_name: string | null;
  is_active: boolean;
};

export type ErpInvoice = {
  id: number;
  invoice_no: string;
  date: string;
  gross_amount: number;
  amount_due: number;
  status: string;
  cancelled: boolean;
};

export const erpConfigured = () => Boolean(process.env.ERP_API_URL && process.env.ERP_API_KEY);

export class ErpError extends Error {}

async function call<T>(path: string): Promise<T> {
  if (!erpConfigured()) throw new ErpError('The ERP connection is not configured (ERP_API_URL / ERP_API_KEY).');
  let response: Response;
  try {
    response = await fetch(`${process.env.ERP_API_URL!.replace(/\/$/, '')}${path}`, {
      headers: { 'x-api-key': process.env.ERP_API_KEY!, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    throw new ErpError(`The ERP could not be reached (${(error as Error).message}).`);
  }
  if (response.status === 404) throw new ErpError('Not found in the ERP.');
  if (response.status === 401) throw new ErpError('The ERP rejected the API key.');
  if (response.status === 503) throw new ErpError('The loyalty feed is switched off in the ERP (LOYALTY_API_KEY).');
  if (!response.ok) throw new ErpError(`The ERP answered HTTP ${response.status}.`);
  return ((await response.json()) as { data: T }).data;
}

export const searchCustomers = (q: string) => call<ErpCustomer[]>(`/customers?q=${encodeURIComponent(q)}`);
export const getCustomer = (id: string | number) => call<ErpCustomer>(`/customers/${encodeURIComponent(String(id))}`);
export const getInvoices = (customerId: string | number, since: string) =>
  call<ErpInvoice[]>(`/customers/${encodeURIComponent(String(customerId))}/invoices?since=${since}`);

export const customerLabel = (c: ErpCustomer) =>
  [c.name, c.company_name && c.company_name !== c.name ? `(${c.company_name})` : null, c.customer_code ? `· ${c.customer_code}` : null]
    .filter(Boolean)
    .join(' ');
