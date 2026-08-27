'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { navLinks, quoteCta } from '@/content/site';
import { cn } from '@/lib/cn';

/**
 * Floating pill navbar: white, fully rounded, soft shadow, inset 24px from the
 * top and sticky. Below 1024px it collapses to logo + hamburger, with a
 * full-screen white overlay menu and the quote button pinned to the bottom.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the overlay, and wire up Escape + a focus trap.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-4 sm:pt-6">
      <nav
        aria-label="Primary"
        className="pointer-events-auto mx-auto flex w-[92%] max-w-content items-center justify-between gap-6 rounded-full bg-white/85 px-4 py-3 shadow-pill backdrop-blur-md backdrop-saturate-150 transition-shadow duration-300 hover:shadow-lift sm:px-5 md:w-[90%]"
      >
        <Logo priority height={40} />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex lg:gap-9">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'link-sweep rounded-sm text-[15px] font-medium transition-colors duration-200 hover:text-blue',
                  isActive(link.href) ? 'text-blue' : 'text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ButtonLink href={quoteCta.href} size="sm" className="hidden md:inline-flex">
          {quoteCta.label}
        </ButtonLink>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true" className="relative block h-4 w-6">
            <span
              className={cn(
                'absolute left-0 block h-0.5 w-6 rounded bg-current transition-transform duration-200 ease-out',
                open ? 'top-[7px] rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 top-[7px] block h-0.5 w-6 rounded bg-current transition-opacity duration-150',
                open ? 'opacity-0' : 'opacity-100',
              )}
            />
            <span
              className={cn(
                'absolute left-0 block h-0.5 w-6 rounded bg-current transition-transform duration-200 ease-out',
                open ? 'top-[7px] -rotate-45' : 'top-[14px]',
              )}
            />
          </span>
        </button>
      </nav>

      {/* Full-screen mobile overlay */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="pointer-events-auto fixed inset-0 z-40 flex flex-col bg-white px-[var(--gutter)] pb-10 pt-28 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'block rounded-md py-4 text-[28px] font-medium tracking-tightest',
                  isActive(link.href) ? 'text-blue' : 'text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-10">
          <ButtonLink href={quoteCta.href} size="lg" className="w-full">
            {quoteCta.label}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
