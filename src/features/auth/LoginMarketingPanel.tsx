import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Bell, KanbanSquare, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

function SprintDeskMark({ className }: { className?: string }): JSX.Element {
  return (
    <img
      src="/vite.svg"
      alt=""
      aria-hidden="true"
      className={cn('shrink-0', className)}
    />
  );
}

const FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: KanbanSquare,
    title: 'Kanban board',
    description: 'Drag tasks across sprint columns with live counts.',
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    description: 'Velocity, status mix, and completion trends from real board data.',
  },
  {
    icon: Bell,
    title: 'Real-time notifications',
    description: 'Bell alerts when new activity arrives — pause when you step away.',
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

export function LoginMarketingPanel(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <aside
      className="relative hidden min-h-0 flex-col items-center justify-center overflow-hidden md:flex md:w-1/2 md:shrink-0"
      aria-label="SprintDesk overview"
    >
      <div className="absolute inset-0 bg-background" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-card/70 dark:from-background dark:via-[hsl(30_6%_11%_/0.6)] dark:to-[hsl(30_8%_10%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-brand-clay/[0.035] blur-3xl dark:bg-brand-clay/[0.055]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-1/4 h-56 w-56 rounded-full bg-brand-sand/20 blur-3xl dark:bg-brand-clay/[0.04]"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 flex w-full max-w-2xl flex-col items-start px-10 py-12 text-left lg:px-16 xl:px-20"
        variants={prefersReducedMotion ? undefined : staggerContainer}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="flex items-center justify-start gap-3"
        >
          <SprintDeskMark className="h-9 w-9 lg:h-10 lg:w-10" />
          <p className="font-display text-4xl font-semibold tracking-display text-foreground lg:text-5xl">
            SprintDesk
          </p>
        </motion.div>

        <motion.p
          variants={prefersReducedMotion ? undefined : staggerItem}
          className="mt-4 max-w-md text-lg text-muted-foreground"
        >
          Plan, track, and ship sprints without the noise.
        </motion.p>

        <ul className="mt-12 w-full space-y-8 text-left">
          {FEATURES.map((feature) => (
            <motion.li
              key={feature.title}
              variants={prefersReducedMotion ? undefined : staggerItem}
              className="flex gap-4"
            >
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-primary"
                aria-hidden="true"
              >
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{feature.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}

export function LoginMobileBanner(): JSX.Element {
  return (
    <div
      className="relative border-b border-border/60 bg-gradient-to-b from-background via-card/40 to-background px-4 py-5 md:hidden"
      aria-label="SprintDesk"
    >
      <div className="flex items-center gap-2.5">
        <SprintDeskMark className="h-7 w-7" />
        <p className="font-display text-2xl font-semibold tracking-display text-foreground">
          SprintDesk
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Plan, track, and ship sprints without the noise.
      </p>
    </div>
  );
}
