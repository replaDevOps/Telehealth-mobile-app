
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header2 } from '@components/common/Header2';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { DoctorInfo } from '../../../types/chat.types';

interface ChatHeaderProps {
  chatType: 'ai' | 'doctor';
  doctorInfo: DoctorInfo;
  consultationTime: string;
  fromHistory: boolean;
  handleGoBack: () => void;
  handleEndConsultation: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatType,
  doctorInfo,
  consultationTime,
  fromHistory,
  handleGoBack,
  handleEndConsultation,
}) => {
  return chatType === 'ai' ? (
    <Header2 title="Chat" showCart logo />
  ) : (
    <View style={styles.doctorHeaderContainer}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.doctorHeaderCenter}>
        <Text style={styles.doctorName}>{doctorInfo.name}</Text>
        <Text style={styles.consultationTime}>
          {doctorInfo.serviceName || consultationTime}
        </Text>
      </View>

      {!doctorInfo.serviceName && !fromHistory && (
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
