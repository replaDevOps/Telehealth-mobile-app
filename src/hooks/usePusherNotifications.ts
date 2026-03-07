import { useEffect, useRef } from 'react';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';
import { useNotificationStore } from '@store/useNotificationStore';
import { navigationRef } from '@navigation/root-navigation';
import { Toast } from 'toastify-react-native';
import { RecommandImage } from '@assets/images';
import { translateCityToEnglish } from '../utils/cityTranslator';

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
    const handleNotification = async (data: any) => {
      console.log('Notification received:', data);

      // Refresh notifications from API
      try {
        const { refreshNotifications } = useNotificationStore.getState();
        await refreshNotifications();
        console.log('✅ Notifications refreshed after Pusher event');
      } catch (error) {
        console.error('❌ Error refreshing notifications:', error);
      }

      // Show toast notification - ensure we extract a string value
      let notificationMessage = 'New notification received';

      if (typeof data === 'string') {
        notificationMessage = data;
      } else if (data && typeof data === 'object') {
        // Extract string from various possible fields
        notificationMessage =

          'New notification received';
      }

      // Ensure it's a string, not an object
      if (typeof notificationMessage !== 'string') {
        notificationMessage = JSON.stringify(notificationMessage);
      }

      Toast.info(notificationMessage);
    };

    // Handler for consultation-patient event (when doctor accepts consultation)
    const handleConsultationUpdate = (data: any) => {
      console.log('📞 [Pusher] Consultation update received:', JSON.stringify(data, null, 2));

      // Extract consultation data - handle multiple formats:
      // 1. data.consultation (wrapped)
      // 2. data.message (consultation in message field)
      // 3. data (direct consultation object)
      const consultation = data?.consultation || data?.message || data;

      console.log('📞 [Pusher] Extracted consultation object:', JSON.stringify(consultation, null, 2));
      console.log('📞 [Pusher] Validation checks:', {
        hasConsultation: !!consultation,
        isObject: typeof consultation === 'object',
        hasId: !!consultation?.id,
        consultationId: consultation?.id,
        consultationType: consultation?.type,
        consultationStatus: consultation?.status,
      });

      // Ensure we have a valid consultation object
      if (!consultation || typeof consultation !== 'object' || !consultation.id) {
        console.warn('❌ [Pusher] Invalid consultation data - returning early. Data:', JSON.stringify(data, null, 2));
        // Try to show a safe message
        const safeMessage = typeof data === 'string' ? data : (data?.message || 'Consultation update received');
        Toast.info(safeMessage);
        return;
      }

      // Check if consultation was accepted or is pending (for Chat type, navigate when pending)
      const consultationStatus = consultation?.status || data?.status;
      const isAccepted = consultationStatus === 'Accepted' || consultationStatus === 'accepted';
      const isPending = consultationStatus === 'Pending' || consultationStatus === 'pending';
      const consultationType = consultation?.type || data?.type || 'Chat';

      console.log('📞 [Pusher] Navigation decision:', {
        consultationStatus,
        isAccepted,
        isPending,
        consultationType,
        shouldNavigateLogic: `isPending=${isPending} || isAccepted=${isAccepted}`,
      });

      // Navigate when:
      // 1. Status is "Accepted" (explicitly accepted)
      // 2. Status is "Pending" (doctor has accepted, consultation is ready to start)
      // Note: Backend sends "Pending" status after doctor accepts for all consultation types
      const shouldNavigate = isPending || isAccepted;

      console.log('📞 [Pusher] Should navigate?', shouldNavigate);

      if (shouldNavigate) {
        const consultationID = consultation?.id || data?.consultationID || data?.id;
        const doctorData = consultation?.doctor || data?.doctor;
        const clinicData = consultation?.clinic || data?.clinic;

        console.log('✅ [Pusher] Consultation ready! Navigating...', {
          consultationID,
          consultationType,
          consultationStatus,
          doctorData,
          clinicData,
        });

        // Show success toast
        const toastMessage = isAccepted
          ? 'Your consultation request has been accepted'
          : 'Your consultation is ready';
        Toast.success(toastMessage);

        // Navigate based on consultation type
        setTimeout(() => {
          if (navigationRef.isReady()) {
            try {
              if (consultationType === 'Chat' || consultationType === 'chat') {
                // Navigate to ChatScreen for chat consultations
                (navigationRef as any).navigate('Main', {
                  screen: 'ChatScreen',
                  params: {
                    chatType: 'doctor',
                    consultationID: consultationID,
                    recipientID: doctorData?.id || consultation?.doctorID,
                    doctorInfo: {
                      id: String(doctorData?.id || consultation?.doctorID || ''),
                      name: doctorData?.name || 'Doctor',
                      avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                      specialization: doctorData?.specialization,
                    },
                    clinicInfo: {
                      name: clinicData?.name || clinicData?.clinicName || 'Clinic',
                      location: clinicData?.location || translateCityToEnglish(clinicData?.city) || '',
                      image: clinicData?.image ? { uri: clinicData.image } : RecommandImage,
                    },
                  },
                });
              } else if (consultationType === 'Audio' || consultationType === 'audio') {
                // Navigate to AudioConsultation for audio consultations
                const currentPatientID = (auth as any)?.user?.id || (auth as any)?.id;
                const userId = currentPatientID ? `patient_${currentPatientID}` : `patient_${Date.now()}`;

                console.log('🎤 [Pusher] Navigating to AudioConsultation with params:', {
                  consultationId: `consultation_${consultationID}`,
                  userId,
                  isInitiator: true,
                  doctorInfo: {
                    id: String(doctorData?.id || consultation?.doctorID || ''),
                    name: doctorData?.name || 'Doctor',
                  },
                });

                (navigationRef as any).navigate('Main', {
                  screen: 'AudioConsultation',
                  params: {
                    consultationId: `consultation_${consultationID}`,
                    userId: userId,
                    isInitiator: true, // Patient initiates the call
                    doctorInfo: {
                      id: String(doctorData?.id || consultation?.doctorID || ''),
                      name: doctorData?.name || 'Doctor',
                      avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                      specialization: doctorData?.specialization,
                    },
                  },
                });
              } else if (consultationType === 'Video' || consultationType === 'video') {
                // Navigate to VideoConsultation for video consultations
                const currentPatientID = (auth as any)?.user?.id || (auth as any)?.id;
                const userId = currentPatientID ? `patient_${currentPatientID}` : `patient_${Date.now()}`;

                console.log('📹 [Pusher] Navigating to VideoConsultation with params:', {
                  consultationId: `consultation_${consultationID}`,
                  userId,
                  isInitiator: true,
                  doctorInfo: {
                    id: String(doctorData?.id || consultation?.doctorID || ''),
                    name: doctorData?.name || 'Doctor',
                  },
                });

                (navigationRef as any).navigate('Main', {
                  screen: 'VideoConsultation',
                  params: {
                    consultationId: `consultation_${consultationID}`,
                    userId: userId,
                    isInitiator: true, // Patient initiates the call
                    doctorInfo: {
                      id: String(doctorData?.id || consultation?.doctorID || ''),
                      name: doctorData?.name || 'Doctor',
                      avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                      specialization: doctorData?.specialization,
                    },
                  },
                });
              }
            } catch (error) {
              console.error('❌ [Pusher] Error navigating to consultation screen:', error);
              console.error('❌ [Pusher] Error details:', error);
              // Fallback navigation
              if (consultationType === 'Chat' || consultationType === 'chat') {
                (navigationRef as any).navigate('ChatScreen', {
                  chatType: 'doctor',
                  consultationID: consultationID,
                  recipientID: doctorData?.id || consultation?.doctorID,
                  doctorInfo: {
                    id: String(doctorData?.id || consultation?.doctorID || ''),
                    name: doctorData?.name || 'Doctor',
                    avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                    specialization: doctorData?.specialization,
                  },
                  clinicInfo: {
                    name: clinicData?.name || clinicData?.clinicName || 'Clinic',
                    location: clinicData?.location || clinicData?.city || '',
                    image: clinicData?.image ? { uri: clinicData.image } : RecommandImage,
                  },
                });
              }
            }
          }
        }, 1500);
      } else {
        console.log('⏸️ [Pusher] Consultation not ready for navigation:', {
          consultationStatus,
          consultationType,
          isAccepted,
          isPending,
          shouldNavigate,
        });

        // Other consultation updates - ensure we extract a string, not an object
        let consultationMessage = 'Consultation update received';

        if (typeof data === 'string') {
          consultationMessage = data;
        } else if (data && typeof data === 'object') {
          // Extract string from various possible fields
          consultationMessage =
            data?.message ||
            data?.description ||
            (consultation?.status ? `Consultation ${consultation.status}` : null) ||
            (data?.status ? `Consultation ${data.status}` : null) ||
            'Consultation update received';
        }

        // Ensure it's a string, not an object
        if (typeof consultationMessage !== 'string') {
          consultationMessage = JSON.stringify(consultationMessage);
        }

        // Toast.info(consultationMessage);
      }
    };

    // Handler for message-sent event
    const handleMessageSent = (data: any) => {
      console.log('Message sent alert:', data);
    };

    // Handler for message-received event
    const handleMessageReceived = (data: any) => {
      console.log('Message received alert:', data);
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

