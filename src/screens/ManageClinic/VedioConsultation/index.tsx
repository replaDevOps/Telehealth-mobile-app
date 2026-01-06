import React, { useState, useEffect } from 'react';
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

  const [callDuration, setCallDuration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const CONSULTATION_MAX_DURATION = 30 * 60; // 30 minutes in seconds
  const [remainingSeconds, setRemainingSeconds] = useState(CONSULTATION_MAX_DURATION);

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
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    setModalVisible(true);
  };

  // Auto-disconnect after 30 minutes (works for both patient and doctor)
  useEffect(() => {
    if (!isConnected) {
      // Reset timer when disconnected
      setRemainingSeconds(CONSULTATION_MAX_DURATION);
      return;
    }

    // Reset timer when call connects
    setRemainingSeconds(CONSULTATION_MAX_DURATION);

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('⏰ [VideoConsultation] 30 minutes elapsed, auto-ending call');
          // Auto-end the call and show modal
          endCall();
          setModalVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, endCall]);


  // Determine call status
  const getCallStatus = () => {
    if (error && !isConnected) return t('failed');
    if (isConnecting) return t('connecting');
    if (isConnected) return formatDuration(callDuration);
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
