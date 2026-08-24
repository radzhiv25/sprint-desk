import type { Priority } from '@/types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** Left-border accent for Kanban cards — derived from clay accent + warm neutrals. */
export const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
  high: 'border-l-brand-clay',
  medium: 'border-l-brand-clay-mid',
  low: 'border-l-brand-neutral',
};

/** @deprecated Visual badge styles — Kanban cards now use border-l priority indicators. */
export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-muted text-foreground',
  high: 'bg-primary/10 text-primary',
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
