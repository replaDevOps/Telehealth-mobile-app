import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';
import { Toast } from 'toastify-react-native';

/**
 * Hook to set up Pusher listeners for patient notifications and consultations
 */
export const usePusherNotifications = () => {
  const auth = useAuthStore(state => state.auth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  // Handle both auth.id (actual structure) and auth.user.id (type definition)
  // The actual stored auth is the user object itself, not wrapped
  const patientID = auth ? ((auth as any).id || (auth as any).user?.id) : undefined;
  const listenersSetRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    console.log('🔔 [usePusherNotifications] Effect triggered', {
      isAuthenticated,
      hasAuth: !!auth,
      patientID,
      listenersSet: listenersSetRef.current,
    });

    // Only proceed if user is authenticated and has an ID
    if (!isAuthenticated || !auth || !patientID || listenersSetRef.current) {
      console.log('🔔 [usePusherNotifications] Skipping Pusher setup:', {
        isAuthenticated,
        hasAuth: !!auth,
        patientID,
        listenersSet: listenersSetRef.current,
      });
      return;
    }

    console.log('🔔 [usePusherNotifications] Setting up Pusher for patient:', patientID);

    // Initialize Pusher connection as soon as user is logged in
    console.log('🔔 [usePusherNotifications] Initializing Pusher...');
    pusherService.initialize();
    console.log('🔔 [usePusherNotifications] Pusher initialized, connection status:', pusherService.getConnectionStatus());

    // Patient notification channel
    const notificationChannelName = `send-notification${patientID}`;
    const consultationChannelName = `patient-consultation${patientID}`;
    const sendMessageChannelName = `send-message${patientID}`;
    const receiveMessageChannelName = `received-message${patientID}`;

    // Handler for notification-send event
    const handleNotification = (data: any) => {
      console.log('Notification received:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
      // Show toast notification
      if (data?.message || data?.title) {
        Toast.info(data.message || data.title);
      }
    };

    // Handler for consultation-patient event
    const handleConsultationUpdate = (data: any) => {
      console.log('Consultation update received:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
      // Show toast notification
      if (data?.message || data?.status) {
        Toast.info(data.message || `Consultation ${data.status}`);
      }
    };

    // Handler for message-sent event
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
      Alert.alert("Message sent alert:\n" + JSON.stringify(data));
    };

    // Handler for message-received event
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
      Alert.alert("Message received alert:\n" + JSON.stringify(data));
    };

    // Bind events
    console.log('🔔 [usePusherNotifications] Binding via PusherService...');

    // 1. Notification
    try {
      pusherService.bind(notificationChannelName, 'notification-send', handleNotification);
    } catch (err) {
      console.error('❌ Error binding notification:', err);
    }

    // 2. Consultation
    try {
      pusherService.bind(consultationChannelName, 'consultation-patient', handleConsultationUpdate);
    } catch (err) {
      console.error('❌ Error binding consultation:', err);
    }

    // 3. Send Message
    try {
      pusherService.bind(sendMessageChannelName, 'message-sent', handleMessageSent);
    } catch (err) {
      console.error('❌ Error binding message-sent:', err);
    }

    // 4. Receive Message
    try {
      pusherService.bind(receiveMessageChannelName, 'message-received', handleMessageReceived);
    } catch (err) {
      console.error('❌ Error binding message-received:', err);
    }


    listenersSetRef.current = true;
    wasAuthenticatedRef.current = true;
    console.log('✅ [usePusherNotifications] Pusher setup completed for patient:', patientID);

    // Cleanup function
    return () => {
      pusherService.unbind(notificationChannelName, 'notification-send');
      pusherService.unbind(consultationChannelName, 'consultation-patient');
      pusherService.unbind(sendMessageChannelName, 'message-sent');
      pusherService.unbind(receiveMessageChannelName, 'message-received');

      pusherService.unsubscribe(notificationChannelName);
      pusherService.unsubscribe(consultationChannelName);
      pusherService.unsubscribe(sendMessageChannelName);
      pusherService.unsubscribe(receiveMessageChannelName);

      listenersSetRef.current = false;
    };
  }, [patientID, isAuthenticated, auth]);

  // Disconnect Pusher when user logs out (only if they were previously authenticated)
  useEffect(() => {
    console.log('🔔 [usePusherNotifications] Logout check effect', {
      isAuthenticated,
      hasAuth: !!auth,
      wasAuthenticated: wasAuthenticatedRef.current,
    });

    // Only disconnect if user was previously authenticated and now is not
    if (wasAuthenticatedRef.current && (!isAuthenticated || !auth)) {
      console.log('🔔 [usePusherNotifications] User logged out, disconnecting Pusher...');
      // User has logged out, disconnect Pusher
      try {
        pusherService.disconnect();
        console.log('✅ [usePusherNotifications] Pusher disconnected on logout');
      } catch (err) {
        console.error('❌ [usePusherNotifications] Error disconnecting Pusher on logout:', err);
      }
      listenersSetRef.current = false;
      wasAuthenticatedRef.current = false;
    } else if (isAuthenticated && auth) {
      // User is authenticated, update the ref
      wasAuthenticatedRef.current = true;
    }
  }, [isAuthenticated, auth]);
};

