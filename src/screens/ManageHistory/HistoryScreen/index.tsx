/* HistoryScreen.tsx */
import React, { useState } from 'react';
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
import { PipsImage, RecommandImage } from '@assets/images';
import { CONSULTATION_HISTORY, PAYMENT_HISTORY } from '@constants';

type Tab = 'consultation' | 'payment';
type PaymentKind = 'consultation' | 'appointment';

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

interface PaymentConsultationItem {
  id: string;
  kind: 'consultation';
  date: string;
  paymentId: string;
  type?: 'Chat' | 'Video' | 'Audio';
  duration?: string;
  serviceName: string;
  doctorStatus?: string; // present when no doctor accepted
  doctorName?: string;
  doctorAvatar?: string;
  clinicName: string;
  price: string;
  status: string;
  statusColor: string;
}

interface PaymentAppointmentItem {
  id: string;
  kind: 'appointment';
  date: string;
  paymentId: string;
  clinicImg?: boolean; // just a flag – we show a placeholder
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

type PaymentItem = PaymentConsultationItem | PaymentAppointmentItem;

export function HistoryScreen({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<Tab>('consultation');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState<PaymentKind | ''>('');

  /* -------------------------------------------------
   *  DATA
   * ------------------------------------------------- */
  const consultationHistory: ConsultationItem[] = [
    {
      id: '1',
      date: '10/02/2025 11:05 am',
      serviceName: 'Service Name',
      duration: '19 min',
      type: 'Chat',
      icon: 'chatbubble',
      doctorName: 'Doctor Name',
      doctorAvatar: 'https://i.pravatar.cc/100?img=1',
      clinicName: 'Clinic Name',
      price: 'SAR 20',
    },
    {
      id: '2',
      date: '10/02/2025 11:05 am',
      serviceName: 'Service Name',
      duration: '19 min',
      type: 'Audio',
      icon: 'mic',
      doctorName: 'Doctor Name',
      doctorAvatar: 'https://i.pravatar.cc/100?img=2',
      clinicName: 'Clinic Name',
      price: 'SAR 20',
    },
    // add more …
  ];

  /* -------------------------------------------------
   *  CARD RENDERERS
   * ------------------------------------------------- */
  const renderConsultationCard = (item: ConsultationItem) => (
    <View key={item.id} style={styles.card}>
      <Text style={styles.dateText}>{item.date}</Text>

      <View
        style={{
          borderRadius: 8,
          backgroundColor: colors.gray,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Service Header */}
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <View style={styles.serviceDetails}>
            <Ionicons name="time-outline" size={14} color={colors.white} />
            <Text style={styles.durationText}>{item.duration}</Text>
            <Ionicons name={item.icon as any} size={14} color={colors.white} />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>

        {/* Doctor Info */}
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
            onPress={() =>
              navigation.navigate('Clinic', { screen: 'PrescriptionScreen' })
            }
          >
            <Text style={styles.prescriptionButtonText}>Get Prescription</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewChatButton}
            onPress={() =>
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
                  image: RecommandImage, // make sure this is imported correctly
                },
                fromHistory: true,
              })
            }
          >
            <Text style={styles.viewChatButtonText}>View Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPaymentCard = (item: PaymentItem) => {
    const isConsultation = item.kind === 'consultation';
    const isAppointment = item.kind === 'appointment';

    return (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.cardContainer}>
          {/* ---------- Header (ID + type / location) ---------- */}
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentId}>{item.paymentId}</Text>

            {isConsultation && item.type && (
              <View style={styles.paymentTypeContainer}>
                <Ionicons
                  name={
                    item.type === 'Video'
                      ? 'videocam'
                      : item.type === 'Chat'
                      ? 'chatbubble'
                      : 'mic'
                  }
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.paymentType}>{item.type}</Text>

                {item.duration && (
                  <>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={colors.white}
                    />
                    <Text style={styles.paymentType}>{item.duration}</Text>
                  </>
                )}
              </View>
            )}

            {isAppointment && item.clinicLocation && (
              <View style={styles.paymentTypeContainer}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.paymentType}>{item.clinicLocation}</Text>
              </View>
            )}
          </View>
          {/* ---------- Middle row (doctor / no-doctor / clinic) ---------- */}
          <View style={styles.paymentDoctorRow}>
            {/* Consultation – no doctor */}
            {isConsultation && item.doctorStatus ? (
              <View style={styles.noDoctorSection}>
                <View style={styles.noDoctorIcon}>
                  <Foundation name="prohibited" size={18} color="#ef4444" />
                </View>
                <View style={styles.noDoctorInfo}>
                  <Text style={styles.noDoctorText}>{item.doctorStatus}</Text>
                  <Text style={styles.clinicName}>{item.clinicName}</Text>
                </View>
              </View>
            ) : null}

            {/* Consultation – doctor present */}
            {isConsultation && !item.doctorStatus && item.doctorAvatar ? (
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
            ) : null}

            {/* Appointment – clinic image placeholder */}
            {isAppointment && (
              <View style={styles.paymentDoctorSection}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.clinicLogo}>Cli. Img</Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{item.clinicName}</Text>
                </View>
              </View>
            )}

            <Text style={styles.paymentPrice}>{item.price}</Text>
          </View>
          {/* ---------- Service / Number of Service + Status ---------- */}
          <View style={styles.serviceStatusRow}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceLabel}>
                {isConsultation ? 'Service' : 'Number of Service'}
              </Text>
              <Text style={styles.serviceValue} numberOfLines={1}>
                {isConsultation ? item.serviceName : item.numberOfService}
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
          {isAppointment ? (
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                // NEW: pass the whole item (or only the fields you need)
                navigation.navigate('CardDetails', {
                  // ---- common fields ----
                  paymentId: item.paymentId,
                  clinicName: item.clinicName,
                  iamge: item.clinicImg ? RecommandImage : undefined,
                  clinicLocation: item.clinicLocation || '',
                  status: item.status,
                  statusColor: item.statusColor,
                  dateTime: item.date,
                  price: item.price,

                  // ---- consultation only ----
                  ...(item.kind === 'consultation' && {
                    consultationType: item.type,
                    duration: item.duration,
                    doctorName: item.doctorName,
                    doctorAvatar: item.doctorAvatar,
                    serviceName: item.serviceName,
                  }),

                  // ---- appointment only ----
                  ...(item.kind === 'appointment' && {
                    services: item.services || [],
                  }),
                });
              }}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
          ) : (
            // same logic for consultation cards (the same block as above)
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                navigation.navigate('CardDetails', {
                  paymentId: item.paymentId,
                  clinicName: item.clinicName,
                  clinicLocation: item.clinicLocation || '',
                  status: item.status,
                  statusColor: item.statusColor,
                  dateTime: item.date,
                  price: item.price,
                  consultationType: item.type,
                  duration: item.duration,
                  doctorName: item.doctorName,
                  doctorAvatar: item.doctorAvatar,
                  serviceName: item.serviceName,
                });
              }}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* -------------------------------------------------
   *  FILTERED PAYMENT LIST
   * ------------------------------------------------- */
  const filteredPayments = type
    ? PAYMENT_HISTORY.filter(i => i.kind === type)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title="History" />

      {/* Search */}
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
        <TouchableOpacity
          style={[styles.tab, activeTab === 'consultation' && styles.activeTab]}
          onPress={() => setActiveTab('consultation')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'consultation' && styles.activeTabText,
            ]}
          >
            Consultation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
          onPress={() => setActiveTab('payment')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'payment' && styles.activeTabText,
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- CONSULTATION TAB ---- */}
        {activeTab === 'consultation' && (
          <View style={styles.content}>
            {CONSULTATION_HISTORY.map(renderConsultationCard)}
          </View>
        )}

        {/* ---- PAYMENT TAB ---- */}
        {activeTab === 'payment' && (
          <View style={styles.content}>
            <CustomDropdown
              label="Type"
              placeholder="Select Type here"
              value={type}
              onValueChange={(v: any) => setType(v)}
              options={[
                { label: 'Consultation', value: 'consultation' },
                { label: 'Appointment', value: 'appointment' },
              ]}
            />

            {/* ONE CARD FOR BOTH KINDS */}
            {filteredPayments.map(renderPaymentCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
