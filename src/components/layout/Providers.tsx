'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * `reducedMotion="user"` makes every Framer Motion animation in the tree respect
 * `prefers-reduced-motion: reduce` without per-component guards. The CSS-driven
 * animations are handled by the media query in globals.css.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
