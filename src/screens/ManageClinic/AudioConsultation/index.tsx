import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { doctor } from '@assets/images';
import { mvs } from '@config/metrices';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { useTranslation } from 'react-i18next';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { Toast } from 'toastify-react-native';

export function AudioConsultation({ navigation, route }) {
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
  const signalingServerUrl = route?.params?.signalingServerUrl || 'http://192.168.1.100:3001';

  const [callDuration, setCallDuration] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Initialize WebRTC for audio-only call
  const {
    isConnected,
    isConnecting,
    isMuted,
    isReady,
    error,
    toggleMute,
    startCall,
    endCall,
    joinCall,
  } = useWebRTC({
    userId,
    roomId: consultationId,
    isVideoEnabled: false,
    isAudioEnabled: true,
    signalingServerUrl,
  });

  // Keep speaker state locally (WebRTC handles audio routing)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

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

  const toggleSpeaker = () => {
    // Note: Speaker toggle would need native module integration
    // For now, just toggle the state
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement native speaker toggle
  };

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

      {/* Full Screen Background Image */}
      <ImageBackground
        source={doctorInfo.avatar}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <View style={styles.overlay} />
        {/* Content */}
        <SafeAreaView style={styles.safeArea}>
          {/* Doctor Info at Top */}
          <View style={styles.topSection}>
            <Text style={styles.doctorName}>{doctorInfo.name}</Text>
            <Text style={styles.callStatus}>
              {getCallStatus()}
            </Text>
          </View>

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
                size={28}
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
                size={28}
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
        <ConsultationEndedModal
          visible={modalVisible}
          onClose={handleClose}
          onGetPrescription={handleGetPrescription}
        />
      </ImageBackground>
    </View>
  );
}

import { styles } from './style';
