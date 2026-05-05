import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '../types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date().toISOString(),
                    isRead: false
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                    unreadCount: state.unreadCount + 1
                }));
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                    unreadCount: 0
                }));
            },

            removeNotification: (id) => {
                const notification = get().notifications.find(n => n.id === id);
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                    unreadCount: notification && !notification.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
                }));
            },

            clearAll: () => set({ notifications: [], unreadCount: 0 }),
        }),
        {
            name: 'notification-storage',
        }
    )
);
