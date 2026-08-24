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
  activeDragStatus?: TaskStatus | null;
}

export function BoardColumn({
  status,
  tasks,
  userMap,
  commentCountMap,
  onOpenTask,
  activeDragStatus = null,
}: BoardColumnProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  const isCrossColumnDropTarget =
    isOver && activeDragStatus !== null && activeDragStatus !== status;

  return (
    <section
      className={cn(
        'flex h-full min-h-0 w-[260px] shrink-0 flex-col rounded-lg bg-muted/30 transition-colors duration-200 md:w-auto md:min-w-0',
        isCrossColumnDropTarget && 'bg-primary/5 ring-2 ring-inset ring-primary/25',
      )}
      aria-label={`${TASK_STATUS_LABELS[status]} column`}
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 py-3">
        <h2 className="font-display text-sm font-semibold tracking-display text-foreground">
          {TASK_STATUS_LABELS[status]}
        </h2>
        <span className="rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          'scrollbar-subtle flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 transition-colors duration-200',
          isCrossColumnDropTarget && 'bg-primary/[0.03]',
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
