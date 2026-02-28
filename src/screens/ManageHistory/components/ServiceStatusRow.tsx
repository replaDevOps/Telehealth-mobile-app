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
  const hasRefundServices = !isConsultation && item.kind === 'appointment' && 
    item.refundServiceCount && item.refundServiceCount > 0;
  const displayStatus = item.kind === 'appointment' ? item.paymentStatus : item.status;

  return (
    <>
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
            {displayStatus}
          </Text>
        </View>
      </View>

      {/* Compact refund indicator shown in the status area for appointments */}
      {hasRefundServices && item.kind === 'appointment' && (
        <Text
          style={{
            fontSize: 12,
            color: '#8e8e93',
            marginTop: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            alignSelf: 'flex-end',
          }}
          numberOfLines={1}
        >
          {`Number of Refund Status: ${item.refundServiceCount}`}
        </Text>
      )}
    </>
  );
};
