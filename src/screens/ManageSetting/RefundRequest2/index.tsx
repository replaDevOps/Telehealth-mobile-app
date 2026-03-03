/* HistoryScreen.tsx */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
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
  clinicImage?: any;
  clinicName: string;
  clinicLocation: string;
  numberOfService: string;
  price: string;
  status: string;
  statusColor: string;
  refundStatus?: string;
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
                hour12: true,
              });
            } catch (e) {
              formattedDate = dateStr;
            }
          }

          // Map services if available — support multiple shapes: array, single object, nested fields
          let servicesRaw: any = item.refund_appointments || item.services || item.service || null;
          // If API returned top-level appointment.service (object) or a single service, normalize to array
          if (!servicesRaw) {
            // Try nested appointment/serviceIDs fallback (IDs only)
            if (item.appointment && Array.isArray(item.appointment.serviceIDs) && item.service) {
              servicesRaw = Array.isArray(item.service) ? item.service : [item.service];
            } else {
              servicesRaw = [];
            }
          }
          const servicesArray = Array.isArray(servicesRaw) ? servicesRaw : [servicesRaw];

          const mappedServices = servicesArray.map((service: any) => ({
            id: service?.id || service?.serviceID || service?.service_id || 0,
            name:
              service?.name || service?.serviceName || service?.service_name ||
              service?.title || item.service?.name || 'Service',
            duration: service?.duration || service?.duration_minutes || service?.time || '30 min',
            price: service?.price || service?.servicePrice || service?.service_price || item?.service?.price || 'SAR 0',
            category: service?.category || service?.categoryName || service?.category_name || 'Service',
            categoryBadge: service?.categoryBadge || service?.category_badge || 'SVC',
            image: service?.image || service?.serviceImage || service?.service_image || service?.image_url || RecommandImage,
          }));

          // Determine status and color
          const status = item.status || item.appointment_status || item.appointmentStatus || t('pending');
          const statusColor = item.statusColor || 
            (status.toLowerCase().includes('completed') ? colors.green :
             status.toLowerCase().includes('pending') ? colors.yellow :
             status.toLowerCase().includes('cancelled') ? colors.red : colors.green);

          // Prefer explicit business fields returned from API (handle nested `clinic.details` too)
          const clinicDetails = item.clinic?.details || item.details || (item.clinicDetails ? item.clinicDetails : {});

          const clinicImageUrl =
            item.logo || clinicDetails?.logo || clinicDetails?.coverImage || clinicDetails?.businessLogo ||
            item.coverImage || item.businessLogo || item.clinicImage || item.clinic_image || item.image || null;

          const clinicDisplayName =
            item.businessName || clinicDetails?.businessName || clinicDetails?.business_name ||
            item.clinicName || item.clinic_name || item.clinic?.clinicName || item.clinic?.name || item.name || 'Clinic';

          const clinicLocation =
            clinicDetails?.address || clinicDetails?.location ||
            (clinicDetails?.city && clinicDetails?.district ? `${clinicDetails.city}, ${clinicDetails.district}` : clinicDetails?.city || clinicDetails?.district) ||
            item.address || (item.city && item.district ? `${item.city}, ${item.district}` : item.city || item.district) ||
            item.clinicLocation || item.clinic_location || item.clinic?.location || item.clinic?.address || '';

          return {
            id: item.id?.toString() || item.appointmentID?.toString() || item.appointment_id?.toString() || index.toString(),
            kind: 'appointment',
            state: item.state || item.appointment_state || item.appointmentState || t('pending'),
            date: formattedDate || item.date || item.appointment_date || '',
            paymentId: item.paymentId || item.payment_id || item.paymentID || item.id?.toString() || `PAY-${index}`,
            clinicImg: !!clinicImageUrl,
            clinicImage: clinicImageUrl || RecommandImage,
            clinicName: clinicDisplayName,
            clinicLocation: clinicLocation,
            numberOfService: mappedServices.length.toString() || item.numberOfService || item.number_of_service || '0',
            price: item.price || item.totalPrice || item.total_price || item.amount || 'SAR 0',
            status: status,
            statusColor: statusColor,
            refundStatus: item.refundStatus || item.refund_status || '',
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
    console.log('Rendering appointment card for item:', item);
    return (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.cardContainer}>
          {/* ---------- Header (ID + State) ---------- */}
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentId}>#{item.paymentId}</Text>

            {item.state && (
              <View style={styles.paymentTypeContainer}>
                <Text style={styles.paymentType}>{item.state}</Text>
              </View>
            )}
          </View>

          <View style={styles.paymentDoctorRow}>
            <View style={styles.paymentDoctorSection}>
              <View style={styles.doctorAvatar}>
                  {item.clinicImage ? (
                    <Image
                      source={typeof item.clinicImage === 'string' ? { uri: item.clinicImage } : item.clinicImage}
                      style={{ width: 48, height: 48,overflow: 'hidden', borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.clinicLogo}>{t('clinic_image')}</Text>
                  )}
                </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.clinicName}</Text>
                {item.clinicLocation ? (
                  <Text style={styles.clinicName}>{item.clinicLocation}</Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.paymentPrice}>SAR {item.price}</Text>
          </View>

          <View style={styles.serviceStatusRow}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceLabel}>{'No of Service'}</Text>
              <Text style={styles.serviceValue}>1</Text>
            </View>

            <View style={styles.statusDivider} />

            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{t('status')}</Text>
              <Text style={[styles.statusValue, { color: item.statusColor }]}> 
                {item.status}{item.refundStatus ? ` ${item.refundStatus}` : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() =>
              navigation.navigate('CardDetails', {
                // indicate this navigation came from refund requests (appointment)
                isRefundRequest: true,
                isAppointment: true,
                paymentId: item.paymentId,
                clinicName: item.clinicName,
                image: item.clinicImage || (item.clinicImg ? RecommandImage : undefined),
                clinicLocation: item.clinicLocation,
                status: item.status,
                statusColor: item.statusColor,
                refundStatus: item.refundStatus,
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
        style={{ flex: 1 }}
        data={appointments}
        renderItem={({ item }) => renderAppointCard(item)}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        // Only show FlatList pull-to-refresh indicator when we already have items.
        // When list is empty we render a full-screen loader in ListEmptyComponent instead.
        refreshing={loading && appointments.length > 0}
        onRefresh={() => fetchRefundAppointments(1, false)}
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 16, color: colors.secondaryText }}>
                {t('loading') || 'Loading...'}
              </Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <Text style={{ color: colors.red, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        contentContainerStyle={{ flexGrow: 1, padding: 15, paddingTop: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
