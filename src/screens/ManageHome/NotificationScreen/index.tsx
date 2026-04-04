import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Header2 } from '@components/common/Header2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { useNotificationStore } from '@store/useNotificationStore';
import { Toast } from 'toastify-react-native';
import { useFocusEffect } from '@react-navigation/native';
import RatingBottomSheet from '@components/molecules/RatingBottomSheet';

interface Notification {
  id: number | string;
  title: string;
  message: string;
  time?: string;
  created_at?: string;
  unread?: boolean;
  is_read?: boolean;
  isReview?: boolean;
  type?: string;
  clinic_id?: number | string;
}

export const NotificationScreen = () => {
  const { t } = useTranslation();
  const { refreshNotifications } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Rating states
  const [showRating, setShowRating] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [clinicIdToRate, setClinicIdToRate] = useState<number | string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      apiClient.get(API.NOTIFICATIONS.READ_ALL).then(() => refreshNotifications()).catch(() => {});
      const response = await apiClient.get(API.NOTIFICATIONS.VIEW_ALL);
      console.log('Notifications response:', response.data);
      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || t('failed_to_load_notifications') || 'Failed to load notifications';
        Toast.error(errorMessage);
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Extract notifications from response
      // API response structure: { success: true, data: [...] }
      const data = response.data?.data || response.data || [];
      const notificationsList = Array.isArray(data) ? data : [];

      console.log('Notifications list from API:', notificationsList);

      // Map API response to notification format
      // API structure: { id, type, description, dateTime }
      const mappedNotifications: Notification[] = notificationsList.map((item: any) => ({
        id: item.id || item.notification_id,
        title: item.type || item.title || item.subject || 'Notification', // Prioritize 'type' for title
        message: item.description || item.message || item.body || item.content || '', // Prioritize 'description' for message
        time: item.dateTime || item.created_at || item.time || item.date || '', // Prioritize 'dateTime'
        created_at: item.dateTime || item.created_at || item.time || item.date, // Also store in created_at
        unread: item.is_read === false,
        is_read: item.is_read === true,
        isReview: item.isReview === true,
        type: item.type,
        clinic_id: item.clinic_id || item.clinicID,
      }));

      console.log('Mapped notifications:', mappedNotifications);

      setNotifications(mappedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        t('failed_to_load_notifications') || 'Failed to load notifications';
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
        const errorMessage = response.data?.message || t('failed_to_delete_notification') || 'Failed to delete notification';
        Toast.error(errorMessage);
        setDeletingId(null);
        return;
      }

      // Success - remove from list
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      Toast.success(response.data?.message || t('notification_deleted') || 'Notification deleted');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        t('failed_to_delete_notification') || 'Failed to delete notification';
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
                const errorMessage = response.data?.message || t('failed_to_clear_notifications') || 'Failed to clear notifications';
                Toast.error(errorMessage);
                setClearingAll(false);
                return;
              }

              // Success - clear all notifications
              setNotifications([]);
              Toast.success(response.data?.message || t('all_notifications_cleared') || 'All notifications cleared');
            } catch (error: any) {
              console.error('Error clearing notifications:', error);
              const errorMessage =
                error?.response?.data?.message ||
                error?.data?.message ||
                error?.message ||
                t('failed_to_clear_notifications') || 'Failed to clear notifications';
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

  const handleRatingSubmit = async (rating: number, feedback: string) => {
    if (!clinicIdToRate) {
      Toast.error(t('clinic_id_required') || 'Clinic ID is required');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await apiClient.post(API.HISTORY.RATE_CLINIC, {
        clinicID: clinicIdToRate,
        rating: rating,
        review: feedback || '',
      });

      if (response.data?.success !== false) {
        Toast.success(t('review_submitted_successfully') || 'Review submitted successfully');
        setShowRating(false);
      } else {
        throw new Error(response.data?.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Toast.error(error?.response?.data?.message || error?.message || t('failed_to_submit_review') || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  const openRatingSheet = (clinicId: number | string) => {
    setClinicIdToRate(clinicId);
    setShowRating(true);
  };

  // Format time/date — normalise to UTC before parsing so the displayed
  // time always reflects the device's local timezone, not raw UTC digits.
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      let ts = timeString.trim();

      // 'YYYY-MM-DD HH:MM:SS' → 'YYYY-MM-DDTHH:MM:SS'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(ts)) {
        ts = ts.replace(' ', 'T');
      }

      // If no timezone suffix, treat as UTC
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(ts)) {
        ts = ts + 'Z';
      }

      const date = new Date(ts);
      if (isNaN(date.getTime())) return timeString;

      return date.toLocaleString(undefined, {
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
  console.log('notifications', notifications);

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

                {notification.type === 'Appointment Booked' && notification.clinic_id && !notification.isReview && (
                  <TouchableOpacity
                    style={styles.giveReviewButton}
                    onPress={() => openRatingSheet(notification.clinic_id!)}
                  >
                    <Text style={styles.giveReviewButtonText}>{t('give_review') || 'Give Review'}</Text>
                  </TouchableOpacity>
                )}
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

      <RatingBottomSheet
        visible={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
        loading={submittingRating}
      />
    </SafeAreaView>
  );
};
