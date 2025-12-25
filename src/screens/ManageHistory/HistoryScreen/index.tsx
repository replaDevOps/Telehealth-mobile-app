/* HistoryScreen.tsx - Refactored */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, ScrollView, StatusBar, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import { Header2 } from '@components/common/Header2';
import { CustomDropdown } from '@components/common/CustomDropdwon';

import { RecommandImage } from '@assets/images';
import { CONSULTATION_HISTORY, PAYMENT_HISTORY } from '@constants';
import { styles } from '../style';

import type {
  Tab,
  PaymentKind,
  PaymentItem,
  ConsultationItem,
  DropdownOption,
} from '../types/history.types';
import { SearchBar } from 'react-native-screens';
import { ConsultationCard, PaymentCard, HistoryTabs } from '../components';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import Toast from 'toastify-react-native';
import { colors } from '../../../styles/colors';

const DROPDOWN_OPTIONS: DropdownOption[] = [
  { label: 'Consultation', value: 'consultation' },
  { label: 'Appointment', value: 'appointment' },
];

export function HistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('consultation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentKind | ''>(
    'consultation',
  );
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Fetch consultations from API
  const fetchConsultations = useCallback(async () => {
    if (activeTab !== 'consultation') return;

    setLoadingConsultations(true);
    try {
      const response = await apiClient.get(API.HISTORY.GET_CONSULTATIONS, {
        params: {
          name: searchQuery || '',
        },
      });

      console.log('Consultations response:', response.data);

      if (response.data?.success !== false && response.data?.data) {
        const apiConsultations = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Map API response to ConsultationItem format
        const mappedConsultations: ConsultationItem[] = apiConsultations.map((consultation: any) => {
          // Map consultation type to icon
          const typeMap: Record<string, { type: ConsultationItem['type']; icon: string }> = {
            'Chat': { type: 'Chat', icon: 'chatbubble-outline' },
            'Video': { type: 'Video', icon: 'videocam-outline' },
            'Audio': { type: 'Audio', icon: 'mic-outline' },
          };

          const consultationType = typeMap[consultation.type] || typeMap['Chat'];

          return {
            id: String(consultation.id),
            date: consultation.date || consultation.created_at || '',
            serviceName: consultation.service?.name || consultation.serviceName || '',
            duration: consultation.service?.duration 
              ? `${consultation.service.duration} min`
              : consultation.duration || '',
            type: consultationType.type,
            icon: consultationType.icon,
            doctorName: consultation.doctor?.name || consultation.doctorName || '',
            doctorAvatar: consultation.doctor?.image || consultation.doctorAvatar || '',
            clinicName: consultation.clinic?.name || consultation.clinicName || '',
            price: consultation.price || '0',
            // Store original data for navigation
            consultationID: consultation.id,
            doctorID: consultation.doctorID || consultation.doctor?.id,
            clinicID: consultation.clinicID || consultation.clinic?.id,
            clinicInfo: consultation.clinic,
            doctorInfo: consultation.doctor,
            serviceInfo: consultation.service,
          } as ConsultationItem & { 
            consultationID: number; 
            doctorID?: number;
            clinicID?: number;
            clinicInfo?: any;
            doctorInfo?: any;
            serviceInfo?: any;
          };
        });

        setConsultations(mappedConsultations);
      } else {
        setConsultations([]);
      }
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      Toast.error(error?.message || t('failed_to_load_consultations') || 'Failed to load consultations');
      setConsultations([]);
    } finally {
      setLoadingConsultations(false);
    }
  }, [activeTab, searchQuery, t]);

  // Fetch payment history from API
  const fetchPayments = useCallback(async () => {
    if (activeTab !== 'payment') return;

    setLoadingPayments(true);
    try {
      // Determine which API to call based on selectedType
      const endpoint = selectedType === 'appointment'
        ? API.HISTORY.GET_APPOINTMENT_PAYMENTS
        : API.HISTORY.GET_CONSULTATION_PAYMENTS;

      const response = await apiClient.get(endpoint, {
        params: {
          name: searchQuery || '',
        },
      });

      console.log('Payments response:', response.data);

      if (response.data?.success !== false && response.data?.data) {
        const apiPayments = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Map API response to PaymentItem format
        const mappedPayments: PaymentItem[] = apiPayments.map((payment: any) => {
          if (selectedType === 'consultation') {
            // Map consultation payment
            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'consultation' as const,
              date: payment.date || payment.created_at || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              type: payment.type || payment.consultationType,
              duration: payment.duration || payment.service?.duration || '',
              serviceName: payment.serviceName || payment.service?.name || '',
              doctorStatus: payment.doctorStatus || payment.status,
              doctorName: payment.doctorName || payment.doctor?.name || '',
              doctorAvatar: payment.doctorAvatar || payment.doctor?.image || '',
              clinicName: payment.clinicName || payment.clinic?.name || '',
              clinicLocation: payment.clinicLocation || payment.clinic?.location || '',
              price: payment.price || payment.amount || '0',
              status: payment.status || 'Completed',
              statusColor: payment.status === 'Completed' || payment.status === 'Success' 
                ? colors.green 
                : payment.status === 'Pending' 
                ? colors.yellow 
                : colors.red,
            } as PaymentConsultationItem;
          } else {
            // Map appointment payment
            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'appointment' as const,
              date: payment.date || payment.created_at || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              clinicImg: !!payment.clinicImage || !!payment.clinic?.image,
              clinicName: payment.clinicName || payment.clinic?.name || '',
              clinicLocation: payment.clinicLocation || payment.clinic?.location || '',
              numberOfService: String(payment.services?.length || payment.numberOfServices || 0),
              price: payment.price || payment.amount || '0',
              status: payment.status || 'Completed',
              statusColor: payment.status === 'Completed' || payment.status === 'Success' 
                ? colors.green 
                : payment.status === 'Pending' 
                ? colors.yellow 
                : colors.red,
              services: payment.services?.map((service: any, index: number) => ({
                id: service.id || index,
                name: service.name || service.serviceName || '',
                duration: service.duration || '',
                price: service.price || '0',
                category: service.category || service.group?.name || '',
                categoryBadge: service.category || service.group?.name || '',
                image: service.image ? { uri: service.image } : RecommandImage,
              })) || [],
            } as PaymentAppointmentItem;
          }
        });

        setPayments(mappedPayments);
      } else {
        setPayments([]);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      Toast.error(error?.message || t('failed_to_load_payments') || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [activeTab, selectedType, searchQuery, t]);

  // Fetch consultations when tab changes or search query changes
  useEffect(() => {
    if (activeTab === 'consultation') {
      fetchConsultations();
    } else if (activeTab === 'payment' && selectedType) {
      fetchPayments();
    }
  }, [activeTab, searchQuery, selectedType]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'consultation') {
        fetchConsultations();
      } else if (activeTab === 'payment' && selectedType) {
        fetchPayments();
      }
    }, [activeTab, selectedType, fetchConsultations, fetchPayments])
  );

  const filteredPayments = useMemo(() => {
    if (!selectedType) return [];
    // Use API data if available, otherwise fallback to hardcoded data
    if (payments.length > 0) {
      return payments.filter(item => item.kind === selectedType);
    }
    return PAYMENT_HISTORY.filter(item => item.kind === selectedType);
  }, [selectedType, payments]);

  const handleNavigateToPrescription = useCallback((consultationID?: number) => {
    navigation.navigate('PrescriptionScreen', {
      consultationID: consultationID,
      fromHistory: true,
    });
  }, [navigation]);

  const handleNavigateToChat = useCallback((item: ConsultationItem & { consultationID?: number; doctorID?: number; clinicInfo?: any; doctorInfo?: any }) => {
    navigation.navigate('ChatScreen', {
      chatType: 'doctor',
      consultationID: item.consultationID,
      recipientID: item.doctorID,
      doctorInfo: {
        id: String(item.doctorID || ''),
        name: item.doctorName,
        avatar: item.doctorAvatar ? { uri: item.doctorAvatar } : 'https://i.pravatar.cc/150?img=12',
        specialization: item.doctorInfo?.specialization,
      },
      clinicInfo: {
        name: item.clinicName,
        location: item.clinicInfo?.location || '',
        image: item.clinicInfo?.image ? { uri: item.clinicInfo.image } : RecommandImage,
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

  const renderConsultationCard = useCallback(
    (item: ConsultationItem & { consultationID?: number }) => (
      <ConsultationCard
        key={item.id}
        item={item}
        onPrescriptionPress={() => handleNavigateToPrescription(item.consultationID)}
        onChatPress={() => handleNavigateToChat(item)}
      />
    ),
    [handleNavigateToPrescription, handleNavigateToChat],
  );

  const renderPaymentCard = useCallback(
    (item: PaymentItem) => (
      <PaymentCard
        key={item.id}
        item={item}
        onViewDetails={handleNavigateToCardDetails}
      />
    ),
    [handleNavigateToCardDetails],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('history')} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'consultation' && (
          <View style={styles.content}>
            {loadingConsultations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
              </View>
            ) : consultations.length > 0 ? (
              consultations.map(renderConsultationCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_consultations_found') || 'No consultations found'}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'payment' && (
          <View style={styles.content}>
            <CustomDropdown
              label={t('type')}
              placeholder={t('select_type_here')}
              value={selectedType}
              onValueChange={setSelectedType}
              options={DROPDOWN_OPTIONS.map(option => ({
                ...option,
                label: t(option.label.toLowerCase()),
              }))}
            />

            {loadingPayments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
              </View>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map(renderPaymentCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_payments_found') || 'No payments found'}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
