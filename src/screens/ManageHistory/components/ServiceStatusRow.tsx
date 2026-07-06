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
  console.log(item.status)
  const isConsultation = item.kind === 'consultation';

  const serviceValue = isConsultation ? item.serviceName : item.numberOfService;
  const serviceLabel = isConsultation ? t('service') : t('number_of_service');
  const hasRefundServices = !!(!isConsultation && item.kind === 'appointment' &&
    item.refundServiceCount && item.refundServiceCount > 0);

  const isRefunded = !isConsultation && item.kind === 'appointment' && (
    (typeof item.refundStatus === 'string' && /confirm|refunded/i.test(item.refundStatus)) ||
    /^refunded$/i.test(item.status)
  );

  // Only surface the refunded-service count once the refund request has been approved.
  const isRefundApproved = !isConsultation && item.kind === 'appointment' &&
    typeof item.refundStatus === 'string' &&
    /^(approved|confirm|confirmed|success|refunded)$/i.test(item.refundStatus.trim());
  const displayStatus = isRefunded
    ? 'Refunded'
    : item.kind === 'appointment' ? (item as any).paymentStatus || item.status : item.status;
  const displayStatusColor = isRefunded ? '#ef4444' : item.statusColor;

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
          <Text style={[styles.statusValue, { color: displayStatusColor }]}>
            {displayStatus}
          </Text>
        </View>
      </View>

      {/* Refund count is shown only once the refund request has been approved */}
      {hasRefundServices && isRefundApproved && (
        <View style={{ width: '100%', alignItems: 'center', marginTop: 6 }}>
          <Text
            style={{
              fontSize: 12,
              color: '#8e8e93',
              paddingHorizontal: 8,
              paddingVertical: 2,
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {`No of Refunds: ${item.refundServiceCount}`}
          </Text>
        </View>
      )}
    </>
  );
};
