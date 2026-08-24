import type { Transition } from 'framer-motion';

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
};

export const springSettle: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
};

export function motionTransition(
  prefersReducedMotion: boolean | null,
  transition: Transition = springSnappy,
): Transition {
  return prefersReducedMotion ? { duration: 0 } : transition;
}
