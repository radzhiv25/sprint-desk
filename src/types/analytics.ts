/** Derived analytics shape — computed from tasks + sprints, not present in mock-data.json. */
export interface SprintAnalyticsPoint {
  sprintId: number;
  sprintName: string;
  completedTasks: number;
  totalTasks: number;
}

export interface TaskStatusDistribution {
  status: string;
  count: number;
}

export interface PriorityBreakdown {
  priority: string;
  count: number;
}

export interface CompletionTrendPoint {
  date: string;
  completed: number;
}
