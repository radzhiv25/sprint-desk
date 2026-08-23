import type { BoardColumns } from '@/store/boardStore';
import type {
  CompletionTrendPoint,
  PriorityBreakdown,
  Sprint,
  SprintAnalyticsPoint,
  Task,
  TaskStatus,
  TaskStatusDistribution,
} from '@/types';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/types';

export interface EffectiveTask extends Task {
  effectiveStatus: TaskStatus;
}

export interface AnalyticsData {
  sprintVelocity: SprintAnalyticsPoint[];
  statusDistribution: TaskStatusDistribution[];
  priorityBreakdown: PriorityBreakdown[];
  completionTrend: CompletionTrendPoint[];
}

export function getEffectiveStatus(
  taskId: number,
  defaultStatus: TaskStatus,
  columns: BoardColumns,
): TaskStatus {
  for (const status of TASK_STATUSES) {
    if (columns[status].includes(taskId)) {
      return status;
    }
  }
  return defaultStatus;
}

export function withEffectiveStatus(tasks: Task[], columns: BoardColumns): EffectiveTask[] {
  return tasks.map((task) => ({
    ...task,
    effectiveStatus: getEffectiveStatus(task.id, task.status, columns),
  }));
}

export function computeSprintVelocity(
  tasks: EffectiveTask[],
  sprints: Sprint[],
): SprintAnalyticsPoint[] {
  return sprints.map((sprint) => {
    const sprintTasks = tasks.filter((task) => task.sprintId === sprint.id);
    const completedTasks = sprintTasks.filter((task) => task.effectiveStatus === 'done').length;

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      completedTasks,
      totalTasks: sprintTasks.length,
    };
  });
}

export function computeStatusDistribution(tasks: EffectiveTask[]): TaskStatusDistribution[] {
  const counts = new Map<TaskStatus, number>();
  for (const status of TASK_STATUSES) {
    counts.set(status, 0);
  }

  for (const task of tasks) {
    counts.set(task.effectiveStatus, (counts.get(task.effectiveStatus) ?? 0) + 1);
  }

  return TASK_STATUSES.map((status) => ({
    status: TASK_STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }));
}

export function computePriorityBreakdown(tasks: EffectiveTask[]): PriorityBreakdown[] {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    counts.set(task.priority, (counts.get(task.priority) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([priority, count]) => ({ priority, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeCompletionTrend(tasks: EffectiveTask[]): CompletionTrendPoint[] {
  const byDate = new Map<string, number>();

  for (const task of tasks) {
    if (task.effectiveStatus !== 'done' || !task.completedAt) continue;
    const date = task.completedAt.split('T')[0];
    byDate.set(date, (byDate.get(date) ?? 0) + 1);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, completed]) => ({ date, completed }));
}

export function computeAnalytics(
  tasks: Task[],
  sprints: Sprint[],
  columns: BoardColumns,
): AnalyticsData {
  const effectiveTasks = withEffectiveStatus(tasks, columns);

  return {
    sprintVelocity: computeSprintVelocity(effectiveTasks, sprints),
    statusDistribution: computeStatusDistribution(effectiveTasks),
    priorityBreakdown: computePriorityBreakdown(effectiveTasks),
    completionTrend: computeCompletionTrend(effectiveTasks),
  };
}
