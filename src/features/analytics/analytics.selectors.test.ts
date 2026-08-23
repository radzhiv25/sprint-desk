import { describe, expect, it } from 'vitest';

import {
  computeAnalytics,
  computeCompletionTrend,
  computePriorityBreakdown,
  computeSprintVelocity,
  computeStatusDistribution,
  getEffectiveStatus,
  withEffectiveStatus,
} from '@/features/analytics/analytics.selectors';
import type { Sprint, Task } from '@/types';

const sampleTasks: Task[] = [
  {
    id: 1,
    title: 'Task A',
    description: 'A',
    status: 'done',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-20',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-10T09:00:00Z',
    completedAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Task B',
    description: 'B',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-22',
    sprintId: 1,
    order: 2,
    createdAt: '2026-08-11T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-11T09:00:00Z',
  },
  {
    id: 3,
    title: 'Task C',
    description: 'C',
    status: 'backlog',
    priority: 'low',
    assigneeId: 3,
    dueDate: '2026-08-25',
    sprintId: 2,
    order: 1,
    createdAt: '2026-08-12T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-12T09:00:00Z',
  },
];

const sampleSprints: Sprint[] = [
  { id: 1, name: 'Sprint 1', startDate: '2026-08-01', endDate: '2026-08-14' },
  { id: 2, name: 'Sprint 2', startDate: '2026-08-15', endDate: '2026-08-28' },
];

const emptyColumns = {
  backlog: [] as number[],
  'in-progress': [] as number[],
  review: [] as number[],
  done: [] as number[],
};

describe('analytics.selectors', () => {
  it('uses boardStore column overrides for effective status', () => {
    const columns = {
      ...emptyColumns,
      review: [2],
    };

    expect(getEffectiveStatus(2, 'in-progress', columns)).toBe('review');
    expect(withEffectiveStatus(sampleTasks, columns)[1]?.effectiveStatus).toBe('review');
  });

  it('computes sprint velocity from effective statuses', () => {
    const effectiveTasks = withEffectiveStatus(sampleTasks, emptyColumns);
    const velocity = computeSprintVelocity(effectiveTasks, sampleSprints);

    expect(velocity).toEqual([
      { sprintId: 1, sprintName: 'Sprint 1', completedTasks: 1, totalTasks: 2 },
      { sprintId: 2, sprintName: 'Sprint 2', completedTasks: 0, totalTasks: 1 },
    ]);
  });

  it('computes status distribution with labels', () => {
    const effectiveTasks = withEffectiveStatus(sampleTasks, emptyColumns);
    const distribution = computeStatusDistribution(effectiveTasks);

    expect(distribution).toEqual([
      { status: 'Backlog', count: 1 },
      { status: 'In Progress', count: 1 },
      { status: 'Review', count: 0 },
      { status: 'Done', count: 1 },
    ]);
  });

  it('computes priority breakdown sorted by count', () => {
    const effectiveTasks = withEffectiveStatus(sampleTasks, emptyColumns);
    const breakdown = computePriorityBreakdown(effectiveTasks);

    expect(breakdown).toEqual([
      { priority: 'high', count: 1 },
      { priority: 'medium', count: 1 },
      { priority: 'low', count: 1 },
    ]);
  });

  it('computes completion trend from completedAt dates', () => {
    const effectiveTasks = withEffectiveStatus(sampleTasks, emptyColumns);
    const trend = computeCompletionTrend(effectiveTasks);

    expect(trend).toEqual([{ date: '2026-08-15', completed: 1 }]);
  });

  it('computes full analytics bundle', () => {
    const analytics = computeAnalytics(sampleTasks, sampleSprints, emptyColumns);

    expect(analytics.sprintVelocity).toHaveLength(2);
    expect(analytics.statusDistribution).toHaveLength(4);
    expect(analytics.priorityBreakdown).toHaveLength(3);
    expect(analytics.completionTrend).toHaveLength(1);
  });
});
