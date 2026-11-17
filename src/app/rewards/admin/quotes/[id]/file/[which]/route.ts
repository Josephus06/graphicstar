import { MIME, readQuoteFile } from '@/lib/designer/files';
import { getQuote } from '@/lib/designer/store';
import { currentUser } from '@/lib/rewards/auth';

export const runtime = 'nodejs';

/** Quote artwork / proof, for signed-in admins only. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; which: string }> }) {
  const user = await currentUser();
  if (user?.role !== 'admin') return new Response('Not found', { status: 404 });
  const { id, which } = await params;
  const q = getQuote(Number(id));
  const name = which === 'artwork' ? q?.artwork_file : which === 'proof' ? q?.proof_file : null;
  const data = name ? readQuoteFile(name) : null;
  if (!q || !name || !data) return new Response('Not found', { status: 404 });
  const ext = name.split('.').pop() ?? '';
  const download = (which === 'artwork' && q.artwork_name ? q.artwork_name : name).replace(/["\r\n]/g, '');
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Content-Disposition': `inline; filename="${download}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
