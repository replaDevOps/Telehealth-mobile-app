/* components/history/PaymentDoctorSection.tsx */
import React from 'react';
import { View, Text, Image } from 'react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import { useTranslation } from 'react-i18next';
import { styles } from '../style';
import type { PaymentItem } from './PaymentCard';

/** First and last word initials from clinic name, e.g. "Skin Care Clinic" -> "SC". */
function getClinicInitials(name: string | undefined): string {
  if (!name || typeof name !== 'string') return '';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  const first = words[0].charAt(0).toUpperCase();
  const last = words[words.length - 1].charAt(0).toUpperCase();
  return first === last ? first : `${first}${last}`;
}

interface PaymentDoctorSectionProps {
  item: PaymentItem;
}

export const PaymentDoctorSection: React.FC<PaymentDoctorSectionProps> = ({
  item,
}) => {
  const { t } = useTranslation();

  // Consultation with no doctor assigned
  if (item.kind === 'consultation' && !item.doctorName) {
    return (
      <View style={styles.noDoctorSection}>
        <View style={styles.noDoctorIcon}>
          <Foundation name="prohibited" size={18} color="#ef4444" />
        </View>
        <View style={styles.noDoctorInfo}>
          <Text style={styles.noDoctorText}>
            {t('no_agent_accepted')}
          </Text>
          <Text style={styles.clinicName}>{item.clinicName}</Text>
        </View>
      </View>
    );
  }

  // Consultation with doctor assigned
  if (item.kind === 'consultation' && item.doctorName) {
    return (
      <View style={styles.paymentDoctorSection}>
        {item.doctorAvatar ? (
          <Image
            source={{ uri: item.doctorAvatar }}
            style={styles.doctorAvatar}
          />
        ) : (
          <View style={[styles.doctorAvatar, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6b7280' }}>
              {item.doctorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.clinicName}>{item.clinicName}</Text>
        </View>
      </View>
    );
  }

  // Appointment: clinic logo, or initials avatar, or empty box; show clinic name and location
  if (item.kind === 'appointment') {
    const hasImage = !!item.clinicImage && typeof item.clinicImage === 'string' && item.clinicImage.trim().length > 0;
    const initials = getClinicInitials(item.clinicName);

    return (
      <View style={styles.paymentDoctorSection}>
        <View style={styles.doctorAvatar}>
          {hasImage ? (
            <Image
              source={{ uri: item.clinicImage }}
              style={styles.clinicAvatarImage}
            />
          ) : initials ? (
            <Text style={styles.clinicLogo}>{initials}</Text>
          ) : null}
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.clinicName || '—'}</Text>
          {item.clinicLocation ? (
            <Text style={styles.clinicName} numberOfLines={2}>{item.clinicLocation}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return null;
};
