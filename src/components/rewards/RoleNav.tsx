'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export function RoleNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  // The dashboard tab is only active on its exact path; the others match their subtree.
  const active = (href: string, index: number) =>
    index === 0 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Rewards sections" className="no-scrollbar -mx-[var(--gutter)] mt-4 overflow-x-auto px-[var(--gutter)]">
      <ul className="flex w-max gap-2">
        {items.map((item, i) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active(item.href, i) ? 'page' : undefined}
              className={cn(
                'block whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors',
                active(item.href, i) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-white/60',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
