'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { fadeUp, inViewOnce, staggerParent } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  /** Render as a different element — e.g. `as="section"`, `as="li"`. */
  as?: ElementType;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileInView' | 'viewport'>;

/** Fades its content up 24px, once, at 20% viewport entry. */
export function Reveal({ children, as = 'div', className, delay = 0, ...rest }: RevealProps) {
  const Component = motion[as as 'div'] ?? motion.div;
  return (
    <Component
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Wraps a group of `RevealItem`s and staggers them.
 * Children must use `RevealItem` (not `Reveal`) so they inherit the parent state.
 */
export function RevealGroup({
  children,
  as = 'div',
  className,
  stagger = 0.08,
  delayChildren = 0,
  ...rest
}: RevealProps & { stagger?: number; delayChildren?: number }) {
  const Component = motion[as as 'div'] ?? motion.div;
  return (
    <Component
      className={className}
      variants={staggerParent(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** A staggered child of `RevealGroup`. */
export function RevealItem({ children, as = 'div', className, ...rest }: RevealProps) {
  const Component = motion[as as 'div'] ?? motion.div;
  return (
    <Component className={className} variants={fadeUp} {...rest}>
      {children}
    </Component>
  );
}
