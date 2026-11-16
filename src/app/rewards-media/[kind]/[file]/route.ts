import fs from 'node:fs';
import path from 'node:path';
import { MIME_BY_EXT, UPLOAD_KINDS, uploadsDir, type UploadKind } from '@/lib/rewards/uploads';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await params;
  const name = decodeURIComponent(file);
  if (!UPLOAD_KINDS.includes(kind as UploadKind) || name !== path.basename(name)) {
    return new Response('Not found', { status: 404 });
  }
  const full = path.join(uploadsDir(kind as UploadKind), name);
  if (!fs.existsSync(full)) return new Response('Not found', { status: 404 });

  const ext = path.extname(name).slice(1).toLowerCase();
  return new Response(fs.readFileSync(full), {
    headers: {
      'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
