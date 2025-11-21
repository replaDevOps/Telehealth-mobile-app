/* HistoryScreen.tsx */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';

interface PaymentAppointmentItem {
  id: string;
  kind: 'appointment';
  state: string;
  date: string;
  paymentId: string;
  clinicImg?: boolean;
  clinicName: string;
  clinicLocation: string;
  numberOfService: string;
  price: string;
  status: string;
  statusColor: string;
  services: {
    id: number;
    name: string;
    duration: string;
    price: string;
    category: string;
    categoryBadge: string;
    image: any;
  }[];
}

type AppintItem = PaymentAppointmentItem;

export function RefundRequest2({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  /* -------------------------------------------------
   *  MOCK DATA
   * ------------------------------------------------- */
  const AppointHistory: AppintItem[] = [
    {
      id: '1',
      kind: 'appointment',
      state: t('pending'),
      date: '10/02/2025 11:05 am',
      paymentId: 'PAY-001',
      clinicImg: true,
      clinicName: 'Eden Medical Center',
      clinicLocation: 'Makkah, Saudi Arabia',
      numberOfService: '2',
      price: 'SAR 150',
      status: t('completed'),
      statusColor: colors.green,
      services: [
        {
          id: 1,
          name: 'General Consultation',
          duration: '30 min',
          price: 'SAR 75',
          category: 'Consultation',
          categoryBadge: 'Gen',
          image: RecommandImage,
        },
        {
          id: 2,
          name: 'Follow-up',
          duration: '20 min',
          price: 'SAR 75',
          category: 'Consultation',
          categoryBadge: 'FU',
          image: RecommandImage,
        },
      ],
    },
    {
      id: '2',
      kind: 'appointment',
      state: t('scheduled'),

      date: '10/02/2025 11:05 am',
      paymentId: 'PAY-001',
      clinicImg: true,
      clinicName: 'Eden Medical Center',
      clinicLocation: 'Makkah, Saudi Arabia',
      numberOfService: '2',
      price: 'SAR 150',
      status: t('completed'),
      statusColor: colors.green,
      services: [
        {
          id: 1,
          name: 'General Consultation',
          duration: '30 min',
          price: 'SAR 75',
          category: 'Consultation',
          categoryBadge: 'Gen',
          image: RecommandImage,
        },
        {
          id: 2,
          name: 'Follow-up',
          duration: '20 min',
          price: 'SAR 75',
          category: 'Consultation',
          categoryBadge: 'FU',
          image: RecommandImage,
        },
      ],
    },
  ];

  // Simple filter for search
  const appointements = AppointHistory.filter(
    item =>
      item.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clinicLocation.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderAppointCard = (item: AppintItem) => {
    return (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.cardContainer}>
          {/* ---------- Header (ID + location) ---------- */}
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentId}>{item.paymentId}</Text>

            {item.clinicLocation && (
              <View style={styles.paymentTypeContainer}>
                <Text style={styles.paymentType}>{item.state}</Text>
              </View>
            )}
          </View>

          <View style={styles.paymentDoctorRow}>
            <View style={styles.paymentDoctorSection}>
              <View style={styles.doctorAvatar}>
                <Text style={styles.clinicLogo}>{t('clinic_image')}</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.clinicName}</Text>
              </View>
            </View>

            <Text style={styles.paymentPrice}>{item.price}</Text>
          </View>

          <View style={styles.serviceStatusRow}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceLabel}>{t('number_of_service')}</Text>
              <Text style={styles.serviceValue}>{item.numberOfService}</Text>
            </View>

            <View style={styles.statusDivider} />

            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{t('status')}</Text>
              <Text style={[styles.statusValue, { color: item.statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() =>
              navigation.navigate('CardDetails', {
                paymentId: item.paymentId,
                clinicName: item.clinicName,
                image: item.clinicImg ? RecommandImage : undefined,
                clinicLocation: item.clinicLocation,
                status: item.status,
                statusColor: item.statusColor,
                dateTime: item.date,
                price: item.price,
                services: item.services,
                reason:
                  'In a laoreet purus. Integer turpis quam, laoreet id orci nec, ultrices lacinia nunc. Aliquam erat vo',
              })
            }
          >
            <Text style={styles.viewDetailsButtonText}>{t('view_details')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('refund_request')} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_clinic_name_location')}
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {appointements.map(renderAppointCard)}
      </ScrollView>
    </SafeAreaView>
  );
}
