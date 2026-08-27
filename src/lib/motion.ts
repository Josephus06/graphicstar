import type { Variants } from 'framer-motion';

/**
 * Shared motion vocabulary.
 *
 * House rule: content fades up 24px over 0.6s on an ease-out curve, triggered
 * once when ~20% of the element has entered the viewport. Framer Motion reads
 * `prefers-reduced-motion` through `MotionConfig reducedMotion="user"` in the
 * root layout, so none of this needs a manual media-query guard.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/** Parent wrapper that staggers its `fadeUp` children. */
export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Standard `whileInView` viewport config — fire once, at 20% entry. */
export const inViewOnce = { once: true, amount: 0.2 } as const;
