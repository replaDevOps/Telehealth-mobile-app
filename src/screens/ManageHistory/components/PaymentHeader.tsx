/* components/history/PaymentHeader.tsx */
import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { styles } from '../style';
import type { PaymentItem } from './PaymentCard';

const ICON_MAP = {
  Video: 'videocam',
  Chat: 'chatbubble',
  Audio: 'mic',
} as const;

interface PaymentHeaderProps {
  item: PaymentItem;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({ item }) => {
  const { t } = useTranslation();
  const isConsultation = item.kind === 'consultation';
  const isAppointment = item.kind === 'appointment';

  return (
    <View style={styles.paymentHeader}>
      <Text style={styles.paymentId}>
        {item.paymentId}
        {isAppointment && item.clinicLocation && (
          <Text style={styles.paymentType}>
            {' . '}
            {item.status}
          </Text>
        )}
      </Text>

      {isConsultation && item.type && (
        <View style={styles.paymentTypeContainer}>
          <Ionicons name={ICON_MAP[item.type]} size={14} color={colors.white} />
          <Text style={styles.paymentType}>{t(item.type)}</Text>
          {item.duration && (
            <>
              <Ionicons name="time-outline" size={14} color={colors.white} />
              <Text style={styles.paymentType}>{item.duration}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};
