import { beforeEach, describe, expect, it } from 'vitest';

import type { Task } from '@/types';

import { useBoardStore } from './boardStore';

const mockTask = (id: number, status: Task['status']): Task => ({
  id,
  title: `Task ${id}`,
  description: '',
  status,
  priority: 'medium',
  assigneeId: 1,
  dueDate: '2026-08-21',
  sprintId: 1,
  order: id,
  createdAt: '2026-08-01T00:00:00Z',
  completedAt: null,
  updatedAt: '2026-08-01T00:00:00Z',
});

describe('boardStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useBoardStore.getState().resetBoard();
  });

  describe('addTask', () => {
    it('appends a task id to the given column', () => {
      useBoardStore.getState().addTask(1, 'backlog');
      useBoardStore.getState().addTask(2, 'backlog');

      expect(useBoardStore.getState().columns.backlog).toEqual([1, 2]);
    });
  });

  describe('moveTask', () => {
    it('moves a task across columns at the target index', () => {
      useBoardStore.getState().hydrateFromTasks([
        mockTask(1, 'backlog'),
        mockTask(2, 'backlog'),
        mockTask(3, 'in-progress'),
      ]);

      useBoardStore.getState().moveTask(1, 'backlog', 'in-progress', 1);

      expect(useBoardStore.getState().columns.backlog).toEqual([2]);
      expect(useBoardStore.getState().columns['in-progress']).toEqual([3, 1]);
    });

    it('reorders within the same column when source and destination match', () => {
      useBoardStore.getState().hydrateFromTasks([
        mockTask(1, 'backlog'),
        mockTask(2, 'backlog'),
        mockTask(3, 'backlog'),
      ]);

      useBoardStore.getState().moveTask(1, 'backlog', 'backlog', 2);

      expect(useBoardStore.getState().columns.backlog).toEqual([2, 3, 1]);
    });
  });

  describe('removeTask', () => {
    it('removes a task id from the given column', () => {
      useBoardStore.getState().hydrateFromTasks([
        mockTask(1, 'review'),
        mockTask(2, 'review'),
      ]);

      useBoardStore.getState().removeTask(1, 'review');

      expect(useBoardStore.getState().columns.review).toEqual([2]);
    });
  });

  describe('reorderTask', () => {
    it('reorders tasks within a single column', () => {
      useBoardStore.getState().hydrateFromTasks([
        mockTask(1, 'done'),
        mockTask(2, 'done'),
        mockTask(3, 'done'),
      ]);

      useBoardStore.getState().reorderTask('done', 0, 2);

      expect(useBoardStore.getState().columns.done).toEqual([2, 3, 1]);
    });
  });
});
