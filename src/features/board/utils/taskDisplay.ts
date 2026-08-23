import type { Priority } from '@/types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

export function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'done') {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return due < today;
}

export function isDueSoon(dueDate: string, status: string, withinDays = 7): boolean {
  if (status === 'done' || isOverdue(dueDate, status)) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + withinDays);
  return due >= today && due <= limit;
}
