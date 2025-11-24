/* components/history/ServiceStatusRow.tsx */
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../style';
import type { PaymentItem } from './PaymentCard';

interface ServiceStatusRowProps {
  item: PaymentItem;
}

export const ServiceStatusRow: React.FC<ServiceStatusRowProps> = ({ item }) => {
  const { t } = useTranslation();
  const isConsultation = item.kind === 'consultation';

  const serviceValue = isConsultation ? item.serviceName : item.numberOfService;
  const serviceLabel = isConsultation ? t('service') : t('number_of_service');

  return (
    <View style={styles.serviceStatusRow}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceLabel}>{serviceLabel}</Text>
        <Text style={styles.serviceValue} numberOfLines={1}>
          {serviceValue}
        </Text>
      </View>

      <View style={styles.statusDivider} />

      <View style={styles.statusInfo}>
        <Text style={styles.statusLabel}>{t('status')}</Text>
        <Text style={[styles.statusValue, { color: item.statusColor }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );
};
