import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Header2 } from '@components/common/Header2';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { useTranslation } from 'react-i18next';

export const NotificationScreen = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: t('appointment_confirmed'),
      message: t('appointment_confirmed_message'),
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 2,
      title: t('loyalty_points_earned'),
      message: t('loyalty_points_earned_message'),
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 3,
      title: t('points_redeemed'),
      message: t('points_redeemed_message'),
      time: '15 Nov 2025 - 09:12 AM',
      unread: true,
    },
    {
      id: 4,
      title: t('refund_processed'),
      message: t('refund_processed_message'),
      time: '15 Nov 2025 - 09:12 AM',
      unread: false,
    },
    {
      id: 5,
      title: t('update'),
      message: t('update_message'),
      time: '15 Nov 2025 - 09:12 AM',
      unread: false,
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={t('notifications')} />

      {notifications.length > 0 ? (
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
                <Text style={styles.time}>{notification.time}</Text>
              </View>

              {notification.unread && <View style={styles.unreadDot} />}
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
