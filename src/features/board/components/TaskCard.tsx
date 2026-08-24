import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, MessageSquare } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils/cn';
import { springSettle } from '@/lib/motion';
import type { Task, TaskStatus, User as UserType } from '@/types';

import { formatDueDate, isOverdue, PRIORITY_BORDER_COLORS } from '../utils/taskDisplay';

export interface TaskCardProps {
  task: Task;
  columnStatus: TaskStatus;
  assignee?: UserType;
  commentCount?: number;
  onOpen: (taskId: number) => void;
  isDragOverlay?: boolean;
}

const CARD_SHADOW_REST =
  'shadow-[0_1px_2px_hsl(36_8%_12%/0.05),0_2px_8px_hsl(36_8%_12%/0.06)]';
const CARD_SHADOW_HOVER =
  'hover:shadow-[0_2px_4px_hsl(36_8%_12%/0.06),0_8px_20px_hsl(36_8%_12%/0.1)]';
const CARD_SHADOW_DRAG =
  'shadow-[0_4px_8px_hsl(36_8%_12%/0.08),0_12px_28px_hsl(36_8%_12%/0.14)]';

export function TaskCard({
  task,
  columnStatus,
  assignee,
  commentCount = 0,
  onOpen,
  isDragOverlay = false,
}: TaskCardProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      status: columnStatus,
      taskId: task.id,
    },
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const overdue = isOverdue(task.dueDate, task.status);
  const isPickedUp = isDragging || isDragOverlay;

  return (
    <motion.article
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      layout={!prefersReducedMotion && !isDragOverlay}
      layoutId={isDragOverlay ? `task-card-${task.id}` : undefined}
      initial={false}
      animate={
        prefersReducedMotion
          ? undefined
          : isPickedUp
            ? { scale: 1.03, rotate: isDragOverlay ? 1.5 : 1 }
            : { scale: 1, rotate: 0 }
      }
      whileHover={
        prefersReducedMotion || isPickedUp
          ? undefined
          : { y: -2, transition: { duration: 0.15 } }
      }
      transition={prefersReducedMotion ? { duration: 0 } : springSettle}
      className={cn(
        'cursor-pointer rounded-lg border border-border/60 border-l-4 bg-card p-3',
        CARD_SHADOW_REST,
        !isPickedUp && cn(CARD_SHADOW_HOVER, 'hover:border-primary/35'),
        isPickedUp && cn(CARD_SHADOW_DRAG, 'z-10 cursor-grabbing border-primary/40'),
        PRIORITY_BORDER_COLORS[task.priority],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && !isDragOverlay && 'opacity-40',
      )}
      onClick={() => {
        if (!isPickedUp) {
          onOpen(task.id);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task.id);
        }
      }}
      tabIndex={isDragOverlay ? -1 : 0}
      aria-label={`${task.title}, ${task.priority} priority`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-snug text-card-foreground">{task.title}</h3>

          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-1.5">
              {assignee ? (
                <>
                  <img
                    src={assignee.avatar}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded-full border border-border object-cover"
                  />
                  <span className="truncate">{assignee.name}</span>
                </>
              ) : (
                <span>Unassigned</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
              {commentCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{commentCount}</span>
                </span>
              ) : null}
              <span className={cn('inline-flex items-center gap-1', overdue && 'font-medium text-primary')}>
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
