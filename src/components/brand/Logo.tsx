import Image from 'next/image';
import Link from 'next/link';
import { brandAssets } from '@/content/assets';
import { site } from '@/content/site';
import { cn } from '@/lib/cn';

/** The "30 YEARS" anniversary lockup, linked home. */
export function Logo({
  className,
  height = 44,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const { logo } = brandAssets;
  const width = Math.round((logo.width / logo.height) * height);

  return (
    <Link
      href="/"
      className={cn('inline-flex shrink-0 items-center rounded-md', className)}
      aria-label={`${site.name} — home`}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto"
        style={{ height, width }}
      />
    </Link>
  );
}
