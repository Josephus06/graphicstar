import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'orange' | 'outline' | 'outline-magenta';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-cta ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out ' +
  'nudge-arrow motion-reduce:transform-none';

const variants: Record<Variant, string> = {
  /* `sheen` only reads on a filled surface, so it is scoped to this variant. */
  orange:
    'sheen bg-orange text-white shadow-pill hover:bg-orange-dark hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0',
  outline:
    'border border-ink text-ink hover:-translate-y-0.5 hover:bg-ink hover:text-white active:translate-y-0',
  'outline-magenta':
    'border border-magenta text-magenta hover:-translate-y-0.5 hover:bg-magenta hover:text-white active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[11px]',
  md: 'px-7 py-3.5 text-[12px]',
  lg: 'px-9 py-4 text-[13px]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = 'orange',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'orange',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

/** The → used on buttons and inline links. Decorative, so hidden from AT. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 12"
      width="20"
      height="12"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path
        d="M0 6h18M13 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
