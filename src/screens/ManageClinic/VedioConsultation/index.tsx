import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RTCView } from 'react-native-webrtc';
import { colors } from '../../../styles/colors';
import { doctor } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';
import { endConsultation } from '@services/api/webrtcService';
import { pusherService } from '@services/pusher/PusherService';
import { useAuthStore } from '@store';

export function VideoConsultation({ navigation, route }) {
  const { t } = useTranslation();
  const doctorInfo = route?.params?.doctorInfo || {
    name: 'Dr. Yasmin Chowdhury',
    avatar: doctor,
    specialization: 'Dermatologist',
  };

  // Get consultation parameters from route
  const consultationId = route?.params?.consultationId || `consultation_${Date.now()}`;
  const userId = route?.params?.userId || `patient_${Date.now()}`;
  const isInitiator = route?.params?.isInitiator ?? true;
  const recipientID = route?.params?.recipientID; // Doctor ID for patient, Patient ID for doctor

  const [callDuration, setCallDuration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const CONSULTATION_MAX_DURATION = 30 * 60; // 30 minutes in seconds (1800 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(CONSULTATION_MAX_DURATION);
  const consultationStartTimeRef = useRef<number | null>(null);
  const consultationEndedRef = useRef(false);
  const timerInitializedRef = useRef(false);
  const auth = useAuthStore(state => state.auth);
  const patientID = auth?.id;

  // Initialize WebRTC for video call
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    isReady,
    isSpeakerOn,
    error,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    startCall,
    endCall,
    joinCall,
  } = useWebRTC({
    userId,
    roomId: consultationId,
    isVideoEnabled: true,
    isAudioEnabled: true,
  });

  const handleGetPrescription = () => {
    setModalVisible(false);
    console.log('User wants to get the prescription');
    navigation.navigate('PrescriptionScreen');
  };

  const handleClose = () => {
    setModalVisible(false);
    endCall();
    navigation.navigate('EntryPoint');
  };

  // Start/join call when WebRTC is ready
  useEffect(() => {
    if (isReady) {
      const initCall = async () => {
        try {
          if (isInitiator) {
            await startCall();
          } else {
            await joinCall();
          }
        } catch (err) {
          console.error('Error initializing call:', err);
          Toast.error('Failed to connect to call');
        }
      };

      initCall();
    }
  }, [isReady, isInitiator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      Toast.error(error);
    }
  }, [error]);

  // Start call duration timer when connected
  useEffect(() => {
    let interval;
    if (isConnected) {
      // Track start time
      if (!consultationStartTimeRef.current) {
        consultationStartTimeRef.current = Date.now();
        console.log('📞 [VideoConsultation] Call connected, tracking duration');
      }
      
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // Extract consultation ID from consultationId (format: "consultation_2" -> 2)
  const consultationID = useMemo(() => {
    if (!consultationId) return null;
    const match = consultationId.toString().match(/consultation_(\d+)/);
    return match ? Number(match[1]) : Number(consultationId);
  }, [consultationId]);

  // Listen for consultation-end event from other side
  useEffect(() => {
    if (!consultationID || consultationEndedRef.current) return;

    pusherService.initialize();
    const pusher = pusherService.getInstance();
    if (!pusher) return;

    const channelName = `webrtc-consultation${consultationID}`;
    console.log('📞 [VideoConsultation] Listening for consultation-end on channel:', channelName);

    const handleConsultationEnd = (eventPayload: any) => {
      console.log('📞 [VideoConsultation] Consultation end event received (raw):', JSON.stringify(eventPayload, null, 2));
      if (consultationEndedRef.current) return;

      // Handle nested data structure: { data: { consultationID: ... } } or direct { consultationID: ... }
      let data = eventPayload;
      if (eventPayload?.data && typeof eventPayload.data === 'object') {
        data = eventPayload.data;
        console.log('📞 [VideoConsultation] Using nested data structure');
      }

      const eventConsultationID = data?.consultationID || data?.id || eventPayload?.consultationID || eventPayload?.id;
      const fromUser = (data?.from || eventPayload?.from || '').toString();
      
      // Check if this event is from the other side (doctor), not from ourselves (patient)
      const isFromPatient = fromUser && fromUser.startsWith('patient_');
      if (isFromPatient) {
        console.log('📞 [VideoConsultation] Ignoring own event from:', fromUser);
        return;
      }
      
      const eventIDStr = eventConsultationID?.toString() || '';
      const consultationIDStr = consultationID?.toString() || '';
      
      if (eventIDStr && consultationIDStr && eventIDStr === consultationIDStr) {
        console.log('✅ [VideoConsultation] Consultation ended by doctor, showing modal');
        consultationEndedRef.current = true;
        // Show modal first, then end call
        setModalVisible(true);
        // End the call locally after showing modal
        setTimeout(() => {
          endCall();
        }, 100);
      }
    };

    pusherService.bind(channelName, 'consultation-end', handleConsultationEnd);

    return () => {
      pusherService.unbind(channelName, 'consultation-end');
      pusherService.unsubscribe(channelName);
    };
  }, [consultationID]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    if (consultationEndedRef.current) return;
    consultationEndedRef.current = true;

    // Show modal first before ending call to ensure it displays
    setModalVisible(true);

    // Calculate duration and notify the other side
    if (consultationID && consultationStartTimeRef.current) {
      try {
        const durationMs = Date.now() - consultationStartTimeRef.current;
        const durationMinutes = Math.floor(durationMs / 60000);
        const duration = `${durationMinutes} min`;

        // Extract IDs - userId format: "patient_62" or "doctor_33"
        // For patient (isInitiator): from = patient_XX, to = doctor_YY
        // For doctor (!isInitiator): from = doctor_XX, to = patient_YY
        const fromUserId = userId || (isInitiator && patientID ? `patient_${patientID}` : `doctor_${recipientID || patientID}`);
        const toUserId = isInitiator 
          ? (recipientID ? `doctor_${recipientID}` : userId.replace('patient_', 'doctor_'))
          : (recipientID ? `patient_${recipientID}` : userId.replace('doctor_', 'patient_'));

        if (fromUserId && toUserId && !toUserId.includes('undefined')) {
          console.log('📞 [VideoConsultation] Ending consultation and notifying other side:', {
            consultationID,
            duration,
            from: fromUserId,
            to: toUserId,
          });

          await endConsultation({
            consultationID,
            duration,
            from: fromUserId,
            to: toUserId,
            offer: { type: 'offer', sdp: '...' },
          });

          console.log('✅ [VideoConsultation] Consultation ended successfully, other side notified');
        } else {
          console.warn('⚠️ [VideoConsultation] Missing user IDs, skipping API call:', { fromUserId, toUserId });
        }
      } catch (error: any) {
        console.error('❌ [VideoConsultation] Error ending consultation:', error);
        Toast.error(error?.response?.data?.message || 'Failed to end consultation');
      }
    }

    // End call locally after showing modal and making API call
    // Use setTimeout to ensure modal renders first before ending call
    setTimeout(() => {
      console.log('📞 [VideoConsultation] Calling endCall() after modal is shown');
      endCall();
    }, 300);
  };

  // Auto-disconnect after 30 minutes - countdown timer (works for both patient and doctor)
  useEffect(() => {
    if (!isConnected) {
      // Reset flags when disconnected
      timerInitializedRef.current = false;
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      return;
    }

    // Initialize timer once when call connects
    if (!timerInitializedRef.current) {
      timerInitializedRef.current = true;
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      console.log('⏰ [VideoConsultation] Starting 30-minute countdown timer');
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('⏰ [VideoConsultation] 30 minutes elapsed, auto-ending call');
          // Auto-end the call - this will call handleEndCall which shows modal
          handleEndCall();
          return 0;
        }
        return prev - 1; // Count down
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, handleEndCall]);


  // Determine call status - show countdown timer when connected
  const getCallStatus = () => {
    if (error && !isConnected) return t('failed');
    if (isConnecting) return t('connecting');
    if (isConnected) {
      // Show countdown timer (remainingSeconds counts down from 30:00 to 00:00)
      return formatDuration(remainingSeconds);
    }
    return t('connecting');
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full Screen Remote Video or Placeholder */}
      {remoteStream ? (
        <>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.backgroundImage}
            objectFit="cover"
            mirror={false}
          />
          {/* Dark Overlay for better text visibility */}
          <View style={styles.overlay} />
        </>
      ) : (
        <ImageBackground
          source={doctorInfo.avatar}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      )}

      {/* Content */}
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView style={styles.safeArea}>
          {/* Doctor Info at Top */}
          <View style={styles.topSection}>
            <Text style={styles.doctorName}>{doctorInfo.name}</Text>
            <Text style={styles.callStatus}>
              {getCallStatus()}
            </Text>
          </View>

          {/* Small Local Video (Picture-in-Picture) - Only when connected */}
          {isConnected && localStream && !isVideoOff && (
            <View style={styles.pipContainer}>
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.pipImage}
                objectFit="cover"
                mirror={true}
              />
            </View>
          )}

          {/* Call Controls at Bottom */}
          <View style={styles.controlsContainer}>
            {/* Speaker Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isSpeakerOn && styles.controlButtonActive,
              ]}
              onPress={toggleSpeaker}
            >
              <Ionicons
                name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isMuted && styles.controlButtonActive,
              ]}
              onPress={toggleMute}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Camera Toggle Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isVideoOff && styles.controlButtonActive,
              ]}
              onPress={toggleVideo}
            >
              <Ionicons
                name={!isVideoOff ? 'videocam' : 'videocam-off'}
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* Switch Camera Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={switchCamera}
            >
              <MaterialCommunityIcons
                name="camera-flip"
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={handleEndCall}
            >
              <Ionicons name="close" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ConsultationEndedModal
        visible={modalVisible}
        onClose={handleClose}
        onGetPrescription={handleGetPrescription}
      />
    </View>
  );
}
