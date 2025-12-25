import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Header2 } from '@components/common/Header2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Notification {
  id: number | string;
  title: string;
  message: string;
  time?: string;
  created_at?: string;
  unread?: boolean;
  is_read?: boolean;
}

export const NotificationScreen = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API.NOTIFICATIONS.VIEW_ALL);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to load notifications';
        Toast.error(errorMessage);
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Extract notifications from response
      const data = response.data?.data || response.data || [];
      const notificationsList = Array.isArray(data) ? data : [];

      // Map API response to notification format
      const mappedNotifications: Notification[] = notificationsList.map((item: any) => ({
        id: item.id || item.notification_id,
        title: item.title || item.subject || 'Notification',
        message: item.message || item.body || item.content || '',
        time: item.created_at || item.time || item.date || '',
        unread: item.is_read === false || item.unread === true || item.read === false,
        is_read: item.is_read !== false,
      }));

      setNotifications(mappedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to load notifications';
      Toast.error(errorMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // Delete single notification
  const handleDeleteNotification = async (id: number | string) => {
    setDeletingId(id);
    try {
      const response = await apiClient.delete(`${API.NOTIFICATIONS.DELETE}/${id}`);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Failed to delete notification';
        Toast.error(errorMessage);
        setDeletingId(null);
        return;
      }

      // Success - remove from list
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      Toast.success(response.data?.message || 'Notification deleted');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to delete notification';
      Toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) {
      return;
    }

    Alert.alert(
      t('clear_all_notifications') || 'Clear All Notifications',
      t('are_you_sure_clear_all') || 'Are you sure you want to clear all notifications?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
    {
          text: t('clear_all') || 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setClearingAll(true);
            try {
              const response = await apiClient.delete(API.NOTIFICATIONS.CLEAR_ALL);

              // Check for success: false in response
              if (response.data?.success === false) {
                const errorMessage = response.data?.message || 'Failed to clear notifications';
                Toast.error(errorMessage);
                setClearingAll(false);
                return;
              }

              // Success - clear all notifications
              setNotifications([]);
              Toast.success(response.data?.message || 'All notifications cleared');
            } catch (error: any) {
              console.error('Error clearing notifications:', error);
              const errorMessage = 
                error?.response?.data?.message || 
                error?.data?.message ||
                error?.message || 
                'Failed to clear notifications';
              Toast.error(errorMessage);
            } finally {
              setClearingAll(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format time/date
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeString;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={t('notifications')} />

      {/* Clear All Button */}
      {!loading && notifications.length > 0 && (
        <View style={styles.clearAllContainer}>
          <TouchableOpacity
            onPress={handleClearAll}
            disabled={clearingAll}
            style={[styles.clearAllButton, clearingAll && { opacity: 0.5 }]}
          >
            {clearingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Icon name="delete-sweep-outline" size={18} color={colors.primary} />
                <Text style={styles.clearAllText}>
                  {t('clear_all') || 'Clear All'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                index !== notifications.length - 1 && styles.notificationBorder,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon name="bell-outline" size={20} color={colors.borderDark} />
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>
                  {formatTime(notification.time || notification.created_at)}
                </Text>
              </View>

              <View style={styles.rightActions}>
              {notification.unread && <View style={styles.unreadDot} />}
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(notification.id)}
                  disabled={deletingId === notification.id}
                  style={{ padding: 8, marginLeft: 8 }}
                >
                  {deletingId === notification.id ? (
                    <ActivityIndicator size="small" color={colors.secondaryText} />
                  ) : (
                    <Icon name="delete-outline" size={20} color={colors.secondaryText} />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="bell-off-outline" size={55} color={colors.black} />
          <Text style={styles.emptyTitle}>{t('no_notifications_yet')}</Text>
          <Text style={styles.emptyMessage}>
            {t('no_notifications_message')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
