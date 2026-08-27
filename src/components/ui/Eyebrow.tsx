import { cn } from '@/lib/cn';

/**
 * Small uppercase, bold, wide-tracked section label.
 * Purely presentational — it never becomes a heading element, so page heading
 * outlines stay clean.
 */
export function Eyebrow({
  children,
  className,
  align = 'center',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <p className={cn('eyebrow', align === 'center' && 'text-center', className)}>{children}</p>
  );
}
