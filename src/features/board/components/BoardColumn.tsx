import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { cn } from '@/lib/utils/cn';
import { TASK_STATUS_LABELS, type Task, type TaskStatus, type User } from '@/types';

import { TaskCard } from './TaskCard';

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  userMap: Map<number, User>;
  commentCountMap?: Map<number, number>;
  onOpenTask: (taskId: number) => void;
}

export function BoardColumn({
  status,
  tasks,
  userMap,
  commentCountMap,
  onOpenTask,
}: BoardColumnProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <section
      className="flex h-full min-h-0 w-[260px] shrink-0 flex-col rounded-lg border border-border bg-muted/20 shadow-sm md:w-auto md:min-w-0"
      aria-label={`${TASK_STATUS_LABELS[status]} column`}
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between rounded-t-lg border-b border-border bg-muted/20 px-4 py-3 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-foreground">{TASK_STATUS_LABELS[status]}</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          'scrollbar-subtle flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 transition-colors',
          isOver && 'bg-accent/40',
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnStatus={status}
              assignee={userMap.get(task.assigneeId)}
              commentCount={commentCountMap?.get(task.id) ?? 0}
              onOpen={onOpenTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Drop tasks here</p>
        ) : null}
      </div>
    </section>
  );
}
