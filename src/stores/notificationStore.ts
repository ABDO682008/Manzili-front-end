import { create } from 'zustand';
import { notificationsApi } from '../api';

interface NotificationState {
  unreadCount: number;
  isLoading: boolean;
  fetchUnreadCount: () => Promise<void>;
  incrementUnread: (amount?: number) => void;
  decrementUnread: (amount?: number) => void;
  setUnreadCount: (count: number) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    set({ isLoading: true });
    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.success && response.data) {
        set({ unreadCount: response.data.count, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  incrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + amount })),

  decrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAllAsRead: () => set({ unreadCount: 0 }),
}));
