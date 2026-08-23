export const notificationQueryKeys = {
  all: ['notifications'] as const,
  posts: () => [...notificationQueryKeys.all, 'posts'] as const,
};
