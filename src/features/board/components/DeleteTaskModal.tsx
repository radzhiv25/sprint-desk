import { Trash2 } from 'lucide-react';

import type { Task } from '@/types';

import { useDeleteTaskMutation } from '../hooks/useTaskMutations';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export interface DeleteTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTaskModal({ task, onClose, onDeleted }: DeleteTaskModalProps): JSX.Element {
  const deleteTask = useDeleteTaskMutation();

  const handleDelete = () => {
    if (!task) {
      return;
    }

    deleteTask.mutate(
      { taskId: task.id, status: task.status },
      {
        onSuccess: () => {
          onDeleted();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={task !== null}
      onClose={onClose}
      title="Delete task"
      description={
        task
          ? `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending} leftIcon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        </>
      }
    />
  );
}
