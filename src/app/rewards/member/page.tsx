import Image from 'next/image';
import Link from 'next/link';
import { Panel, Table } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { requireRole } from '@/lib/rewards/auth';
import { formatDate, formatPeso, formatPoints, termsFor } from '@/lib/rewards/constants';
import { getRates } from '@/lib/rewards/settings';
import { db, getMemberByUser, totalPoints, type GalleryRow, type PointRow, type RewardRow } from '@/lib/rewards/db';
import { mediaUrl } from '@/lib/rewards/uploads';

export const metadata = { title: 'My Rewards' };

const PER_PAGE = 5;

export default async function MemberDashboard({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireRole('member');
  const member = getMemberByUser(user.id);

  if (!member) {
    return (
      <Panel>
        <p className="text-ink">We couldn&apos;t find a member profile for this account. Please contact the branch.</p>
      </Panel>
    );
  }

  const total = totalPoints(member.id);
  const count = (db().prepare(`SELECT COUNT(*) AS n FROM points WHERE member_id = ?`).get(member.id) as { n: number }).n;
  const pages = Math.max(1, Math.ceil(count / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number((await searchParams).page) || 1));
  const history = db()
    .prepare(`SELECT * FROM points WHERE member_id = ? ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(member.id, PER_PAGE, (page - 1) * PER_PAGE) as PointRow[];

  const rewards = db().prepare(`SELECT * FROM rewards WHERE branch = ? ORDER BY points_required`).all(user.branch) as RewardRow[];
  const gallery = db().prepare(`SELECT * FROM galleries WHERE branch = ? ORDER BY created_at DESC`).all(user.branch) as GalleryRow[];
  const redeemable = rewards.filter((r) => total >= r.points_required).length;
  const terms = termsFor(user.branch, getRates());

  return (
    <div className="grid gap-6">
      {!member.system_pk ? (
        <div role="status" className="rounded-media border border-orange/30 bg-orange/10 px-5 py-4 text-[15px] text-ink">
          <b className="font-semibold">Your account is awaiting verification.</b> Our team is linking it to your GraphicStar
          customer record. Once that&apos;s done, points from your purchases will appear here automatically.
        </div>
      ) : null}

      {/* TOTAL POINTS */}
      <section className="relative overflow-hidden rounded-media bg-ink p-7 text-white shadow-card sm:p-10">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue/40 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-orange/30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-white/60">Total points</p>
            <p className="mt-2 text-[56px] font-semibold leading-none tracking-tightest sm:text-[72px]">{formatPoints(total)}</p>
            <p className="mt-3 text-[15px] text-white/70">
              {member.card_no ? `Card no. ${member.card_no} · ` : ''}{redeemable} of {rewards.length} rewards within reach
            </p>
          </div>
          <ButtonLink href="/rewards/member/rewards" size="lg">
            See redeemable rewards
          </ButtonLink>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* POINT HISTORY */}
        <Panel title="Point history">
          <Table head={['Date', 'Bill no.', 'Amount', 'Points']} empty={history.length === 0}>
            {history.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap">{formatDate(p.created_at)}</td>
                <td className="font-medium">{p.bill_no}</td>
                <td>{p.bill_amount ? formatPeso(p.bill_amount) : '—'}</td>
                <td className={p.points < 0 ? 'font-semibold text-magenta' : 'font-semibold text-emerald-700'}>
                  {p.points > 0 ? '+' : ''}
                  {formatPoints(p.points)}
                </td>
              </tr>
            ))}
          </Table>
          {pages > 1 ? (
            <nav aria-label="Point history pages" className="mt-4 flex items-center justify-between text-[14px]">
              {page > 1 ? (
                <Link href={`?page=${page - 1}`} className="font-semibold text-blue">
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-grey-muted">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={`?page=${page + 1}`} className="font-semibold text-blue">
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </Panel>

        {/* REWARDS PREVIEW */}
        <Panel title="Rewards for your branch">
          {rewards.length === 0 ? (
            <p className="text-grey-muted">No rewards have been posted for your branch yet.</p>
          ) : (
            <ul className="grid gap-3">
              {rewards.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-grey-bg">
                    {r.image ? (
                      <Image src={mediaUrl('rewards', r.image)!} alt="" fill sizes="56px" className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{r.name}</p>
                    <p className="text-[13px] text-grey-muted">{r.points_required} points</p>
                  </div>
                  {total >= r.points_required ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-cta text-emerald-800">
                      Ready
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <Link href="/rewards/member/rewards" className="mt-5 inline-block text-[14px] font-semibold text-blue">
            All rewards →
          </Link>
        </Panel>
      </div>

      {/* GALLERY */}
      {gallery.length ? (
        <Panel title="News & promos">
          <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 sm:-mx-7 sm:px-7">
            {gallery.map((g) => (
              <figure key={g.id} className="w-[280px] shrink-0 snap-start sm:w-[360px]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-grey-bg">
                  <Image
                    src={mediaUrl('gallery', g.image)!}
                    alt={g.title ?? ''}
                    fill
                    sizes="360px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {g.title || g.description ? (
                  <figcaption className="mt-2 text-[14px]">
                    {g.title ? <span className="font-semibold text-ink">{g.title}</span> : null}
                    {g.description ? <span className="block text-grey-muted">{g.description}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Panel>
      ) : null}

      {/* TERMS & CONDITIONS */}
      <Panel title="Terms & conditions">
        <ul className="list-disc space-y-1.5 pl-5 text-[14px] text-ink/80">
          {terms.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
