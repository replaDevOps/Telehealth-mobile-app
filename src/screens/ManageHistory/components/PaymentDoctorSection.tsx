/* components/history/PaymentDoctorSection.tsx */
import React from 'react';
import { View, Text, Image } from 'react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import { styles } from '../style';
import type { PaymentItem } from './PaymentCard';

interface PaymentDoctorSectionProps {
  item: PaymentItem;
}

export const PaymentDoctorSection: React.FC<PaymentDoctorSectionProps> = ({
  item,
}) => {
  // Consultation with doctor status (no doctor assigned)
  if (item.kind === 'consultation' && item.doctorStatus) {
    return (
      <View style={styles.noDoctorSection}>
        <View style={styles.noDoctorIcon}>
          <Foundation name="prohibited" size={18} color="#ef4444" />
        </View>
        <View style={styles.noDoctorInfo}>
          <Text style={styles.noDoctorText}>{item.doctorStatus}</Text>
          <Text style={styles.clinicName}>{item.clinicName}</Text>
        </View>
      </View>
    );
  }

  // Consultation with doctor assigned
  if (item.kind === 'consultation' && item.doctorAvatar) {
    return (
      <View style={styles.paymentDoctorSection}>
        <Image
          source={{ uri: item.doctorAvatar }}
          style={styles.doctorAvatar}
        />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.clinicName}>{item.clinicName}</Text>
        </View>
      </View>
    );
  }

  // Appointment
  if (item.kind === 'appointment') {
    return (
      <View style={styles.paymentDoctorSection}>
        <View style={styles.doctorAvatar}>
          <Text style={styles.clinicLogo}>Cli. Img</Text>
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.clinicName}</Text>
        </View>
      </View>
    );
  }

  return null;
};
