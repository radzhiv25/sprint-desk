export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  tasks: () => [...analyticsQueryKeys.all, 'tasks'] as const,
  sprints: () => [...analyticsQueryKeys.all, 'sprints'] as const,
};
