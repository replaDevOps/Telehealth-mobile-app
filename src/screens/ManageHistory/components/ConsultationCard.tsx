/* components/history/ConsultationCard.tsx */
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { styles } from '../style';

interface ConsultationItem {
  id: string;
  date: string;
  serviceName: string;
  duration: string;
  type: 'Chat' | 'Video' | 'Audio';
  icon: string;
  doctorName: string;
  doctorAvatar: string;
  clinicName: string;
  price: string;
}

interface ConsultationCardProps {
  item: ConsultationItem;
  onPrescriptionPress: () => void;
  onChatPress: () => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  item,
  onPrescriptionPress,
  onChatPress,
}) => {
  const { t } = useTranslation();

  // Format date from ISO string to readable format (YYYY-MM-DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // Format as "YYYY-MM-DD"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.dateText}>{formatDate(item.date)}</Text>

      <View style={styles.cardContainer}>
        {/* Service Header */}
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <View style={styles.serviceDetails}>
            {item.duration && <><Ionicons name="time-outline" size={14} color={colors.white} />
            <Text style={styles.durationText}>{item.duration}</Text></>}
            <Ionicons name={item.icon as any} size={14} color={colors.white} />
            <Text style={styles.typeText}>{t(item.type)}</Text>
          </View>
        </View>

        {/* Doctor Section */}
        <View style={styles.doctorSection}>
          <Image
            source={{ uri: item.doctorAvatar }}
            style={styles.doctorAvatar}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <Text style={styles.clinicName}>{item.clinicName}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.prescriptionButton}
            onPress={onPrescriptionPress}
          >
            <Text style={styles.prescriptionButtonText}>
              {t('get_prescription')}
            </Text>
          </TouchableOpacity>
          {/* Only show View Chat button for Chat consultations, not Audio or Video */}
          {item.type === 'Chat' && (
            <TouchableOpacity style={styles.viewChatButton} onPress={onChatPress}>
              <Text style={styles.viewChatButtonText}>{t('view_chat')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
