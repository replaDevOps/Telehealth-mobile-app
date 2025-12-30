/* HistoryScreen.tsx */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { tryCatch } from '@utils';

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
  const [appointments, setAppointments] = useState<AppintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const recordsPerPage = 10;

  // Fetch refund appointments from API
  const fetchRefundAppointments = async (pageNo: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }
      setError(null);
      
      const [response, err] = await tryCatch(apiClient.get(API.REFUND.GET_REFUND_APPOINTMENTS, {
        params: {
          name: searchQuery || '',
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      }));
      console.log("🚀 ~ fetchRefundAppointments ~ response:", response);
      
      if (err) {
        console.error('Error fetching refund appointments:', err);
        const errorMessage = (err as any)?.response?.data?.message || (err as any)?.message || t('failed_to_load_refunds') || 'Failed to load refund requests';
        setError(errorMessage);
        if (!append) {
          setAppointments([]);
        }
        return;
      }

      console.log('🚀 ~ fetchRefundAppointments ~ response:', response);

      // API response structure with pagination:
      // {
      //   success: true,
      //   total: 3,
      //   currentPage: 2,
      //   perPage: 1,
      //   nextPageUrl: "...",
      //   previousPageUrl: "...",
      //   data: [...]
      // }
      const responseData = response.data;
      
      // Extract data array
      let appointmentsList: any[] = [];
      if (Array.isArray(responseData)) {
        appointmentsList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        appointmentsList = responseData.data;
      } else if (Array.isArray(responseData?.appointments)) {
        appointmentsList = responseData.appointments;
      }

      console.log('🚀 ~ fetchRefundAppointments ~ appointmentsList:', appointmentsList);

      // Check if there's more data using nextPageUrl from backend
      const hasMoreData = !!(responseData?.nextPageUrl);
      setHasMore(hasMoreData);
      
      if (responseData?.success !== false && appointmentsList.length > 0) {

        // Map API response to AppintItem format
        const mappedAppointments: AppintItem[] = appointmentsList.map((item: any, index: number) => {
          // Format date from ISO string to readable format
          let formattedDate = '';
          if (item.date || item.appointment_date || item.created_at || item.createdAt) {
            const dateStr = item.date || item.appointment_date || item.created_at || item.createdAt;
            try {
              const date = new Date(dateStr);
              formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            } catch (e) {
              formattedDate = dateStr;
            }
          }

          // Map services if available
          const services = item.services || item.service || [];
          const mappedServices = Array.isArray(services) ? services.map((service: any) => ({
            id: service.id || service.serviceID || 0,
            name: service.name || service.serviceName || service.service_name || 'Service',
            duration: service.duration || service.duration_minutes || '30 min',
            price: service.price || service.servicePrice || service.service_price || 'SAR 0',
            category: service.category || service.categoryName || service.category_name || 'Service',
            categoryBadge: service.categoryBadge || service.category_badge || 'SVC',
            image: service.image || service.serviceImage || service.service_image || RecommandImage,
          })) : [];

          // Determine status and color
          const status = item.status || item.appointment_status || item.appointmentStatus || t('pending');
          const statusColor = item.statusColor || 
            (status.toLowerCase().includes('completed') ? colors.green :
             status.toLowerCase().includes('pending') ? colors.yellow :
             status.toLowerCase().includes('cancelled') ? colors.red : colors.green);

          return {
            id: item.id?.toString() || item.appointmentID?.toString() || item.appointment_id?.toString() || index.toString(),
            kind: 'appointment',
            state: item.state || item.appointment_state || item.appointmentState || t('pending'),
            date: formattedDate || item.date || item.appointment_date || '',
            paymentId: item.paymentId || item.payment_id || item.paymentID || item.id?.toString() || `PAY-${index}`,
            clinicImg: !!item.clinicImage || !!item.clinic_image || !!item.image,
            clinicName: item.clinicName || item.clinic_name || item.clinic?.clinicName || item.clinic?.name || 'Clinic',
            clinicLocation: item.clinicLocation || item.clinic_location || item.clinic?.location || item.clinic?.address || '',
            numberOfService: mappedServices.length.toString() || item.numberOfService || item.number_of_service || '0',
            price: item.price || item.totalPrice || item.total_price || item.amount || 'SAR 0',
            status: status,
            statusColor: statusColor,
            services: mappedServices,
          };
        });

        console.log('🚀 ~ fetchRefundAppointments ~ mappedAppointments:', mappedAppointments);
        
        if (append) {
          setAppointments(prev => [...prev, ...mappedAppointments]);
        } else {
          setAppointments(mappedAppointments);
        }
        
        // Update current page from backend response
        if (responseData?.currentPage) {
          setCurrentPage(responseData.currentPage);
        } else if (mappedAppointments.length > 0) {
          setCurrentPage(pageNo);
        }
      } else {
        if (!append) {
          setAppointments([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching refund appointments:', error);
      setError(error?.response?.data?.message || error?.message || t('failed_to_load_refunds') || 'Failed to load refund requests');
      if (!append) {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchRefundAppointments(currentPage + 1, true);
    }
  };

  // Fetch data on mount and when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRefundAppointments(1, false);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRefundAppointments(1, false);
    }, [])
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
      <FlatList
        data={appointments}
        renderItem={({ item }) => renderAppointCard(item)}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading && appointments.length === 0}
        onRefresh={() => fetchRefundAppointments(1, false)}
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 16, color: colors.secondaryText }}>
                {t('loading') || 'Loading...'}
              </Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 }}>
              <Text style={{ color: colors.red, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <Text style={{ color: colors.secondaryText, textAlign: 'center' }}>
                {t('no_refund_requests') || 'No refund requests found'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
