import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationCountContext } from '@context/NotificationCountContext';
import { useNotificationStore } from '@store/useNotificationStore';

export const useNotificationCount = () => {
  const { notificationCount: contextCount, setNotificationCount: setContextCount, refreshTrigger } = useNotificationCountContext();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchNotificationCount = useCallback(async () => {
    // Prevent concurrent calls
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);

      // Fetch notifications from store (it handles caching)
      await fetchNotifications();
      
      // The unreadCount will be updated in the store
      // We'll sync it to context in useEffect
    } catch (error: any) {
      console.error('Error fetching notification count:', error);
      setContextCount(0);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchNotifications, setContextCount]);

  // Sync unreadCount from store to context
  useEffect(() => {
    setContextCount(unreadCount);
  }, [unreadCount, setContextCount]);

  // Fetch on mount (only once when component mounts)
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  // Fetch when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchNotificationCount();
    }
  }, [refreshTrigger, fetchNotificationCount]);

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, [fetchNotificationCount])
  );

  return { notificationCount: contextCount, loading, refreshNotificationCount: fetchNotificationCount };
};
