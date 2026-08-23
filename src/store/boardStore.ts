import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Task, TaskStatus } from '@/types';

export type BoardColumns = Record<TaskStatus, number[]>;

export interface BoardState {
  columns: BoardColumns;
}

export interface BoardActions {
  hydrateFromTasks: (tasks: Task[]) => void;
  moveTask: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus, toIndex: number) => void;
  reorderTask: (status: TaskStatus, fromIndex: number, toIndex: number) => void;
  addTask: (taskId: number, status: TaskStatus) => void;
  removeTask: (taskId: number, status: TaskStatus) => void;
  resetBoard: () => void;
}

export type BoardStore = BoardState & BoardActions;

const emptyColumns = (): BoardColumns => ({
  backlog: [],
  'in-progress': [],
  review: [],
  done: [],
});

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      columns: emptyColumns(),

      hydrateFromTasks: (tasks: Task[]) => {
        const { columns } = get();
        const hasData = Object.values(columns).some((column) => column.length > 0);
        if (hasData) {
          return;
        }

        const newColumns = emptyColumns();
        const sorted = [...tasks].sort((a, b) => a.order - b.order);
        for (const task of sorted) {
          newColumns[task.status].push(task.id);
        }
        set({ columns: newColumns });
      },

      moveTask: (taskId, fromStatus, toStatus, toIndex) => {
        set((state) => {
          const columns: BoardColumns = {
            backlog: [...state.columns.backlog],
            'in-progress': [...state.columns['in-progress']],
            review: [...state.columns.review],
            done: [...state.columns.done],
          };

          columns[fromStatus] = columns[fromStatus].filter((id) => id !== taskId);

          const targetColumn = [...columns[toStatus]];
          const clampedIndex = Math.max(0, Math.min(toIndex, targetColumn.length));
          targetColumn.splice(clampedIndex, 0, taskId);
          columns[toStatus] = targetColumn;

          return { columns };
        });
      },

      reorderTask: (status, fromIndex, toIndex) => {
        set((state) => {
          const column = [...state.columns[status]];
          if (fromIndex < 0 || fromIndex >= column.length) {
            return state;
          }

          const [removed] = column.splice(fromIndex, 1);
          if (removed === undefined) {
            return state;
          }

          const clampedIndex = Math.max(0, Math.min(toIndex, column.length));
          column.splice(clampedIndex, 0, removed);

          return {
            columns: {
              ...state.columns,
              [status]: column,
            },
          };
        });
      },

      addTask: (taskId, status) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [status]: [...state.columns[status], taskId],
          },
        }));
      },

      removeTask: (taskId, status) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [status]: state.columns[status].filter((id) => id !== taskId),
          },
        }));
      },

      resetBoard: () => {
        set({ columns: emptyColumns() });
      },
    }),
    { name: 'sprint-desk-board' },
  ),
);
