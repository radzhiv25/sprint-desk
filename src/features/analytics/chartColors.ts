export const CHART_COLORS = {
  backlog: '#94a3b8',
  inProgress: '#3b82f6',
  review: '#f59e0b',
  done: '#22c55e',
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#ef4444',
  velocity: '#6366f1',
  trend: '#8b5cf6',
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: CHART_COLORS.low,
  medium: CHART_COLORS.medium,
  high: CHART_COLORS.high,
};

export const STATUS_COLORS = [
  CHART_COLORS.backlog,
  CHART_COLORS.inProgress,
  CHART_COLORS.review,
  CHART_COLORS.done,
];
