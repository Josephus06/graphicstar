import fs from 'node:fs';
import path from 'node:path';
import { dataDir } from '@/lib/rewards/db';

/**
 * Quote artwork and proofs. Private: kept under data/uploads/quotes and only
 * served to signed-in admins (/rewards/admin/quotes/[id]/file/[which]).
 */

export const quotesDir = () => path.join(dataDir, 'uploads', 'quotes');

export const ARTWORK_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
export const ARTWORK_MAX_BYTES = 20 * 1024 * 1024;
export const PROOF_MAX_BYTES = 8 * 1024 * 1024;

export const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

export async function saveQuoteFile(name: string, file: File) {
  fs.mkdirSync(quotesDir(), { recursive: true });
  fs.writeFileSync(path.join(quotesDir(), name), Buffer.from(await file.arrayBuffer()));
}

export function readQuoteFile(name: string): Buffer | null {
  if (name !== path.basename(name)) return null;
  const full = path.join(quotesDir(), name);
  return fs.existsSync(full) ? fs.readFileSync(full) : null;
}
