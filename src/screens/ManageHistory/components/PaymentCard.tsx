/* components/history/PaymentCard.tsx */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PaymentHeader } from './PaymentHeader';
import { PaymentDoctorSection } from './PaymentDoctorSection';
import { ServiceStatusRow } from './ServiceStatusRow';
import { styles } from '../style';
import { formatDateLocal } from '../utils/format';
import { formatCurrency } from '@utils';

interface ServiceDetail {
  id: number;
  name: string;
  duration: string;
  price: string;
  category: string;
  categoryBadge: string;
  image: any;
}

interface PaymentConsultationItem {
  id: string;
  kind: 'consultation';
  date: string;
  paymentId: string;
  type?: 'Chat' | 'Video' | 'Audio';
  duration?: string;
  serviceName: string;
  doctorStatus?: string;
  doctorName?: string;
  doctorAvatar?: string;
  clinicName: string;
  clinicLocation?: string;
  price: string;
  status: string;
  statusColor: string;
  refundServiceCount?: number;
}

interface PaymentAppointmentItem {
  id: string;
  kind: 'appointment';
  date: string;
  paymentId: string;
  clinicImg?: boolean;
  clinicImage?: string;
  clinicName: string;
  clinicLocation: string;
  numberOfService: string;
  price: string;
  status: string;
  statusColor: string;
  services: ServiceDetail[];
  refundServiceCount?: number;
  refundServices?: Array<{
    id: number;
    appointmentID: number;
    status: string;
    serviceID: number;
  }>;
  refundStatus?: string;
  refundStatusColor?: string;
}

export type PaymentItem = PaymentConsultationItem | PaymentAppointmentItem;

interface PaymentCardProps {
  item: PaymentItem;
  onViewDetails: (item: PaymentItem) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  item,
  onViewDetails,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <View style={[styles.card, { paddingHorizontal: 0 }]}>
      <Text style={styles.dateText}>{formatDateLocal(item.date)}</Text>

      <View style={styles.cardContainer}>
        <PaymentHeader item={item} />

        <View style={styles.paymentDoctorRow}>
          <PaymentDoctorSection item={item} />
          <Text style={styles.paymentPrice}>{formatCurrency(item.price, i18n.language?.startsWith('ar'))}</Text>
        </View>

        <ServiceStatusRow item={item} />

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => onViewDetails(item)}
        >
          <Text style={styles.viewDetailsButtonText}>{t('view_details')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
