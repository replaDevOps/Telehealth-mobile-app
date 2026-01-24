import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { DoctorInfo } from '../../../types/chat.types';
import { useCartCount } from '../../../hooks/useCartCount';

interface ChatHeaderProps {
  chatType: 'ai' | 'doctor';
  doctorInfo: DoctorInfo;
  consultationTime: string;
  fromHistory: boolean;
  handleGoBack: () => void;
  handleEndConsultation: () => void;
  handleCart: () => void;
  isConsultationActive?: boolean; // Add flag to show timer when active
  consultationData?: {
    doctor?: {
      name?: string;
      image?: string;
    };
    service?: {
      name?: string;
      duration?: number;
    };
    type?: string;
    code?: string;
  } | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatType,
  doctorInfo,
  consultationTime,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
  handleCart,
  isConsultationActive = false,
  consultationData,
}) => {
  const { cartCount } = useCartCount();
  
  // Extract doctor and service info from consultation data
  const doctorName = consultationData?.doctor?.name || doctorInfo.name;
  const serviceName = consultationData?.service?.name || '';
  const consultationType = consultationData?.type || '';
  const consultationCode = consultationData?.code || '';
  const serviceDuration = consultationData?.service?.duration;
  
  // Build subtitle: Show countdown timer when consultation is active, otherwise show service info
  const buildSubtitle = () => {
    // When consultation is active, always show the countdown timer
    if (isConsultationActive && !fromHistory) {
      return consultationTime; // This is the formatted countdown timer (MM:SS)
    }
    
    // When viewing history, show service info
    if (!consultationData) {
      return doctorInfo.serviceName || consultationTime;
    }
    
    const parts: string[] = [];
    // Add code if available
    if (consultationCode) {
      parts.push(consultationCode);
    }
    // Add service name if available
    if (serviceName) {
      parts.push(serviceName);
    }
    // Add type if available
    if (consultationType) {
      parts.push(consultationType);
    }
    // // Add duration if available
    // if (serviceDuration) {
    //   parts.push(`${serviceDuration} min`);
    // }
    
    return parts.length > 0 ? parts.join(' | ') : (doctorInfo.serviceName || consultationTime);
  };
  
  return chatType === 'ai' ? (
    <Header2 title="Chat" showCart logo HandleCart={handleCart} cartCount={cartCount} />
  ) : (
    <View style={styles.doctorHeaderContainer}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.doctorHeaderCenter}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.consultationTime}>
          {buildSubtitle()}
        </Text>
      </View>

      {!fromHistory && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConsultation}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
