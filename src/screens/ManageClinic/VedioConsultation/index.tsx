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
import { colors } from '../../../styles/colors';
import { doctor } from '@assets/images';
import ConsultationEndedModal from '@components/molecules/EndSectionModal';
import { styles } from './style';

export function VideoConsultation({ navigation, route }) {
  const doctorInfo = route?.params?.doctorInfo || {
    name: 'Dr. Yasmin Chowdhury',
    avatar: doctor,
    specialization: 'Dermatologist',
  };

  const [callStatus, setCallStatus] = useState('Connecting....');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const handleGetPrescription = () => {
    setModalVisible(false);
    console.log('User wants to get the prescription');
    navigation.navigate('PrescriptionScreen');
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    // Simulate connecting to call
    const connectTimer = setTimeout(() => {
      setCallStatus('Connected');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    // Start call duration timer when connected
    let interval;
    if (callStatus === 'Connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setModalVisible(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const switchCamera = () => {
    console.log('Switch camera');
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
              {callStatus === 'Connected'
                ? formatDuration(callDuration)
                : callStatus}
            </Text>
          </View>

          {/* Small Doctor Preview (Picture-in-Picture) - Only when connected */}
          {callStatus === 'Connected' && (
            <View style={styles.pipContainer}>
              <Image
                source={doctorInfo.avatar}
                style={styles.pipImage}
                resizeMode="cover"
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
                !isCameraOn && styles.controlButtonActive,
              ]}
              onPress={toggleCamera}
            >
              <Ionicons
                name={isCameraOn ? 'videocam' : 'videocam-off'}
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

        <ConsultationEndedModal
          visible={modalVisible}
          onClose={handleClose}
          onGetPrescription={handleGetPrescription}
        />
      </ImageBackground>
    </View>
  );
}
