export const TASK_LIST_LIMIT = 30;

export const tasksQueryKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksQueryKeys.all, 'list'] as const,
  list: () => [...tasksQueryKeys.lists(), { limit: TASK_LIST_LIMIT }] as const,
  comments: () => [...tasksQueryKeys.all, 'comments'] as const,
  users: () => [...tasksQueryKeys.all, 'users'] as const,
};
