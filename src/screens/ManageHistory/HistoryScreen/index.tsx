/* HistoryScreen.tsx - Refactored */
import React, { useState, useCallback, useEffect } from 'react';
import { View, StatusBar, ActivityIndicator, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import { Header2 } from '@components/common/Header2';
import { CustomDropdown } from '@components/common/CustomDropdwon';

import { RecommandImage } from '@assets/images';
import { styles } from '../style';

import type {
  Tab,
  PaymentKind,
  PaymentItem,
  PaymentConsultationItem,
  PaymentAppointmentItem,
  ConsultationItem,
  DropdownOption,
} from '../types/history.types';
import { ConsultationCard, PaymentCard, HistoryTabs, SearchBar } from '../components';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { capitalizeWords } from '../utils/format';
import { Toast } from 'toastify-react-native';
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
    'appointment',
  );
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [loadingMoreConsultations, setLoadingMoreConsultations] = useState(false);
  const [consultationsPage, setConsultationsPage] = useState(1);
  const [hasMoreConsultations, setHasMoreConsultations] = useState(true);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingMorePayments, setLoadingMorePayments] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [hasMorePayments, setHasMorePayments] = useState(true);
  const [refreshingConsultations, setRefreshingConsultations] = useState(false);
  const [refreshingPayments, setRefreshingPayments] = useState(false);
  const recordsPerPage = 10;

  // Fetch consultations from API
  const fetchConsultations = useCallback(async (pageNo: number = 1, append: boolean = false) => {
    console.log('fetchConsultations called', { pageNo, append, activeTab, searchQuery });
    if (activeTab !== 'consultation') return;

    if (append) {
      setLoadingMoreConsultations(true);
    } else {
      setLoadingConsultations(true);
      setConsultationsPage(1);
      setHasMoreConsultations(true);
    }
    try {
      const response = await apiClient.get(API.HISTORY.GET_CONSULTATIONS, {
        params: {
          name: searchQuery || '',
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });
      console.log('API.GET_CONSULTATIONS request params:', { name: searchQuery, pageNo });

      console.log('Consultations response:', response.data);

      const responseData = response.data;

      // Extract data array
      let apiConsultations: any[] = [];
      if (Array.isArray(responseData)) {
        apiConsultations = responseData;
      } else if (Array.isArray(responseData?.data)) {
        apiConsultations = responseData.data;
      }
      console.log('apiConsultations', apiConsultations);

      // Check if there's more data using nextPageUrl from backend
      const hasMoreData = !!(responseData?.nextPageUrl);
      setHasMoreConsultations(hasMoreData);

      if (responseData?.success !== false && apiConsultations.length > 0) {
        // Map API response to ConsultationItem format
        const mappedConsultations: ConsultationItem[] = apiConsultations.map((consultation: any) => {
          // Map consultation type to icon
          const typeMap: Record<string, { type: ConsultationItem['type']; icon: string }> = {
            'Chat': { type: 'Chat', icon: 'chatbubble-outline' },
            'Video': { type: 'Video', icon: 'videocam-outline' },
            'Audio': { type: 'Audio', icon: 'mic-outline' },
          };

          const consultationType = typeMap[consultation.type] || typeMap['Chat'];

          const clinicData = consultation.clinic || {};
          const doctorData = consultation.doctor || {};
          const serviceData = consultation.service || {};
          // Normalize clinic info so all consumers get a consistent shape
          const normalizedClinicInfo = {
            id: clinicData.id || consultation.clinicID || null,
            name: clinicData.name || clinicData.clinicName || consultation.clinicName || '',
            clinicName: clinicData.clinicName || clinicData.name || consultation.clinicName || '',
            location: clinicData.location || clinicData.details?.address || '',
            image: clinicData.image || clinicData.logo || clinicData.coverImage || undefined,
          };

          return {
            id: String(consultation.id),
            date: consultation.created_at || '',
            serviceName: capitalizeWords(serviceData.name || consultation.serviceName || ''),
            duration: consultation.duration || '',
            type: consultationType.type,
            icon: consultationType.icon,
            doctorName: doctorData.name ? t('customer_support') : t('no_agent_accepted'),
            doctorAvatar: doctorData.image || consultation.doctorAvatar || '',
            clinicName: normalizedClinicInfo.clinicName || '',
            price: consultation.price || '0',
            // Store original + normalized data for navigation
            consultationID: consultation.id,
            doctorID: consultation.doctorID || consultation.doctor?.id,
            clinicID: consultation.clinicID || consultation.clinic?.id,
            clinicInfo: normalizedClinicInfo,
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

        // Check if there's more data
        setHasMoreConsultations(mappedConsultations.length === recordsPerPage);

        if (append) {
          setConsultations(prev => [...prev, ...mappedConsultations]);
        } else {
          setConsultations(mappedConsultations);
        }

        if (mappedConsultations.length > 0) {
          setConsultationsPage(pageNo);
        }
      } else {
        if (!append) {
          setConsultations([]);
        }
        setHasMoreConsultations(false);
      }
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
      Toast.error(error?.message || t('failed_to_load_consultations') || 'Failed to load consultations');
      if (!append) {
        setConsultations([]);
      }
    } finally {
      setLoadingConsultations(false);
      setLoadingMoreConsultations(false);
      setRefreshingConsultations(false);
    }
  }, [activeTab, searchQuery, t]);

  const loadMoreConsultations = useCallback(() => {
    if (!loadingMoreConsultations && hasMoreConsultations && !loadingConsultations) {
      fetchConsultations(consultationsPage + 1, true);
    }
  }, [loadingMoreConsultations, hasMoreConsultations, loadingConsultations, consultationsPage, fetchConsultations]);

  // Fetch payment history from API
  const fetchPayments = useCallback(async (pageNo: number = 1, append: boolean = false) => {
    console.log('fetchPayments called', { pageNo, append, activeTab, selectedType, searchQuery });
    if (activeTab !== 'payment') return;

    if (append) {
      setLoadingMorePayments(true);
    } else {
      setLoadingPayments(true);
      setPaymentsPage(1);
      setHasMorePayments(true);
    }
    try {
      // Determine which API to call based on selectedType
      const endpoint = selectedType === 'appointment'
        ? API.HISTORY.GET_APPOINTMENT_PAYMENTS
        : API.HISTORY.GET_CONSULTATION_PAYMENTS;
      console.log('endpoint', endpoint);

      const response = await apiClient.get(endpoint, {
        params: {
          name: searchQuery || '',
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });
      console.log('API.GET_PAYMENTS request', { endpoint, params: { name: searchQuery, pageNo } });

      console.log('Payments response:', response.data);

      const responseData = response.data;

      // Extract data array
      let apiPayments: any[] = [];
      if (Array.isArray(responseData)) {
        apiPayments = responseData;
      } else if (Array.isArray(responseData?.data)) {
        apiPayments = responseData.data;
      }

      // Check if there's more data using nextPageUrl from backend
      const hasMoreData = !!(responseData?.nextPageUrl);
      setHasMorePayments(hasMoreData);

      if (responseData?.success !== false && apiPayments.length > 0) {
        // Map API response to PaymentItem format
        const mappedPayments: PaymentItem[] = apiPayments.map((payment: any) => {
          if (selectedType === 'consultation') {
            // Map consultation payment
            const clinicData = payment.clinic || {};
            const doctorData = payment.doctor || {};
            const serviceData = payment.service || {};
            // console.log('payment', payment);
            const rawType = payment.type || payment.consultationType;
            const normalized = rawType && typeof rawType === 'string'
              ? rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()
              : '';
            const validTypes = ['Chat', 'Video', 'Audio'];
            const normalizedType = validTypes.includes(normalized) ? normalized as 'Chat' | 'Video' | 'Audio' : undefined;
            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'consultation' as const,
              date: payment.date || payment.created_at || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              type: normalizedType,
              duration: payment.duration || '',
              serviceName: capitalizeWords(payment.serviceName || serviceData.name || ''),
              doctorStatus: payment.doctorStatus || payment.status,
              doctorName: doctorData.name ? t('customer_support') : t('no_agent_accepted'),
              doctorAvatar: payment.doctorAvatar || doctorData.image || '',
              clinicName: payment.clinicName || clinicData.clinicName || clinicData.name || '',
              clinicLocation: payment.clinicLocation || clinicData.location || '',
              price: payment.transaction?.amount || payment.price || payment.amount || '0',
              status: payment.status || 'Completed',
              statusColor: payment.status === 'Completed' || payment.status === 'Success'
                ? colors.green
                : payment.status === 'Pending'
                  ? colors.yellow
                  : colors.red,
              refundServiceCount: payment.refundServiceCount || 0,
            } as PaymentConsultationItem;
          } else {
            // Map appointment payment (API: clinic.details.logo, clinic.details.address, city, district)
            const clinicData = payment.clinic || {};
            const clinicDetails = clinicData.details || {};
            const services = payment.services || [];
            const appointmentServices = payment.appointment_services || [];

            const clinicLogo = clinicDetails.logo || clinicDetails.coverImage || clinicData.logo || clinicData.coverImage || clinicData.image || payment.clinicImage || '';
            const locationParts = [
              clinicDetails.address,
              // clinicDetails.city,
              // clinicDetails.district,
            ].filter(Boolean);
            const clinicLocationStr = locationParts.length > 0
              ? locationParts.join(', ')
              : (payment.clinicLocation || clinicData.location || '');

            // Calculate refund status
            const refundServices = payment.refundServices || [];
            let refundStatus = '';
            let refundStatusColor = colors.secondaryText;

            if (refundServices.length > 0) {
              // Check if any service has "Pending" status
              const hasPending = refundServices.some((rs: any) => rs.status === 'Pending');

              if (hasPending) {
                refundStatus = 'Pending';
                refundStatusColor = colors.yellow;
              } else {
                // Check if all have the same status
                const statuses = refundServices.map((rs: any) => rs.status);
                const uniqueStatuses = [...new Set(statuses)];

                if (uniqueStatuses.length === 1) {
                  refundStatus = uniqueStatuses[0];
                  // Set color based on status
                  if (refundStatus === 'Booked' || refundStatus === 'Completed' || refundStatus === 'Success') {
                    refundStatusColor = colors.green;
                  } else if (refundStatus === 'Refund') {
                    refundStatusColor = colors.red;
                  } else {
                    refundStatusColor = colors.yellow;
                  }
                } else {
                  refundStatus = 'Mixed';
                  refundStatusColor = colors.secondaryText;
                }
              }
            }

            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'appointment' as const,
              date: payment.created_at || payment.requestDate || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              paymentStatus: payment.transaction.status || '',
              clinicImg: !!clinicLogo || !!clinicData.image,
              clinicImage: clinicLogo,
              clinicName: payment.clinicName || clinicData.clinicName || clinicDetails.businessName || clinicData.name || '',
              clinicLocation: clinicLocationStr,
              numberOfService: String(appointmentServices.length || services.length || payment.serviceCount || 0),
              price: payment.transaction?.amount || payment.price || payment.amount || '0',
              status: payment.status || 'Completed',
              statusColor: payment.transaction.status === 'Paid' || payment.status === 'Completed' || payment.status === 'Success'
                ? colors.green
                : payment.status === 'Pending'
                  ? colors.yellow
                  : colors.red,
              refundServiceCount: payment.refundServiceCount || 0,
              refundServices: refundServices,
              refundStatus: refundStatus,
              refundStatusColor: refundStatusColor,
              services: services.map((service: any, index: number) => {
                const serviceGroup = service.group || {};
                const categoryRaw = service.category || serviceGroup.name || '';
                const nameRaw = service.name || service.serviceName || '';
                return {
                  id: service.id || index,
                  name: capitalizeWords(nameRaw),
                  duration: service.duration || '',
                  price: service.price || '0',
                  category: capitalizeWords(categoryRaw),
                  categoryBadge: capitalizeWords(categoryRaw),
                  image: service.image ? { uri: service.image } : RecommandImage,
                };
              }) || [],
            } as PaymentAppointmentItem;
          }
        });

        if (append) {
          setPayments(prev => [...prev, ...mappedPayments]);
        } else {
          setPayments(mappedPayments);
        }

        // Update current page from backend response
        if (responseData?.currentPage) {
          setPaymentsPage(responseData.currentPage);
        } else if (mappedPayments.length > 0) {
          setPaymentsPage(pageNo);
        }
      } else {
        if (!append) {
          setPayments([]);
        }
        setHasMorePayments(false);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      Toast.error(error?.message || t('failed_to_load_payments') || 'Failed to load payments');
      if (!append) {
        setPayments([]);
      }
    } finally {
      setLoadingPayments(false);
      setLoadingMorePayments(false);
      setRefreshingPayments(false);
    }
  }, [activeTab, selectedType, searchQuery, t]);

  const loadMorePayments = useCallback(() => {
    if (!loadingMorePayments && hasMorePayments && !loadingPayments && selectedType) {
      fetchPayments(paymentsPage + 1, true);
    }
  }, [loadingMorePayments, hasMorePayments, loadingPayments, paymentsPage, selectedType, fetchPayments]);

  // Fetch consultations when tab changes or search query changes
  useEffect(() => {
    console.log('History useEffect triggered by change', { activeTab, searchQuery, selectedType });
    if (activeTab === 'consultation') {
      fetchConsultations(1, false);
    } else if (activeTab === 'payment' && selectedType) {
      fetchPayments(1, false);
    }
  }, [activeTab, searchQuery, selectedType]);

  // Payments are already filtered by selectedType on the backend
  // No need for client-side filtering

  const handleNavigateToPrescription = useCallback((consultationID?: number) => {
    navigation.navigate('PrescriptionScreen', {
      consultationID: consultationID,
      fromHistory: true,
    });
  }, [navigation]);

  const handleNavigateToChat = useCallback((item: ConsultationItem & { consultationID?: number; doctorID?: number; clinicInfo?: any; doctorInfo?: any }) => {
    // Normalize image to raw URL string (if possible) so ChatScreen can decide rendering
    const rawClinicImage = (() => {
      const img = item.clinicInfo?.image;
      if (!img) return undefined;
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img.uri) return img.uri;
      return undefined;
    })();
    console.log('Navigating to ChatScreen with clinic image:', item);
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
        name: item.clinicName || item.clinicInfo?.name || '',
        clinicName: item.clinicName || item.clinicInfo?.clinicName || item.clinicInfo?.name || '',
        location: item.clinicInfo?.location || '',
        image: rawClinicImage,
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
        const clinicImageUri = 'clinicImage' in item ? item.clinicImage : undefined;
        navigation.navigate('CardDetails', {
          ...commonParams,
          image: clinicImageUri ? { uri: clinicImageUri } : item.clinicImg ? RecommandImage : undefined,
          services: item.services || [],
          isAppointment: true,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('history')} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <HistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'consultation' ? (
        <FlatList
          data={consultations}
          renderItem={({ item }) => renderConsultationCard(item)}
          keyExtractor={(item) => item.id}
          onEndReached={loadMoreConsultations}
          onEndReachedThreshold={0.5}
          refreshing={refreshingConsultations}
          onRefresh={() => {
            setRefreshingConsultations(true);
            fetchConsultations(1, false);
          }}
          ListEmptyComponent={
            loadingConsultations && !refreshingConsultations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_consultations_found') || 'No consultations found'}</Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMoreConsultations ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          style={{ flex: 1 }}
          contentContainerStyle={
            consultations.length === 0
              ? { flexGrow: 1, justifyContent: 'center', paddingBottom: 16 }
              : { paddingBottom: 16 }
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          {activeTab === 'payment' && (
            <View style={styles.content}>
              {/* <CustomDropdown
                label={t('type')}
                placeholder={t('select_type_here')}
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value as PaymentKind | '');
                  setLoadingPayments(true);
                  setPayments([]);
                }}
                options={DROPDOWN_OPTIONS.map(option => ({
                  ...option,
                  label: t(option.label.toLowerCase()),
                }))}
              /> */}

              <FlatList
                data={payments}
                style={{ flex: 1 }}
                renderItem={({ item }) => renderPaymentCard(item)}
                keyExtractor={(item) => item.id}
                onEndReached={loadMorePayments}
                onEndReachedThreshold={0.5}
                refreshing={refreshingPayments}
                onRefresh={() => {
                  setRefreshingPayments(true);
                  fetchPayments(1, false);
                }}
                contentContainerStyle={
                  payments.length === 0
                    ? { flexGrow: 1, justifyContent: 'center', paddingBottom: 16 }
                    : { paddingBottom: 16 }
                }
                ListEmptyComponent={
                  loadingPayments && !refreshingPayments ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>{t('no_payments_found') || 'No payments found'}</Text>
                    </View>
                  )
                }
                ListFooterComponent={
                  loadingMorePayments && payments.length > 0 ? (
                    <View style={{ paddingVertical: 20 }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : null
                }
                // contentContainerStyle={[styles.scrollView, { flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
