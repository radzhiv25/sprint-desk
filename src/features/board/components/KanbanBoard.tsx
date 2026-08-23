import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { tasksQueryKeys } from '@/services/tasks.queryKeys';
import { useBoardStore, type BoardColumns } from '@/store/boardStore';
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskStatus, type User } from '@/types';

import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';

export interface KanbanBoardProps {
  columnTasks: Record<TaskStatus, Task[]>;
  userMap: Map<number, User>;
  commentCountMap?: Map<number, number>;
  onOpenTask: (taskId: number) => void;
}

function cloneColumns(columns: BoardColumns): BoardColumns {
  return {
    backlog: [...columns.backlog],
    'in-progress': [...columns['in-progress']],
    review: [...columns.review],
    done: [...columns.done],
  };
}

export function KanbanBoard({
  columnTasks,
  userMap,
  commentCountMap,
  onOpenTask,
}: KanbanBoardProps): JSX.Element {
  const columns = useBoardStore((state) => state.columns);
  const moveTask = useBoardStore((state) => state.moveTask);
  const reorderTask = useBoardStore((state) => state.reorderTask);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const showMoveUndoToast = (
    title: string,
    description: string,
    snapshot: BoardColumns,
    taskId?: number,
    previousStatus?: TaskStatus,
    previousCompletedAt?: string | null,
  ) => {
    toast({
      title,
      description,
      duration: 8000,
      action: {
        label: 'Undo',
        onClick: () => {
          useBoardStore.setState({ columns: snapshot });
          if (taskId !== undefined && previousStatus !== undefined) {
            queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (current = []) =>
              current.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status: previousStatus,
                      completedAt: previousCompletedAt ?? null,
                      updatedAt: new Date().toISOString(),
                    }
                  : task,
              ),
            );
          }
        },
      },
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const status = event.active.data.current?.status as TaskStatus | undefined;
    if (!status) {
      return;
    }
    const task = columnTasks[status].find((item) => item.id === taskId) ?? null;
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = Number(active.id);
    const activeStatus = active.data.current?.status as TaskStatus | undefined;
    if (!activeStatus) {
      return;
    }

    const overData = over.data.current;
    const overStatus =
      overData?.type === 'column'
        ? (over.id as TaskStatus)
        : (overData?.status as TaskStatus | undefined);

    if (!overStatus) {
      return;
    }

    const sourceIndex = columns[activeStatus].indexOf(activeId);
    if (sourceIndex === -1) {
      return;
    }

    const snapshot = cloneColumns(useBoardStore.getState().columns);
    const movedTask = columnTasks[activeStatus].find((task) => task.id === activeId);

    if (activeStatus === overStatus) {
      const overId = overData?.type === 'task' ? Number(over.id) : null;
      let destinationIndex = columns[overStatus].length - 1;

      if (overId !== null) {
        const overIndex = columns[overStatus].indexOf(overId);
        if (overIndex !== -1) {
          destinationIndex = overIndex;
        }
      }

      if (sourceIndex !== destinationIndex) {
        reorderTask(overStatus, sourceIndex, destinationIndex);
        showMoveUndoToast('Task reordered', `Updated order in ${TASK_STATUS_LABELS[overStatus]}.`, snapshot);
      }
      return;
    }

    const overId = overData?.type === 'task' ? Number(over.id) : null;
    let destinationIndex = columns[overStatus].length;

    if (overId !== null) {
      const overIndex = columns[overStatus].indexOf(overId);
      if (overIndex !== -1) {
        destinationIndex = overIndex;
      }
    }

    moveTask(activeId, activeStatus, overStatus, destinationIndex);
    queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (current = []) =>
      current.map((task) =>
        task.id === activeId
          ? {
              ...task,
              status: overStatus,
              completedAt:
                overStatus === 'done' ? (task.completedAt ?? new Date().toISOString()) : null,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );

    showMoveUndoToast(
      'Task moved',
      `Moved to ${TASK_STATUS_LABELS[overStatus]}.`,
      snapshot,
      activeId,
      activeStatus,
      movedTask?.completedAt ?? null,
    );
  };

  return (
    <div className="h-full min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full min-h-0 w-full gap-3 overflow-x-auto pb-2 sm:gap-4 md:grid md:grid-cols-4 md:overflow-x-hidden">
          {TASK_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={columnTasks[status]}
              userMap={userMap}
              commentCountMap={commentCountMap}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 scale-[1.02] shadow-lg">
              <TaskCard
                task={activeTask}
                columnStatus={activeTask.status}
                assignee={userMap.get(activeTask.assigneeId)}
                onOpen={() => undefined}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
