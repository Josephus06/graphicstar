import Image from 'next/image';
import { VIDEO_ASSETS_READY, type VideoAsset } from '@/content/assets';
import { cn } from '@/lib/cn';

/**
 * Decorative, always-muted, looping background video.
 *
 * Reserves its box with `aspect-ratio` so nothing shifts, and falls back to the
 * poster still while `VIDEO_ASSETS_READY` is false — which keeps the layout
 * identical and avoids requesting a file that is not there yet.
 */
export function AutoVideo({
  video,
  className,
  sizes,
  priority = false,
}: {
  video: VideoAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const style = { aspectRatio: `${video.width} / ${video.height}` };

  if (!VIDEO_ASSETS_READY) {
    return (
      <Image
        src={video.poster.src}
        alt={video.poster.alt}
        width={video.poster.width}
        height={video.poster.height}
        sizes={sizes}
        priority={priority}
        className={cn('h-full w-full object-cover', className)}
        style={style}
      />
    );
  }

  return (
    <video
      className={cn('h-full w-full object-cover', className)}
      style={style}
      width={video.width}
      height={video.height}
      poster={video.poster.src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      // Decorative: the surrounding section carries the meaning.
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={video.src} type="video/mp4" />
    </video>
  );
}
