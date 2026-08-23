import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { cn } from '@/lib/utils/cn';
import type { Task, TaskStatus, User as UserType } from '@/types';

import { formatDueDate, isOverdue, PRIORITY_LABELS, PRIORITY_STYLES } from '../utils/taskDisplay';

export interface TaskCardProps {
  task: Task;
  columnStatus: TaskStatus;
  assignee?: UserType;
  commentCount?: number;
  onOpen: (taskId: number) => void;
}

export function TaskCard({
  task,
  columnStatus,
  assignee,
  commentCount = 0,
  onOpen,
}: TaskCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      status: columnStatus,
      taskId: task.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        'cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && 'z-10 opacity-60 shadow-md',
      )}
      onClick={() => onOpen(task.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task.id);
        }
      }}
      tabIndex={0}
      aria-label={`${task.title}, ${PRIORITY_LABELS[task.priority]} priority`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug text-card-foreground">{task.title}</h3>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                PRIORITY_STYLES[task.priority],
              )}
            >
              <PriorityIcon priority={task.priority} className="h-3 w-3" />
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

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
            <div className="flex shrink-0 items-center gap-2">
              {commentCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{commentCount}</span>
                </span>
              ) : null}
              <span className={cn('inline-flex items-center gap-1', overdue && 'font-medium text-destructive')}>
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
