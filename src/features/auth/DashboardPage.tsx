import { AlertTriangle, CalendarDays, Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/app/layout';
import { Button } from '@/components/ui/Button';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBoardTasks } from '@/features/board/hooks/useBoardTasks';
import { isDueSoon, isOverdue, PRIORITY_LABELS } from '@/features/board/utils/taskDisplay';
import { cn } from '@/lib/utils/cn';
import { TASK_STATUSES, TASK_STATUS_LABELS, type Priority } from '@/types';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

function HighlightCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
  className,
  onClick,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Flame;
  tone?: 'default' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  const toneStyles = {
    default: 'bg-muted/50 text-foreground',
    warning: 'bg-muted/50 text-foreground',
    danger: 'border-l-4 border-l-primary bg-muted/50 text-foreground',
  } as const;

  const iconStyles = {
    default: 'text-muted-foreground',
    warning: 'text-primary',
    danger: 'text-primary',
  } as const;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-2 font-display text-4xl font-semibold tracking-display tabular-nums">
            {value}
          </p>
        </div>
        <motion.span
          aria-hidden="true"
          className={cn('shrink-0', iconStyles[tone])}
          whileHover={
            prefersReducedMotion
              ? undefined
              : { scale: 1.12, rotate: tone === 'danger' ? -6 : 4 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
      </div>
      <p className="mt-auto pt-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </>
  );

  return (
    <motion.li
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -3, transition: { duration: 0.18 } }
      }
      className={cn(
        'flex min-h-[8.5rem] flex-col rounded-lg p-5 transition-shadow',
        onClick && 'hover:shadow-md',
        toneStyles[tone],
        className,
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`${title}: ${value}`}
          className={cn(
            'flex h-full w-full flex-col text-left',
            'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg -m-5 p-5',
          )}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </motion.li>
  );
}

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { tasks, columnTasks, isLoading, isError } = useBoardTasks();

  const stats = useMemo(() => {
    const highPriorityTasks = tasks.filter((task) => task.priority === 'high' && task.status !== 'done');
    const overdueTasks = tasks.filter((task) => isOverdue(task.dueDate, task.status));
    const dueSoonTasks = tasks.filter((task) => isDueSoon(task.dueDate, task.status));

    const priorityBreakdown = PRIORITIES.reduce(
      (acc, priority) => {
        acc[priority] = tasks.filter((task) => task.priority === priority).length;
        return acc;
      },
      {} as Record<Priority, number>,
    );

    return {
      highPriorityTasks,
      overdueTasks,
      dueSoonTasks,
      priorityBreakdown,
      totalTasks: tasks.length,
    };
  }, [tasks]);

  const totalTasks = TASK_STATUSES.reduce(
    (sum, status) => sum + columnTasks[status].length,
    0,
  );

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Dashboard"
        subtitle="Sprint overview and quick navigation"
      />

      <div className="space-y-10 p-4 sm:p-6">
        {isLoading ? (
          <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12" aria-label="Loading dashboard">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-lg" />
            ))}
          </section>
        ) : null}

        {isError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load task counts. Visit the board to retry.
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <section aria-labelledby="highlights-heading">
              <h2 id="highlights-heading" className="mb-4 font-display text-sm font-semibold tracking-display text-foreground">
                Highlights
              </h2>
              <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                <HighlightCard
                  className="lg:col-span-5"
                  title="High priority"
                  value={stats.highPriorityTasks.length}
                  description={
                    stats.highPriorityTasks.length > 0
                      ? stats.highPriorityTasks
                          .slice(0, 3)
                          .map((task) => task.title)
                          .join(', ')
                      : 'No urgent open tasks'
                  }
                  icon={Flame}
                  tone="warning"
                  onClick={() => navigate('/board')}
                />
                <HighlightCard
                  className="lg:col-span-4"
                  title="Overdue"
                  value={stats.overdueTasks.length}
                  description="Tasks past due date"
                  icon={AlertTriangle}
                  tone="danger"
                  onClick={() => navigate('/board')}
                />
                <HighlightCard
                  className="lg:col-span-3"
                  title="Due soon"
                  value={stats.dueSoonTasks.length}
                  description="Due within the next 7 days"
                  icon={CalendarDays}
                  onClick={() => navigate('/board')}
                />
              </ul>
            </section>

            <section aria-labelledby="priority-breakdown-heading">
              <h2
                id="priority-breakdown-heading"
                className="mb-4 font-display text-sm font-semibold tracking-display text-foreground"
              >
                Priority breakdown
              </h2>
              <ul className="grid gap-3 sm:grid-cols-3">
                {PRIORITIES.map((priority) => (
                  <li
                    key={priority}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-5 py-4"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <PriorityIcon priority={priority} className="h-4 w-4" />
                      {PRIORITY_LABELS[priority]}
                    </span>
                    <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                      {stats.priorityBreakdown[priority]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="column-counts-heading">
              <h2
                id="column-counts-heading"
                className="mb-4 font-display text-sm font-semibold tracking-display text-foreground"
              >
                Board columns
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">{totalTasks}</span> tasks across the sprint board
              </p>
              <ul className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {TASK_STATUSES.map((status) => (
                  <li
                    key={status}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {TASK_STATUS_LABELS[status]}
                    </span>
                    <span
                      className="font-mono text-lg font-semibold tabular-nums text-foreground"
                      aria-label={`${columnTasks[status].length} tasks in ${TASK_STATUS_LABELS[status]}`}
                    >
                      {columnTasks[status].length}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <nav className="flex flex-wrap gap-3 border-t border-border/60 pt-6" aria-label="Quick links">
              <Button onClick={() => navigate('/board')}>Go to board</Button>
              <Button variant="outline" onClick={() => navigate('/analytics')}>
                View analytics
              </Button>
            </nav>
          </>
        ) : null}
      </div>
    </div>
  );
}
