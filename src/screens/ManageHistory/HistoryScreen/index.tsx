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
  const [loadingMoreConsultations, setLoadingMoreConsultations] = useState(false);
  const [consultationsPage, setConsultationsPage] = useState(1);
  const [hasMoreConsultations, setHasMoreConsultations] = useState(true);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingMorePayments, setLoadingMorePayments] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [hasMorePayments, setHasMorePayments] = useState(true);
  const recordsPerPage = 10;

  // Fetch consultations from API
  const fetchConsultations = useCallback(async (pageNo: number = 1, append: boolean = false) => {
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

      console.log('Consultations response:', response.data);

      const responseData = response.data;
      
      // Extract data array
      let apiConsultations: any[] = [];
      if (Array.isArray(responseData)) {
        apiConsultations = responseData;
      } else if (Array.isArray(responseData?.data)) {
        apiConsultations = responseData.data;
      }

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
          
          return {
            id: String(consultation.id),
            date: consultation.date || consultation.created_at || '',
            serviceName: serviceData.name || consultation.serviceName || '',
            duration: serviceData.duration 
              ? `${serviceData.duration} min`
              : consultation.duration || '',
            type: consultationType.type,
            icon: consultationType.icon,
            doctorName: doctorData.name || consultation.doctorName || '',
            doctorAvatar: doctorData.image || consultation.doctorAvatar || '',
            clinicName: consultation.clinicName || clinicData.clinicName || clinicData.name || '',
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
    }
  }, [activeTab, searchQuery, t]);

  const loadMoreConsultations = useCallback(() => {
    if (!loadingMoreConsultations && hasMoreConsultations && !loadingConsultations) {
      fetchConsultations(consultationsPage + 1, true);
    }
  }, [loadingMoreConsultations, hasMoreConsultations, loadingConsultations, consultationsPage, fetchConsultations]);

  // Fetch payment history from API
  const fetchPayments = useCallback(async (pageNo: number = 1, append: boolean = false) => {
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
            
            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'consultation' as const,
              date: payment.date || payment.created_at || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              type: payment.type || payment.consultationType,
              duration: payment.duration || serviceData.duration || '',
              serviceName: payment.serviceName || serviceData.name || '',
              doctorStatus: payment.doctorStatus || payment.status,
              doctorName: payment.doctorName || doctorData.name || '',
              doctorAvatar: payment.doctorAvatar || doctorData.image || '',
              clinicName: payment.clinicName || clinicData.clinicName || clinicData.name || '',
              clinicLocation: payment.clinicLocation || clinicData.location || '',
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
            const clinicData = payment.clinic || {};
            const services = payment.services || [];
            
            return {
              id: String(payment.id || payment.paymentId || Date.now()),
              kind: 'appointment' as const,
              date: payment.date || payment.created_at || '',
              paymentId: String(payment.paymentId || payment.id || ''),
              clinicImg: !!payment.clinicImage || !!clinicData.image,
              clinicName: payment.clinicName || clinicData.clinicName || clinicData.name || '',
              clinicLocation: payment.clinicLocation || clinicData.location || '',
              numberOfService: String(services.length || payment.numberOfServices || 0),
              price: payment.price || payment.amount || '0',
              status: payment.status || 'Completed',
              statusColor: payment.status === 'Completed' || payment.status === 'Success' 
                ? colors.green 
                : payment.status === 'Pending' 
                ? colors.yellow 
                : colors.red,
              services: services.map((service: any, index: number) => {
                const serviceGroup = service.group || {};
                return {
                id: service.id || index,
                name: service.name || service.serviceName || '',
                duration: service.duration || '',
                price: service.price || '0',
                  category: service.category || serviceGroup.name || '',
                  categoryBadge: service.category || serviceGroup.name || '',
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
    }
  }, [activeTab, selectedType, searchQuery, t]);

  const loadMorePayments = useCallback(() => {
    if (!loadingMorePayments && hasMorePayments && !loadingPayments && selectedType) {
      fetchPayments(paymentsPage + 1, true);
    }
  }, [loadingMorePayments, hasMorePayments, loadingPayments, paymentsPage, selectedType, fetchPayments]);

  // Fetch consultations when tab changes or search query changes
  useEffect(() => {
    if (activeTab === 'consultation') {
      fetchConsultations(1, false);
    } else if (activeTab === 'payment' && selectedType) {
      fetchPayments(1, false);
    }
  }, [activeTab, searchQuery, selectedType]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'consultation') {
        fetchConsultations(1, false);
      } else if (activeTab === 'payment' && selectedType) {
        fetchPayments(1, false);
      }
    }, [activeTab, selectedType, fetchConsultations, fetchPayments])
  );

  // Payments are already filtered by selectedType on the backend
  // No need for client-side filtering

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
    <SafeAreaView style={styles.container}>
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
          refreshing={loadingConsultations && consultations.length === 0}
          onRefresh={() => fetchConsultations(1, false)}
          ListEmptyComponent={
            loadingConsultations ? (
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
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          {activeTab === 'payment' && (
            <View style={styles.content}>
              <CustomDropdown
                label={t('type')}
                placeholder={t('select_type_here')}
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as PaymentKind | '')}
                options={DROPDOWN_OPTIONS.map(option => ({
                  ...option,
                  label: t(option.label.toLowerCase()),
                }))}
              />

              <FlatList
                data={payments}
                renderItem={({ item }) => renderPaymentCard(item)}
                keyExtractor={(item) => item.id}
                onEndReached={loadMorePayments}
                onEndReachedThreshold={0.5}
                refreshing={loadingPayments && payments.length === 0}
                onRefresh={() => fetchPayments(1, false)}
                ListEmptyComponent={
                  loadingPayments ? (
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
                  loadingMorePayments ? (
                    <View style={{ paddingVertical: 20 }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : null
                }
                contentContainerStyle={styles.scrollView}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
