import { create } from 'zustand';

import type { ToastVariant } from '@/components/ui/Toast';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem extends ToastInput {
  id: string;
}

interface ToastStore {
  toasts: ToastItem[];
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

let toastCounter = 0;

function createToastId(): string {
  toastCounter += 1;
  return `toast-${toastCounter}`;
}

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  toast: (input) => {
    const id = createToastId();
    set((state) => ({
      toasts: [...state.toasts, { id, ...input }],
    }));
    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    }));
  },

  dismissAll: () => {
    set({ toasts: [] });
  },
}));

export function useToast(): Pick<ToastStore, 'toast' | 'dismiss' | 'dismissAll'> {
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const dismissAll = useToastStore((state) => state.dismissAll);

  return { toast, dismiss, dismissAll };
}

/** Test helper — reset toast ids and queue between tests. */
export function resetToastStore(): void {
  toastCounter = 0;
  useToastStore.setState({ toasts: [] });
}
