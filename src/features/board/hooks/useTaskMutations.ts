import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  addComment,
  createTask,
  deleteTask,
  updateTask,
  type AddCommentInput,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/services/tasks.service';
import { tasksQueryKeys } from '@/services/tasks.queryKeys';
import { useBoardStore } from '@/store/boardStore';
import type { Comment, Task } from '@/types';

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const addTaskToBoard = useBoardStore((state) => state.addTask);

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const tasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? [];
      return createTask(input, tasks);
    },
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (current = []) => [...current, task]);
      addTaskToBoard(task.id, task.status);
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const moveTask = useBoardStore((state) => state.moveTask);

  return useMutation({
    mutationFn: async ({ taskId, input }: { taskId: number; input: UpdateTaskInput }) => {
      const tasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? [];
      return updateTask(taskId, input, tasks);
    },
    onSuccess: (updatedTask, { taskId, input }) => {
      const previousTask = queryClient
        .getQueryData<Task[]>(tasksQueryKeys.list())
        ?.find((task) => task.id === taskId);

      queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (current = []) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (input.status && previousTask && input.status !== previousTask.status) {
        const targetColumn = useBoardStore.getState().columns[input.status];
        moveTask(taskId, previousTask.status, input.status, targetColumn.length);
      }
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const removeTask = useBoardStore((state) => state.removeTask);

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: Task['status'] }) => {
      const tasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? [];
      await deleteTask(taskId, tasks);
      return { taskId, status };
    },
    onSuccess: ({ taskId, status }) => {
      queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (current = []) =>
        current.filter((task) => task.id !== taskId),
      );
      removeTask(taskId, status);
    },
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCommentInput) => {
      const comments = queryClient.getQueryData<Comment[]>(tasksQueryKeys.comments()) ?? [];
      return addComment(input, comments);
    },
    onSuccess: (comment) => {
      queryClient.setQueryData<Comment[]>(tasksQueryKeys.comments(), (current = []) => [
        ...current,
        comment,
      ]);
    },
  });
}
