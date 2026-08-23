import { useQuery } from '@tanstack/react-query';

import {
  fetchComments,
  fetchTasks,
  fetchUsers,
} from '@/services/tasks.service';
import { tasksQueryKeys } from '@/services/tasks.queryKeys';

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksQueryKeys.list(),
    queryFn: () => fetchTasks(),
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: tasksQueryKeys.users(),
    queryFn: fetchUsers,
  });
}

export function useCommentsQuery() {
  return useQuery({
    queryKey: tasksQueryKeys.comments(),
    queryFn: fetchComments,
  });
}
