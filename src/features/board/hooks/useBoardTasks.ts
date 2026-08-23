import { useEffect, useMemo } from 'react';

import { useBoardStore } from '@/store/boardStore';
import type { Task, TaskStatus } from '@/types';

import { useTasksQuery } from './useTasksQuery';

export function useBoardTasks() {
  const { data: tasks = [], isLoading, isError, error } = useTasksQuery();
  const columns = useBoardStore((state) => state.columns);
  const hydrateFromTasks = useBoardStore((state) => state.hydrateFromTasks);

  useEffect(() => {
    if (tasks.length > 0) {
      hydrateFromTasks(tasks);
    }
  }, [tasks, hydrateFromTasks]);

  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const columnTasks = useMemo(() => {
    const result = {} as Record<TaskStatus, Task[]>;

    (Object.keys(columns) as TaskStatus[]).forEach((status) => {
      result[status] = columns[status]
        .map((id) => taskMap.get(id))
        .filter((task): task is Task => task !== undefined);
    });

    return result;
  }, [columns, taskMap]);

  return {
    tasks,
    taskMap,
    columnTasks,
    columns,
    isLoading,
    isError,
    error,
  };
}
