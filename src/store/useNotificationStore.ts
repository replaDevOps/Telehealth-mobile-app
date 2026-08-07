import { create } from 'zustand';
import {
  getAllNotifications,
  deleteNotification,
  clearAllNotifications,
  isNotificationRead,
  Notification,
} from '../services/api/notificationService';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  lastFetched: number | null;
  fetchNotifications: () => Promise<void>;
  removeNotification: (id: number | string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  incrementUnreadCount: () => void;
  markAllRead: () => void;
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

const countUnread = (notifications: Notification[]) =>
  notifications.filter(notif => !isNotificationRead(notif)).length;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  unreadCount: 0,
  lastFetched: null,

  fetchNotifications: async () => {
    const state = get();

    // Check if we have cached data that's still valid
    if (state.notifications.length > 0 && state.lastFetched) {
      const now = Date.now();
      if (now - state.lastFetched < CACHE_DURATION) {
        // Use cached data
        return;
      }
    }

    // Fetch new data
    set({ isLoading: true });

    try {
      const response = await getAllNotifications();
      
      // Handle API response structure: { success: true, data: [...] }
      // response is { success: true, data: [...] }
      // So response.data is the array of notifications
      const notificationsList = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.notifications) ? response.notifications : []);
      
      console.log('Notifications list from API:', notificationsList);
      
      // Map API response to notification format
      // API structure: { id, type, description, dateTime }
      const mappedNotifications: Notification[] = notificationsList.map((item: any) => {
        // Spread first: the normalized fields below must win over the raw ones,
        // otherwise the read flag reverts to whatever shape the API sent.
        const read = isNotificationRead(item);
        const mapped = {
          ...item, // Keep all original fields for backward compatibility
          id: item.id,
          title: item.type || item.title || 'Notification', // Prioritize 'type' for title
          message: item.description || item.message || item.body || item.content || '', // Prioritize 'description' for message
          description: item.description,
          type: item.type,
          time: item.dateTime || item.created_at || item.time || item.date || '',
          dateTime: item.dateTime,
          // Anything without a read flag counts as unread
          unread: !read,
          is_read: read,
          read,
          created_at: item.dateTime || item.created_at || item.time || item.date, // Prioritize 'dateTime'
          updated_at: item.updated_at,
        };
        return mapped;
      });

      console.log('Mapped notifications:', mappedNotifications);

      const unreadCount = countUnread(mappedNotifications);

      set({
        notifications: mappedNotifications,
        unreadCount,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  removeNotification: async (id: number | string) => {
    try {
      await deleteNotification(id);
      
      // Remove from local state
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.filter(
        (notif) => notif.id !== id,
      );
      
      set({
        notifications: updatedNotifications,
        unreadCount: countUnread(updatedNotifications),
      });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  clearAll: async () => {
    try {
      await clearAllNotifications();
      
      set({
        notifications: [],
        unreadCount: 0,
        lastFetched: null,
      });
    } catch (error: any) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  },

  refreshNotifications: async () => {
    // Force refresh by clearing cache
    set({ lastFetched: null });
    await get().fetchNotifications();
  },

  // Optimistic bump when a notification arrives over the socket, so the badge
  // moves immediately instead of waiting on the viewAll round trip. The
  // following refresh replaces this with the server's count.
  incrementUnreadCount: () => {
    set(state => ({ unreadCount: state.unreadCount + 1 }));
  },

  // Mirrors the readAll endpoint locally so the badge clears the moment the
  // list is opened, without waiting for a refetch.
  markAllRead: () => {
    const readNotifications = get().notifications.map(notif => ({
      ...notif,
      unread: false,
      is_read: true,
      read: true,
    }));

    set({ notifications: readNotifications, unreadCount: 0 });
  },
}));
