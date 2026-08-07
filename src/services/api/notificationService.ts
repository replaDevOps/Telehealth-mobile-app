import { apiClient } from './api-client';
import { API } from './api-endpoint';

export interface Notification {
  id: number | string;
  title?: string;
  message?: string;
  description?: string;
  type?: string;
  read?: boolean;
  is_read?: boolean;
  unread?: boolean;
  dateTime?: string;
  created_at?: string;
  updated_at?: string;
  time?: string;
  date?: string;
  [key: string]: any;
}

export interface NotificationsResponse {
  success?: boolean;
  status?: boolean;
  data?: Notification[];
  message?: string;
}

export interface DeleteNotificationResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
}

/**
 * Single source of truth for "has this notification been read?".
 *
 * The API has shipped this flag as a boolean, as 0/1 and as "0"/"1" depending
 * on the endpoint, and `!raw.is_read` silently breaks on the string form
 * ("0" is truthy). Everything that shows an unread state — the header badge
 * and the dot in the list — must go through here.
 */
export const isNotificationRead = (raw: any): boolean => {
  if (!raw) return false;

  const flag = raw.is_read ?? raw.isRead ?? raw.read;
  if (flag !== undefined && flag !== null) {
    if (typeof flag === 'string') {
      const normalized = flag.trim().toLowerCase();
      return normalized === '1' || normalized === 'true';
    }
    return flag === true || flag === 1;
  }

  // Some payloads carry a timestamp instead of a flag
  return !!(raw.read_at || raw.readAt);
};

/**
 * Get all notifications for the patient
 * @returns Promise with list of notifications
 */
export const getAllNotifications = async (): Promise<NotificationsResponse> => {
  try {
    const response = await apiClient.get<NotificationsResponse>(
      API.NOTIFICATIONS.VIEW_ALL,
    );
    console.log('Get All Notifications:', response.data);
    
    // API response structure: { success: true, data: [...] }
    // Return the full response structure so store can access response.data
    return response.data || response;
  } catch (error: any) {
    console.error('Get All Notifications Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch notifications';
    throw new Error(errorMessage);
  }
};

/**
 * Delete a specific notification by ID
 * @param notificationId - The ID of the notification to delete
 * @returns Promise with delete response
 */
export const deleteNotification = async (
  notificationId: number | string,
): Promise<DeleteNotificationResponse> => {
  try {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      `${API.NOTIFICATIONS.DELETE}/${notificationId}`,
    );
    console.log('Delete Notification:', response.data);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Delete Notification Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete notification';
    throw new Error(errorMessage);
  }
};

/**
 * Clear all notifications
 * @returns Promise with clear all response
 */
export const clearAllNotifications = async (): Promise<DeleteNotificationResponse> => {
  try {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      API.NOTIFICATIONS.CLEAR_ALL,
    );
    console.log('Clear All Notifications:', response.data);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data || response;
    
    return responseData;
  } catch (error: any) {
    console.error('Clear All Notifications Error:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to clear all notifications';
    throw new Error(errorMessage);
  }
};
