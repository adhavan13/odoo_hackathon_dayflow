import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
}

interface AppState {
  unreadCount: number;
  notifications: AppNotification[];
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
}

const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'New Leave Request',
    message: 'Alex Rivera applied for 3 days Casual Leave.',
    type: 'info',
    timestamp: '10 mins ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Payroll Processing Alert',
    message: 'Monthly payroll generation for August is scheduled.',
    type: 'warning',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Attendance Report Ready',
    message: 'Weekly attendance report has been processed.',
    type: 'success',
    timestamp: '3 hours ago',
    read: true,
  },
];

export const useAppStore = create<AppState>((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,
  isLoading: false,

  setLoading: (isLoading) => set({ isLoading }),

  markNotificationRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (item) =>
    set((state) => {
      const newNotif: AppNotification = {
        ...item,
        id: `n_${Date.now()}`,
        read: false,
        timestamp: 'Just now',
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
}));
