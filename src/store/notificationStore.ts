import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationState {
  readIds: number[];
}

export interface NotificationActions {
  markAsRead: (id: number) => void;
  markAllAsRead: (ids: number[]) => void;
  isRead: (id: number) => boolean;
  clearReadState: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      readIds: [],

      markAsRead: (id) => {
        const { readIds } = get();
        if (readIds.includes(id)) return;
        set({ readIds: [...readIds, id] });
      },

      markAllAsRead: (ids) => {
        const merged = new Set([...get().readIds, ...ids]);
        set({ readIds: Array.from(merged) });
      },

      isRead: (id) => get().readIds.includes(id),

      clearReadState: () => {
        set({ readIds: [] });
      },
    }),
    { name: 'sprint-desk-notifications' },
  ),
);
