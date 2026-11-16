import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir } from './db';

/**
 * Uploaded images live outside /public (Next only serves files that existed at
 * build time from there) and are streamed by /rewards-media/[kind]/[file].
 */

export const UPLOAD_KINDS = ['rewards', 'gallery'] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export const uploadsDir = (kind: UploadKind) => path.join(dataDir, 'uploads', kind);

export const mediaUrl = (kind: UploadKind, file: string | null | undefined) =>
  file ? `/rewards-media/${kind}/${encodeURIComponent(file)}` : null;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export type ImageRules = { types: string[]; maxBytes?: number };

/** Returns an error message, or null when the file is acceptable. */
export function checkImage(file: File | null, rules: ImageRules, required: boolean): string | null {
  if (!file || file.size === 0) return required ? 'Please choose an image.' : null;
  if (!rules.types.includes(file.type)) {
    return `The image must be a file of type: ${rules.types.map((t) => EXTENSIONS[t]).join(', ')}.`;
  }
  if (rules.maxBytes && file.size > rules.maxBytes) {
    return `The image may not be greater than ${Math.round(rules.maxBytes / 1024)} kilobytes.`;
  }
  return null;
}

export async function saveImage(kind: UploadKind, file: File): Promise<string> {
  const dir = uploadsDir(kind);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${EXTENSIONS[file.type] ?? 'bin'}`;
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export function deleteImage(kind: UploadKind, file: string | null | undefined) {
  if (!file || file !== path.basename(file)) return;
  fs.rmSync(path.join(uploadsDir(kind), file), { force: true });
}
