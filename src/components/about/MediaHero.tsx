import { AutoVideo } from '@/components/ui/AutoVideo';
import { aboutHeroVideo } from '@/content/assets';

/**
 * Full-bleed media hero. Sits behind the floating navbar, runs ~600px tall, and
 * fades into the grey page background at its lower edge. No overlay text — the
 * page heading lives in the About body below.
 */
export function MediaHero() {
  return (
    <div className="relative w-full overflow-hidden bg-grey-bg">
      <div className="relative h-[380px] w-full sm:h-[500px] md:h-[600px]">
        <AutoVideo
          video={aboutHeroVideo}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-grey-bg"
      />
    </div>
  );
}
