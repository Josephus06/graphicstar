import { getMember, totalPoints } from '@/lib/rewards/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Target of a member's QR code: their name and available points (loyalty-gfx /member/q/{id}). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(Number(id));
  if (!member) return Response.json({ message: 'Member not found.' }, { status: 404 });
  return Response.json({ member: member.name, available_points: totalPoints(member.id) });
}
