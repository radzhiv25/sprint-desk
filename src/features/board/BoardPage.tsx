import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Task } from '@/types';

import { CreateTaskModal } from './components/CreateTaskModal';
import { DeleteTaskModal } from './components/DeleteTaskModal';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskDrawer } from './components/TaskDrawer';
import { useBoardTasks } from './hooks/useBoardTasks';
import { useCommentsQuery, useUsersQuery } from './hooks/useTasksQuery';
import { PageHeader } from '@/app/layout';
import { Button } from '@/components/ui/Button';

export function BoardPage(): JSX.Element {
  const { columnTasks, taskMap, isLoading, isError } = useBoardTasks();
  const { data: users = [] } = useUsersQuery();
  const { data: comments = [] } = useCommentsQuery();

  const commentCountMap = useMemo(() => {
    const counts = new Map<number, number>();
    for (const comment of comments) {
      counts.set(comment.taskId, (counts.get(comment.taskId) ?? 0) + 1);
    }
    return counts;
  }, [comments]);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const selectedTask = selectedTaskId ? (taskMap.get(selectedTaskId) ?? null) : null;

  const totalTasks = Object.values(columnTasks).reduce((sum, tasks) => sum + tasks.length, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-destructive">Failed to load board tasks.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PageHeader
        title="Sprint Board"
        subtitle={`${totalTasks} tasks across 4 columns`}
      >
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Create task
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 p-4 pt-4 sm:p-6">
      <KanbanBoard
        columnTasks={columnTasks}
        userMap={userMap}
        commentCountMap={commentCountMap}
        onOpenTask={setSelectedTaskId}
      />
      </div>

      <TaskDrawer
        task={selectedTask}
        users={users}
        onClose={() => setSelectedTaskId(null)}
        onRequestDelete={(task) => setTaskToDelete(task)}
      />

      <CreateTaskModal open={createOpen} users={users} onClose={() => setCreateOpen(false)} />

      <DeleteTaskModal
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onDeleted={() => {
          if (taskToDelete && selectedTaskId === taskToDelete.id) {
            setSelectedTaskId(null);
          }
        }}
      />
    </div>
  );
}
