import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';
import { useFocusEffect } from '@react-navigation/native';
import { RecommandImage } from '@assets/images';
import { translateCityToEnglish } from '../../../utils/cityTranslator';

const TIMER_DURATION = 60; // 60 seconds - same as doctor's modal

export function WaitingForDoctor({ navigation, route }: any) {
  const { t } = useTranslation();
  const { consultationID, consultationType } = route?.params || {};
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isAccepted, setIsAccepted] = useState(false);
  const timerRef = useRef<any>(null);
  const refundProcessedRef = useRef(false);
  const pusherChannelRef = useRef<any>(null);
  const isAcceptedRef = useRef(false); // Track acceptance state for navigation blocking
  const auth = useAuthStore(state => state.auth);
  const patientID = auth ? ((auth as any).id || (auth as any).user?.id) : undefined;

  // Define handleTimeout first (before useEffects that use it)
  const handleTimeout = useCallback(async () => {
    if (refundProcessedRef.current || !consultationID || isAccepted) return;
    
    refundProcessedRef.current = true; // Mark refund as processed - allows navigation
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      // Call refund API immediately
      const response = await apiClient.post(API.CONSULTATIONS.REFUND_CONSULTATION, {
        consultationID: consultationID,
      });

      console.log('Refund response:', response.data);

      if (response.data?.success !== false) {
        // Show success message
        Toast.success(response.data?.message || t('refund_initiated') || 'Refund has been initiated');
        
        // Navigate to home - user can check refund status from Settings > Refund Requests
        setTimeout(() => {
          navigation.replace('EntryPoint');
        }, 1500);
      } else {
        // Show error and navigate to home
        Toast.error(response.data?.message || t('refund_failed') || 'Failed to initiate refund');
        
        setTimeout(() => {
          navigation.replace('EntryPoint');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      Toast.error(error?.response?.data?.message || t('refund_failed') || 'Failed to initiate refund');
      
      // Navigate to home even on error
      setTimeout(() => {
        navigation.replace('EntryPoint');
      }, 1500);
    }
  }, [consultationID, navigation, t, isAccepted]);

  // Listen to Pusher events for consultation acceptance
  useEffect(() => {
    if (!consultationID || !patientID || isAccepted || refundProcessedRef.current) return;

    // Initialize Pusher service
    pusherService.initialize();
    
    // Verify Pusher is initialized
    const pusher = pusherService.getInstance();
    if (!pusher) {
      console.warn('📞 [WaitingForDoctor] Pusher not initialized');
      return;
    }

    // Subscribe to patient-specific consultation channel
    const channelName = `patient-consultation${patientID}`;
    console.log(`📞 [WaitingForDoctor] Listening on channel: ${channelName} for consultation: ${consultationID}`);

    // Listen for consultation update events
    const handleConsultationUpdate = (data: any) => {
      console.log('📞 [WaitingForDoctor] Consultation update received:', data);
      
      const consultation = data?.consultation || data?.message || data;
      const consultationStatus = consultation?.status || data?.status;
      const isAcceptedStatus = consultationStatus === 'Accepted' || consultationStatus === 'accepted' || consultationStatus === 'Pending' || consultationStatus === 'pending';
      const consultationIdFromEvent = consultation?.id || data?.consultationID || data?.id;

      // Check if this is the consultation we're waiting for
      if (isAcceptedStatus && consultationIdFromEvent?.toString() === consultationID?.toString()) {
        console.log('✅ [WaitingForDoctor] Doctor accepted! Navigating...');
        setIsAccepted(true);
        isAcceptedRef.current = true; // Update ref for navigation blocking
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Extract doctor and clinic data from consultation
        const doctorData = consultation?.doctor || data?.doctor;
        const clinicData = consultation?.clinic || data?.clinic;
        const finalConsultationType = consultationType || consultation?.type || 'Chat';

        console.log('📞 [WaitingForDoctor] Extracted data for navigation:', {
          consultationID,
          consultationType: finalConsultationType,
          doctorData,
          clinicData,
        });

        // Show success message
        Toast.success(t('doctor_accepted_consultation') || 'Doctor has accepted your consultation!');

        // Navigate based on consultation type with complete data
        setTimeout(() => {
          const userId = patientID ? `patient_${patientID}` : `patient_${Date.now()}`;
          const recipientID = doctorData?.id || consultation?.doctorID;
          
          if (finalConsultationType === 'Audio' || finalConsultationType === 'audio') {
            navigation.replace('AudioConsultation', {
              consultationId: `consultation_${consultationID}`,
              userId: userId,
              isInitiator: true,
              recipientID: recipientID,
              doctorInfo: {
                id: String(recipientID || ''),
                name: doctorData?.name || 'Doctor',
                avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                specialization: doctorData?.specialization || '',
              },
            });
          } else if (finalConsultationType === 'Video' || finalConsultationType === 'video') {
            navigation.replace('VideoConsultation', {
              consultationId: `consultation_${consultationID}`,
              userId: userId,
              isInitiator: true,
              recipientID: recipientID,
              doctorInfo: {
                id: String(recipientID || ''),
                name: doctorData?.name || 'Doctor',
                avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                specialization: doctorData?.specialization || '',
              },
            });
          } else {
            // Chat consultation - match usePusherNotifications pattern
            navigation.replace('ChatScreen', {
              chatType: 'doctor', // 'doctor' means doctor consultation (not AI), same as usePusherNotifications
              consultationID: consultationID,
              recipientID: recipientID,
              doctorInfo: {
                id: String(recipientID || ''),
                name: doctorData?.name || 'Doctor',
                avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
                specialization: doctorData?.specialization || '',
              },
              clinicInfo: {
                name: clinicData?.name || clinicData?.clinicName || 'Clinic',
                location: clinicData?.location || translateCityToEnglish(clinicData?.city) || '',
                image: clinicData?.image ? { uri: clinicData.image } : RecommandImage,
              },
              fromHistory: false,
            });
          }
        }, 500);
      }
    };

    // Use pusherService.bind() which handles subscription internally
    pusherService.bind(channelName, 'consultation-patient', handleConsultationUpdate);

    return () => {
      // Cleanup: unbind event and unsubscribe from channel
      pusherService.unbind(channelName, 'consultation-patient');
      pusherService.unsubscribe(channelName);
      pusherChannelRef.current = null;
    };
  }, [consultationID, patientID, consultationType, isAccepted, navigation, t]);

  // Countdown timer
  useEffect(() => {
    if (isAccepted || refundProcessedRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer expired - initiate refund
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAccepted, handleTimeout]);

  // Prevent all navigation while waiting
  useFocusEffect(
    useCallback(() => {
      // Block hardware back button (Android) - check refs for current state
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Only allow navigation if timer expired (refund processed) or doctor accepted
        if (isAcceptedRef.current || refundProcessedRef.current) {
          return false; // Allow navigation
        }
        // Prevent going back while waiting
        return true; // Return true to prevent default behavior
      });

      // Disable swipe gestures and prevent navigation
      navigation.setOptions({
        gestureEnabled: false, // Disable swipe gestures (iOS)
        headerBackVisible: false, // Hide back button
      });

      // Intercept any navigation attempts (this prevents programmatic navigation too)
      const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
        // Only allow navigation if we're navigating away programmatically (after timer/acceptance)
        // Use refs to check current state (not stale closure values)
        if (isAcceptedRef.current || refundProcessedRef.current) {
          // Allow navigation - remove listener and let navigation proceed
          return;
        }

        // Prevent any other navigation attempts (back button, gestures, programmatic)
        e.preventDefault();
        return false;
      });

      return () => {
        backHandler.remove();
        unsubscribeBeforeRemove();
      };
    }, [navigation]) // Remove isAccepted from deps since we use ref
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={t('waiting_for_doctor') || 'Waiting for Doctor'} back={false} />
      
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        
        <Text style={styles.title}>
          {t('waiting_for_doctor_to_accept') || 'Waiting for Doctor to Accept'}
        </Text>
        
        <Text style={styles.message}>
          {t('waiting_for_doctor_message') || 'Please wait while we connect you with a doctor. This may take up to 60 seconds.'}
        </Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>
            {t('time_remaining') || 'Time Remaining'}
          </Text>
          <Text style={styles.timerValue}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}