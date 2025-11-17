/* HistoryScreen.tsx */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';

import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { CustomDropdown } from '@components/common/CustomDropdwon';
import { RecommandImage } from '@assets/images';
import { CONSULTATION_HISTORY, PAYMENT_HISTORY } from '@constants';

/* ============================================
 * TYPE DEFINITIONS
 * ============================================ */

type Tab = 'consultation' | 'payment';
type PaymentKind = 'consultation' | 'appointment';
type ConsultationType = 'Chat' | 'Video' | 'Audio';

interface ConsultationItem {
  id: string;
  date: string;
  serviceName: string;
  duration: string;
  type: ConsultationType;
  icon: string;
  doctorName: string;
  doctorAvatar: string;
  clinicName: string;
  price: string;
}

interface PaymentConsultationItem {
  id: string;
  kind: 'consultation';
  date: string;
  paymentId: string;
  type?: ConsultationType;
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
}

interface PaymentAppointmentItem {
  id: string;
  kind: 'appointment';
  date: string;
  paymentId: string;
  clinicImg?: boolean;
  clinicName: string;
  clinicLocation: string;
  numberOfService: string;
  price: string;
  status: string;
  statusColor: string;
  services: ServiceDetail[];
}

interface ServiceDetail {
  id: number;
  name: string;
  duration: string;
  price: string;
  category: string;
  categoryBadge: string;
  image: any;
}

type PaymentItem = PaymentConsultationItem | PaymentAppointmentItem;

interface HistoryScreenProps {
  navigation: any;
}

interface DropdownOption {
  label: string;
  value: PaymentKind;
}

/* ============================================
 * CONSTANTS
 * ============================================ */

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { label: 'Consultation', value: 'consultation' },
  { label: 'Appointment', value: 'appointment' },
];

const ICON_MAP: Record<ConsultationType, string> = {
  Video: 'videocam',
  Chat: 'chatbubble',
  Audio: 'mic',
};

/* ============================================
 * MAIN COMPONENT
 * ============================================ */

export function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('consultation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentKind | ''>(
    'consultation',
  );

  /* ============================================
   * FILTERED DATA
   * ============================================ */

  const filteredPayments = useMemo(() => {
    if (!selectedType) return [];
    return PAYMENT_HISTORY.filter(item => item.kind === selectedType);
  }, [selectedType]);

  /* ============================================
   * NAVIGATION HANDLERS
   * ============================================ */

  const handleNavigateToPrescription = useCallback(() => {
    navigation.navigate('PrescriptionScreen');
  }, [navigation]);

  const handleNavigateToChat = useCallback(() => {
    navigation.navigate('ChatScreen', {
      chatType: 'doctor',
      doctorInfo: {
        id: 'doctor_1',
        name: 'Dr. Sultan Khan',
        avatar: 'https://i.pravatar.cc/150?img=12',
        serviceName: 'Acne Itching Treatment',
      },
      clinicInfo: {
        name: 'Eden Medical Center',
        location: 'Makkah, Saudi Arabia, 2.2km',
        image: RecommandImage,
      },
      fromHistory: true,
    });
  }, [navigation]);

  const handleNavigateToCardDetails = useCallback(
    (item: PaymentItem) => {
      const commonParams = {
        paymentId: item.paymentId,
        clinicName: item.clinicName,
        clinicLocation: item.clinicLocation || '',
        status: item.status,
        statusColor: item.statusColor,
        dateTime: item.date,
        price: item.price,
      };

      if (item.kind === 'consultation') {
        navigation.navigate('CardDetails', {
          ...commonParams,
          consultationType: item.type,
          duration: item.duration,
          doctorName: item.doctorName,
          doctorAvatar: item.doctorAvatar,
          serviceName: item.serviceName,
        });
      } else {
        navigation.navigate('CardDetails', {
          ...commonParams,
          image: item.clinicImg ? RecommandImage : undefined,
          services: item.services || [],
        });
      }
    },
    [navigation],
  );

  /* ============================================
   * RENDER METHODS - CONSULTATION
   * ============================================ */

  const renderServiceHeader = useCallback(
    (item: ConsultationItem) => (
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <View style={styles.serviceDetails}>
          <Ionicons name="time-outline" size={14} color={colors.white} />
          <Text style={styles.durationText}>{item.duration}</Text>
          <Ionicons name={item.icon as any} size={14} color={colors.white} />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
    ),
    [],
  );

  const renderDoctorSection = useCallback(
    (item: ConsultationItem) => (
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
    ),
    [],
  );

  const renderConsultationActions = useCallback(
    () => (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.prescriptionButton}
          onPress={handleNavigateToPrescription}
        >
          <Text style={styles.prescriptionButtonText}>Get Prescription</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewChatButton}
          onPress={handleNavigateToChat}
        >
          <Text style={styles.viewChatButtonText}>View Chat</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleNavigateToPrescription, handleNavigateToChat],
  );

  const renderConsultationCard = useCallback(
    (item: ConsultationItem) => (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.cardContainer}>
          {renderServiceHeader(item)}
          {renderDoctorSection(item)}
          {renderConsultationActions()}
        </View>
      </View>
    ),
    [renderServiceHeader, renderDoctorSection, renderConsultationActions],
  );

  /* ============================================
   * RENDER METHODS - PAYMENT
   * ============================================ */

  const renderPaymentHeader = useCallback((item: PaymentItem) => {
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
            <Ionicons
              name={ICON_MAP[item.type]}
              size={14}
              color={colors.white}
            />
            <Text style={styles.paymentType}>{item.type}</Text>
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
  }, []);

  const renderPaymentDoctorSection = useCallback((item: PaymentItem) => {
    if (item.kind === 'consultation') {
      if (item.doctorStatus) {
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

      if (item.doctorAvatar) {
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
    }

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
  }, []);

  const renderServiceStatusRow = useCallback((item: PaymentItem) => {
    const isConsultation = item.kind === 'consultation';
    const serviceValue = isConsultation
      ? item.serviceName
      : item.numberOfService;
    const serviceLabel = isConsultation ? 'Service' : 'Number of Service';

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
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: item.statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderPaymentCard = useCallback(
    (item: PaymentItem) => (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.cardContainer}>
          {renderPaymentHeader(item)}

          <View style={styles.paymentDoctorRow}>
            {renderPaymentDoctorSection(item)}
            <Text style={styles.paymentPrice}>{item.price}</Text>
          </View>

          {renderServiceStatusRow(item)}

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleNavigateToCardDetails(item)}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      renderPaymentHeader,
      renderPaymentDoctorSection,
      renderServiceStatusRow,
      handleNavigateToCardDetails,
    ],
  );

  /* ============================================
   * TAB RENDERERS
   * ============================================ */

  const renderTabButton = useCallback(
    (tab: Tab, label: string) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeTab === tab && styles.activeTab]}
        onPress={() => setActiveTab(tab)}
      >
        <Text
          style={[styles.tabText, activeTab === tab && styles.activeTabText]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [activeTab],
  );

  /* ============================================
   * MAIN RENDER
   * ============================================ */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title="History" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor or clinic name..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('consultation', 'Consultation')}
        {renderTabButton('payment', 'Payment')}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'consultation' && (
          <View style={styles.content}>
            {CONSULTATION_HISTORY.map(renderConsultationCard)}
          </View>
        )}

        {activeTab === 'payment' && (
          <View style={styles.content}>
            <CustomDropdown
              label="Type"
              placeholder="Select Type here"
              value={selectedType}
              onValueChange={setSelectedType}
              options={DROPDOWN_OPTIONS}
            />

            {filteredPayments.map(renderPaymentCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
