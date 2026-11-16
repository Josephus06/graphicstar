import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import type { SessionUser } from '@/lib/rewards/auth';
import { logout } from '@/lib/rewards/actions/auth';
import { cn } from '@/lib/cn';
import { db } from '@/lib/rewards/db';
import { RoleNav } from './RoleNav';
import { Notice } from './Notice';

const NAV = {
  admin: [
    { href: '/rewards/admin', label: 'Dashboard' },
    { href: '/rewards/admin/members', label: 'Members' },
    { href: '/rewards/admin/verification', label: 'Verification' },
    { href: '/rewards/admin/points', label: 'Points' },
    { href: '/rewards/admin/rewards', label: 'Rewards' },
    { href: '/rewards/admin/redemptions', label: 'Redemptions' },
    { href: '/rewards/admin/gallery', label: 'Gallery' },
    { href: '/rewards/admin/users', label: 'Users' },
  ],
  staff: [
    { href: '/rewards/staff', label: 'Dashboard' },
    { href: '/rewards/staff/members', label: 'Members' },
    { href: '/rewards/staff/points', label: 'Points' },
  ],
  member: [
    { href: '/rewards/member', label: 'Dashboard' },
    { href: '/rewards/member/rewards', label: 'Rewards' },
  ],
} as const;

/** Admin tabs show how many members still await verification. */
function navItems(role: SessionUser['role']) {
  const items: { href: string; label: string }[] = NAV[role].map((i) => ({ ...i }));
  if (role === 'admin') {
    const { n } = db()
      .prepare(`SELECT COUNT(*) AS n FROM members WHERE system_pk IS NULL OR TRIM(system_pk) = ''`)
      .get() as { n: number };
    const tab = items.find((i) => i.href === '/rewards/admin/verification');
    if (tab && n) tab.label = `Verification (${n})`;
  }
  return items;
}

const ROLE_LABEL = { admin: 'Admin', staff: 'Staff', member: 'Member' } as const;

/** Frame for every signed-in Rewards page: account bar, role tabs, flash notice. */
export function RewardsShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <div className="shell pb-24 pt-28 sm:pt-32">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-media bg-white px-5 py-4 shadow-card sm:px-7">
        <div className="min-w-0">
          <p className="eyebrow text-orange">GraphicStar Rewards · {ROLE_LABEL[user.role]}</p>
          <p className="mt-1 truncate text-[15px] font-semibold text-ink">
            {user.name}
            {user.branch ? <span className="font-normal text-grey-muted"> · {user.branch}</span> : null}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-ink px-4 py-2 text-[12px] font-bold uppercase tracking-cta text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Log out
          </button>
        </form>
      </div>

      <RoleNav items={navItems(user.role)} />

      <Suspense fallback={null}>
        <Notice />
      </Suspense>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tightest text-ink sm:text-[34px]">{title}</h1>
        {sub ? <p className="mt-1 text-[15px] text-grey-muted">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Panel({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={cn('rounded-media bg-white p-5 shadow-card sm:p-7', className)}>
      {title ? <h2 className="mb-4 text-[18px] font-semibold text-ink">{title}</h2> : null}
      {children}
    </section>
  );
}

/** Horizontal-scrolling table so wide admin tables never push the page sideways. */
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-7">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-grey-line text-[12px] uppercase tracking-eyebrow text-grey-muted">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-semibold first:pl-5 sm:first:pl-7 last:pr-5 sm:last:pr-7">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-5 [&_td]:py-3 [&_td:first-child]:sm:pl-7 [&_td:last-child]:sm:pr-7 [&_tr]:border-b [&_tr]:border-grey-line/70">
          {children}
        </tbody>
      </table>
      {empty ? <p className="px-5 py-8 text-center text-grey-muted sm:px-7">Nothing here yet.</p> : null}
    </div>
  );
}

export function Badge({ tone, children }: { tone: 'pending' | 'done' | 'neutral'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-cta',
        tone === 'pending' && 'bg-orange/15 text-orange-dark',
        tone === 'done' && 'bg-emerald-100 text-emerald-800',
        tone === 'neutral' && 'bg-grey-bg text-ink',
      )}
    >
      {children}
    </span>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-blue hover:bg-blue/5">
      {children}
    </Link>
  );
}
