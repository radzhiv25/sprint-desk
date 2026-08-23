import { CalendarDays, MessageSquare, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils/cn';
import {
  TASK_STATUS_LABELS,
  type Comment,
  type Priority,
  type Task,
  type TaskStatus,
  type User,
} from '@/types';

import { useAddCommentMutation, useUpdateTaskMutation } from '../hooks/useTaskMutations';
import { useCommentsQuery } from '../hooks/useTasksQuery';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { formatDueDate, PRIORITY_LABELS, PRIORITY_STYLES } from '../utils/taskDisplay';

export interface TaskDrawerProps {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onRequestDelete: (task: Task) => void;
}

export function TaskDrawer({
  task,
  users,
  onClose,
  onRequestDelete,
}: TaskDrawerProps): JSX.Element | null {
  const titleId = useId();
  const updateTask = useUpdateTaskMutation();
  const addComment = useAddCommentMutation();
  const { data: comments = [] } = useCommentsQuery();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');

  const taskId = task?.id;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!task) {
      return;
    }
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(String(task.assigneeId));
    setDueDate(task.dueDate);
    setCommentText('');
  }, [taskId]);

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [taskId]);

  if (!task || typeof document === 'undefined') {
    return null;
  }

  const taskComments = comments
    .filter((comment) => comment.taskId === task.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const userMap = new Map(users.map((user) => [user.id, user]));

  const handleSave = () => {
    updateTask.mutate({
      taskId: task.id,
      input: {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: Number(assigneeId),
        dueDate,
      },
    });
  };

  const handleAddComment = () => {
    const message = commentText.trim();
    if (!message) {
      return;
    }

    addComment.mutate(
      {
        taskId: task.id,
        authorId: Number(assigneeId),
        message,
      },
      {
        onSuccess: () => setCommentText(''),
      },
    );
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.button
          type="button"
          aria-label="Close task drawer"
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.2 }}
        >
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              Task details
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <div className="space-y-1.5">
              <label htmlFor="task-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
                options={Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
                options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
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
              />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold uppercase',
                  PRIORITY_STYLES[priority],
                )}
              >
                <PriorityIcon priority={priority} className="h-3 w-3" />
                {PRIORITY_LABELS[priority]}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Due {formatDueDate(dueDate)}
              </span>
            </div>

            <section aria-label="Comments">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Comments
              </h3>
              <ul className="mt-3 space-y-3">
                {taskComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} author={userMap.get(comment.authorId)} />
                ))}
                {taskComments.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No comments yet.</li>
                ) : null}
              </ul>

              <div className="mt-4 space-y-2">
                <label htmlFor="new-comment" className="text-sm font-medium text-foreground">
                  Add comment
                </label>
                <textarea
                  id="new-comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Write a comment..."
                />
                <Button size="sm" onClick={handleAddComment} disabled={addComment.isPending}>
                  Add comment
                </Button>
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button variant="destructive" size="sm" onClick={() => onRequestDelete(task)} leftIcon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateTask.isPending}>
                Save changes
              </Button>
            </div>
          </footer>
        </motion.aside>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

function CommentItem({
  comment,
  author,
}: {
  comment: Comment;
  author?: User;
}): JSX.Element {
  return (
    <li className="rounded-md border border-border bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{author?.name ?? 'Unknown user'}</span>
        <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
          {new Date(comment.createdAt).toLocaleString()}
        </time>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{comment.message}</p>
    </li>
  );
}
