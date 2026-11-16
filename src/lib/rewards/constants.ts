/**
 * Business rules carried over from loyalty-gfx. Safe to import from client
 * components (no server-only dependencies).
 */

export const BRANCH_GRAPHICSTAR = 'Cebu Graphicstar Imaging Corp - Head Office';
export const BRANCH_FRESH_TIDY = 'Fresh and Tidy';

export const BRANCHES = [
  { value: BRANCH_GRAPHICSTAR, label: 'Cebu Graphicstar Imaging Corp - Head Office' },
  { value: BRANCH_FRESH_TIDY, label: 'Fresh & Tidy' },
] as const;

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

export const isFreshTidy = (branch: string | null | undefined) => norm(branch) === norm(BRANCH_FRESH_TIDY);
export const isGraphicstar = (branch: string | null | undefined) => norm(branch) === norm(BRANCH_GRAPHICSTAR);

/** Pesos per 1 point. Defaults from loyalty-gfx; admins change them on Admin → Settings. */
export type PointRates = { graphicstar: number; freshTidy: number; erp: number };
export const DEFAULT_RATES: PointRates = { graphicstar: 10000, freshTidy: 100, erp: 1000 };

/** Pesos per point for a manually entered bill at this branch. */
export const manualRateFor = (branch: string | null | undefined, rates: PointRates) =>
  isFreshTidy(branch) ? rates.freshTidy : rates.graphicstar;

/**
 * Points for a manually entered bill (admin/staff "Add Points" screen), using the branch's rate.
 * Rounded to 5 decimals like the original form.
 */
export function pointsForBill(branch: string | null | undefined, billAmount: number, rates: PointRates = DEFAULT_RATES): number {
  const amount = Number.isFinite(billAmount) ? billAmount : 0;
  return Number((amount / manualRateFor(branch, rates)).toFixed(5));
}

/** Points for a paid ERP invoice, 2 decimals. */
export const pointsForInvoice = (amount: number, pesosPerPoint: number = DEFAULT_RATES.erp) =>
  Math.round((amount / pesosPerPoint) * 100) / 100;

export const formatRate = (pesos: number) => `₱${Number(pesos).toLocaleString('en-PH', { maximumFractionDigits: 2 })} = 1 point`;

/** Progress toward a reward, capped at 100%. */
export function rewardProgress(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((current / required) * 100)));
}

export type TermsCopy = { version: string; company: string; intro: string; rules: string[] };

export function termsFor(branch: string | null | undefined, rates: PointRates = DEFAULT_RATES): TermsCopy {
  if (isFreshTidy(branch)) {
    return {
      version: 'fresh_and_tidy',
      company: 'Fresh and Tidy',
      intro: 'Welcome to the Fresh & Tidy Rewards Program. Please review the terms below before continuing:',
      rules: [
        `Every ₱${rates.freshTidy.toLocaleString('en-PH')} spent = 1 reward point.`,
        'Points can only be used in Fresh & Tidy branches.',
        'Points expire after 12 months of inactivity.',
        'Fresh & Tidy reserves the right to modify rewards anytime.',
      ],
    };
  }
  if (isGraphicstar(branch)) {
    return graphicstarTerms;
  }
  return { ...graphicstarTerms, version: 'default' };
}

const graphicstarTerms: TermsCopy = {
  version: 'graphicstar',
  company: 'Cebu Graphicstar Imaging Corp',
  intro:
    'Welcome to the Cebu Graphicstar Rewards Program. By continuing, you agree to comply with the following rules and guidelines:',
  rules: [
    'Points are earned based on official purchases recorded in the system.',
    'Points cannot be transferred to other members.',
    'Points can only be redeemed for available rewards.',
    'Management reserves the right to update the rewards or the system at any time.',
  ],
};

export const formatPoints = (value: number) =>
  Number(value).toLocaleString('en-PH', { maximumFractionDigits: 5 });

export const formatPeso = (value: number) =>
  `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (sqliteDate: string) =>
  new Date(`${sqliteDate.replace(' ', 'T')}${sqliteDate.includes('T') || sqliteDate.length <= 10 ? '' : 'Z'}`).toLocaleDateString(
    'en-PH',
    { year: 'numeric', month: 'short', day: '2-digit' },
  );
