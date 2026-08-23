import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  delay?: number;
}

export function ChartCard({ title, description, children, delay = 0 }: ChartCardProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-lg border bg-card p-4 shadow-sm sm:p-6"
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-card-foreground sm:text-lg">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="min-h-[280px] w-full">{children}</div>
    </motion.section>
  );
}
