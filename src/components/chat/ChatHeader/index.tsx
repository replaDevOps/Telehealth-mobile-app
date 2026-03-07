import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { DoctorInfo } from '../../../types/chat.types';
import { useCartCount } from '../../../hooks/useCartCount';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  chatType: 'ai' | 'doctor';
  doctorInfo: DoctorInfo;
  consultationTime: string;
  consultationElapsed?: string | null;
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
  consultationEnded?: boolean;
  consultationDuration?: string | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatType,
  doctorInfo,
  consultationTime,
  consultationElapsed = null,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
  handleCart,
  isConsultationActive = false,
  consultationData,
  consultationEnded = false,
  consultationDuration = null,
}) => {
  const { t } = useTranslation();
  const { cartCount } = useCartCount();

  // Extract doctor and service info from consultation data
  const serviceName = consultationData?.service?.name || '';
  const consultationType = consultationData?.type || '';
  const consultationCode = consultationData?.code || '';

  // Build subtitle: Show countdown timer when consultation is active, otherwise show service info
  const buildSubtitle = () => {
    // When consultation is active, always show the countdown timer
    if (isConsultationActive && !fromHistory) {
      // Show both countdown timer and elapsed duration when available
      return consultationElapsed
        ? `${consultationTime}`
        : consultationTime;
    }

    // When consultation has ended, show the total consultation duration instead of service info
    if (consultationEnded && consultationDuration) {
      return consultationDuration;
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
    if (consultationData?.service?.duration) {
      parts.push(`${consultationData.service.duration} min`);
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
        <Text style={styles.doctorName}>{t('customer_support')}</Text>
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
