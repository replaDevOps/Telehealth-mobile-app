import { create } from 'zustand';
import {
  getAllNotifications,
  deleteNotification,
  clearAllNotifications,
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
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

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
        const mapped = {
          id: item.id,
          title: item.type || item.title || 'Notification', // Prioritize 'type' for title
          message: item.description || item.message || item.body || item.content || '', // Prioritize 'description' for message
          description: item.description,
          type: item.type,
          time: item.dateTime || item.created_at || item.time || item.date || '',
          dateTime: item.dateTime,
          // Default to unread (false) if read status is not provided
          unread: item.is_read === false,
          is_read: item.is_read === true,
          read: item.is_read === true,
          created_at: item.dateTime || item.created_at || item.time || item.date, // Prioritize 'dateTime'
          updated_at: item.updated_at,
          ...item, // Keep all original fields for backward compatibility
        };
        return mapped;
      });
      
      console.log('Mapped notifications:', mappedNotifications);
      
      // Calculate unread count (notifications without read status are considered unread)
      const unreadCount = mappedNotifications.filter(
        (notif: Notification) => !notif.read && !notif.is_read,
      ).length;

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
      
      // Recalculate unread count
      const unreadCount = updatedNotifications.filter(
        (notif) => !notif.read && !notif.is_read,
      ).length;

      set({
        notifications: updatedNotifications,
        unreadCount,
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
}));
