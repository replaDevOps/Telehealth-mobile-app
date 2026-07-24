import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, BackHandler, AppState, AppStateStatus } from 'react-native';
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
import NoResponseModal from '@components/molecules/NoResponseModal';
import { translateCityToEnglish } from '../../../utils/cityTranslator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_DURATION = 120; // 120 seconds (2 minutes)

export function WaitingForDoctor({ navigation, route }: any) {
  const { t } = useTranslation();
  const { consultationID, consultationType } = route?.params || {};
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showNoResponseModal, setShowNoResponseModal] = useState(false);
  const [isTimerReady, setIsTimerReady] = useState(false);
  const timerRef = useRef<any>(null);
  const startTimestampRef = useRef<number>(Date.now());
  const refundProcessedRef = useRef(false);

  console.log('🔄 [WaitingForDoctor] Render — timeLeft:', timeLeft, 'isAccepted:', isAccepted, 'showModal:', showNoResponseModal, 'startTs:', startTimestampRef.current, 'ready:', isTimerReady);
  const pusherChannelRef = useRef<any>(null);
  const isAcceptedRef = useRef(false); // Track acceptance state for navigation blocking
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const auth = useAuthStore(state => state.auth);
  const patientID = auth ? ((auth as any).id || (auth as any).user?.id) : undefined;
  const timerStorageKey = consultationID ? `waiting_timer_${consultationID}` : 'waiting_timer_unknown';

  // --- Helpers ---
  const getRemainingSeconds = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
    return Math.max(0, TIMER_DURATION - elapsed);
  }, []);

  const showTimeoutModal = useCallback(() => {
    console.log('⏰ [WaitingForDoctor] showTimeoutModal called — refundProcessed:', refundProcessedRef.current, 'isAccepted:', isAcceptedRef.current);
    if (refundProcessedRef.current || isAcceptedRef.current) {
      console.log('⏰ [WaitingForDoctor] showTimeoutModal: skipping (already resolved)');
      return;
    }
    // Stop the foreground interval
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeLeft(0);
    console.log('⏰ [WaitingForDoctor] showTimeoutModal: setting showNoResponseModal = true');
    setShowNoResponseModal(true);
  }, []);

  // Initialize timer from persistent storage so it survives backgrounding or process restarts
  useEffect(() => {
    let isMounted = true;

    const initTimer = async () => {
      try {
        const stored = await AsyncStorage.getItem(timerStorageKey);
        let startTs = stored ? Number(stored) : Date.now();

        if (!stored) {
          await AsyncStorage.setItem(timerStorageKey, String(startTs));
        }

        startTimestampRef.current = startTs;
        const remaining = Math.max(0, TIMER_DURATION - Math.floor((Date.now() - startTs) / 1000));

        if (isMounted) {
          setTimeLeft(remaining);
          setIsTimerReady(true);
        }

        if (remaining <= 0) {
          console.log('⏰ [WaitingForDoctor] Timer already expired at init — showing modal');
          showTimeoutModal();
        }
      } catch (e) {
        console.warn('⏰ [WaitingForDoctor] Failed to init timer from storage:', e);
        if (isMounted) {
          setIsTimerReady(true);
        }
      }
    };

    initTimer();

    return () => {
      isMounted = false;
    };
  }, [timerStorageKey, showTimeoutModal]);

  // Helper: navigate to the correct consultation screen
  const navigateToConsultation = useCallback((consultation: any, data?: any) => {
    const doctorData = consultation?.doctor || data?.doctor;
    const clinicData = consultation?.clinic || data?.clinic;
    const finalConsultationType = consultationType || consultation?.type || 'Chat';
    const userId = patientID ? `patient_${patientID}` : `patient_${Date.now()}`;
    const recipientID = doctorData?.id || consultation?.doctorID;

    Toast.success(t('doctor_accepted_consultation') || 'Doctor has accepted your consultation!');

    setTimeout(() => {
      if (finalConsultationType === 'Audio' || finalConsultationType === 'audio') {
        navigation.replace('AudioConsultation', {
          consultationId: `consultation_${consultationID}`,
          userId, isInitiator: true, recipientID,
          doctorInfo: { id: String(recipientID || ''), name: doctorData?.name || 'Doctor', avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12', specialization: doctorData?.specialization || '' },
        });
      } else if (finalConsultationType === 'Video' || finalConsultationType === 'video') {
        navigation.replace('VideoConsultation', {
          consultationId: `consultation_${consultationID}`,
          userId, isInitiator: true, recipientID,
          doctorInfo: { id: String(recipientID || ''), name: doctorData?.name || 'Doctor', avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12', specialization: doctorData?.specialization || '' },
        });
      } else {
        navigation.replace('ChatScreen', {
          chatType: 'doctor',
          consultationID,
          recipientID,
          doctorInfo: { id: String(recipientID || ''), name: doctorData?.name || 'Doctor', avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12', specialization: doctorData?.specialization || '' },
          clinicInfo: { name: clinicData?.name || clinicData?.clinicName || 'Clinic', location: clinicData?.location || translateCityToEnglish(clinicData?.city) || '', image: clinicData?.image ? { uri: clinicData.image } : RecommandImage },
          fromHistory: false,
        });
      }
    }, 500);
  }, [consultationID, consultationType, patientID, navigation, t]);

  // Helper: poll consultation status from API (fallback when Pusher missed an event)
  const pollConsultationStatus = useCallback(async () => {
    if (!consultationID || isAcceptedRef.current || refundProcessedRef.current) return;
    try {
      const response = await apiClient.get(
        `${API.HISTORY.GET_CONSULTATIONS}`,
        { params: { consultationID } },
      );
      const consultation =
        response.data?.data?.find?.((c: any) => c.id?.toString() === consultationID?.toString()) ||
        response.data?.data;
      const status = consultation?.status;
      const accepted = status === 'Accepted' || status === 'accepted' || status === 'Pending' || status === 'pending' || status === 'Booked' || status === 'booked';
      if (accepted && consultation) {
        console.log('✅ [WaitingForDoctor] Doctor accepted (API poll)');
        setIsAccepted(true);
        isAcceptedRef.current = true;
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        try { await AsyncStorage.removeItem(timerStorageKey); } catch (e) {}
        navigateToConsultation(consultation);
      }
    } catch (e) {
      console.warn('📞 [WaitingForDoctor] Poll failed:', e);
    }
  }, [consultationID, navigateToConsultation, timerStorageKey]);

  // --- AppState: recalculate timer + reconnect Pusher on foreground ---
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextAppState;

      if (prev.match(/inactive|background/) && nextAppState === 'active') {
        console.log('⏰ [WaitingForDoctor] App returned to foreground — isAccepted:', isAcceptedRef.current, 'refundProcessed:', refundProcessedRef.current, 'startTs:', startTimestampRef.current);

        if (!isTimerReady) {
          console.log('⏰ [WaitingForDoctor] Timer not ready yet, skipping foreground check');
          return;
        }

        // Already resolved? Nothing to do.
        if (isAcceptedRef.current || refundProcessedRef.current) {
          console.log('⏰ [WaitingForDoctor] Already resolved, skipping');
          return;
        }

        // 1. Recalculate remaining time
        const remaining = getRemainingSeconds();
        console.log('⏰ [WaitingForDoctor] Remaining after background:', remaining, 'seconds (elapsed:', Math.floor((Date.now() - startTimestampRef.current) / 1000), 's)');
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Timer expired while backgrounded → show modal immediately
          console.log('⏰ [WaitingForDoctor] Timer expired in background – calling showTimeoutModal');
          showTimeoutModal();
          return;
        }

        // 2. Reconnect Pusher (it likely disconnected)
        try {
          pusherService.initialize();
        } catch (e) {
          console.warn('📞 [WaitingForDoctor] Pusher reconnect failed:', e);
        }

        // 3. Poll API as a safety-net for missed Pusher events
        pollConsultationStatus();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [getRemainingSeconds, showTimeoutModal, pollConsultationStatus, isTimerReady]);

  // --- Foreground countdown interval ---
  useEffect(() => {
    console.log('⏰ [WaitingForDoctor] Foreground interval effect — isAccepted:', isAccepted, 'refundProcessed:', refundProcessedRef.current, 'showModal:', showNoResponseModal);

    if (!isTimerReady || isAccepted || refundProcessedRef.current || showNoResponseModal) {
      console.log('⏰ [WaitingForDoctor] Skipping foreground interval (already resolved)');
      return;
    }

    // Do NOT reset startTimestampRef here — it was set once when the component mounted.
    // Resetting it would restart the countdown if this effect re-runs.

    timerRef.current = setInterval(() => {
      const remaining = getRemainingSeconds();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        console.log('⏰ [WaitingForDoctor] Foreground interval: time is up, showing modal');
        showTimeoutModal();
      }
    }, 1000);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [isTimerReady, isAccepted, showNoResponseModal, getRemainingSeconds, showTimeoutModal]);

  // Called when user taps refund button in modal
  const handleUserInitiatedRefund = useCallback(async () => {
    if (refundProcessedRef.current || !consultationID) return;

    refundProcessedRef.current = true; // mark processed to allow navigation

    // Close modal
    setShowNoResponseModal(false);

    try {
      const response = await apiClient.post(API.CONSULTATIONS.REFUND_CONSULTATION, {
        consultationID: consultationID,
      });

      console.log('Refund response:', response.data);

      if (response.data?.success !== false) {
        Toast.success(response.data?.message || t('refund_initiated') || 'Refund has been initiated');
      } else {
        Toast.error(response.data?.message || t('refund_failed') || 'Failed to initiate refund');
      }
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      Toast.error(error?.response?.data?.message || t('refund_failed') || 'Failed to initiate refund');
    } finally {
      try { await AsyncStorage.removeItem(timerStorageKey); } catch (e) {}
      // Navigate to home in all cases after user requested refund
      setTimeout(() => {
        navigation.replace('EntryPoint');
      }, 800);
    }
  }, [consultationID, navigation, t, timerStorageKey]);

  // --- Pusher listener for consultation acceptance ---
  useEffect(() => {
    if (!consultationID || !patientID || isAccepted || refundProcessedRef.current) return;

    pusherService.initialize();
    const pusher = pusherService.getInstance();
    if (!pusher) {
      console.warn('📞 [WaitingForDoctor] Pusher not initialized');
      return;
    }

    const channelName = `patient-consultation${patientID}`;
    console.log(`📞 [WaitingForDoctor] Listening on channel: ${channelName} for consultation: ${consultationID}`);

    const handleConsultationUpdate = (data: any) => {
      console.log('📞 [WaitingForDoctor] Consultation update received:', data);

      const consultation = data?.consultation || data?.message || data;
      const consultationStatus = consultation?.status || data?.status;
      const isAcceptedStatus = consultationStatus === 'Accepted' || consultationStatus === 'accepted' || consultationStatus === 'Pending' || consultationStatus === 'pending' || consultationStatus === 'Booked' || consultationStatus === 'booked';
      const consultationIdFromEvent = consultation?.id || data?.consultationID || data?.id;

      if (isAcceptedStatus && consultationIdFromEvent?.toString() === consultationID?.toString()) {
        console.log('✅ [WaitingForDoctor] Doctor accepted! Navigating...');
        setIsAccepted(true);
        isAcceptedRef.current = true;
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        try { AsyncStorage.removeItem(timerStorageKey); } catch (e) {}
        navigateToConsultation(consultation, data);
      }
    };

    pusherService.bind(channelName, 'consultation-patient', handleConsultationUpdate);

    return () => {
      pusherService.unbind(channelName, 'consultation-patient');
      pusherService.unsubscribe(channelName);
      pusherChannelRef.current = null;
    };
  }, [consultationID, patientID, consultationType, isAccepted, navigation, t, navigateToConsultation, timerStorageKey]);

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
      <NoResponseModal
        visible={showNoResponseModal}
        onClose={() => setShowNoResponseModal(false)}
        onGetPrescription={handleUserInitiatedRefund}
      />
    </SafeAreaView>
  );
}