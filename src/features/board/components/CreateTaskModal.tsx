import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { Priority, User } from '@/types';

import { useCreateTaskMutation } from '../hooks/useTaskMutations';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PRIORITY_LABELS } from '../utils/taskDisplay';

export interface CreateTaskModalProps {
  open: boolean;
  users: User[];
  onClose: () => void;
}

export function CreateTaskModal({ open, users, onClose }: CreateTaskModalProps): JSX.Element {
  const createTask = useCreateTaskMutation();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState(users[0] ? String(users[0].id) : '1');
  const [dueDate, setDueDate] = useState('');

  const resetForm = () => {
    setTitle('');
    setPriority('medium');
    setAssigneeId(users[0] ? String(users[0].id) : '1');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim() || !dueDate) {
      return;
    }

    createTask.mutate(
      {
        title: title.trim(),
        priority,
        assigneeId: Number(assigneeId),
        dueDate,
      },
      {
        onSuccess: () => handleClose(),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create task"
      description="Add a new task to the backlog."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createTask.isPending || !title.trim() || !dueDate} leftIcon={<Plus className="h-4 w-4" />}>
            Create task
          </Button>
        </>
      }
    >
      <form
        className="space-y-4 overflow-visible"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          required
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
          options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          options={users.map((user) => ({ value: String(user.id), label: user.name }))}
        />
        <DateInput
          label="Due date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
      </form>
    </Modal>
  );
}
