import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../styles/colors';
import { styles } from './style';
import { Header2 } from '@components/common/Header2';
import { CustomButton } from '@components/common/CustomButton';
import { RecommandImage } from '@assets/images';
import RatingBottomSheet from '@components/molecules/RatingBottomSheet';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import Toast from 'toastify-react-native';

type CardDetailsRouteParams = {
  paymentId: string;
  clinicName?: string;
  clinicLocation?: string;
  status?: string;
  statusColor?: string;
  dateTime?: string;
  price?: string;
  image?: any;
  reason?: string;

  consultationType?: 'Chat' | 'Video' | 'Audio';
  duration?: string;
  doctorName?: string;
  doctorAvatar?: string;
  serviceName?: string;

  services?: Array<{
    id: number;
    name: string;
    duration: string;
    price: string;
    category: string;
    categoryBadge: string;
    image: any;
  }>;
};

type CardDetailsRouteProp = RouteProp<
  { CardDetails: CardDetailsRouteParams },
  'CardDetails'
>;

export function CardDetails({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const route = useRoute<CardDetailsRouteProp>();
  const params = route.params;
  const reason = params.reason;

  // Determine if it's appointment or consultation based on params
  const isAppointment = !!params.services?.length;
  const isConsultation = !!params.consultationType || (!params.services?.length && !params.consultationType);

  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [clinicID, setClinicID] = useState<number | null>(null);
  
  // State for displaying data
  const [displayData, setDisplayData] = useState({
    clinicName: params.clinicName || '',
    clinicLocation: params.clinicLocation || '',
    status: params.status || '',
    statusColor: params.statusColor || colors.green,
    dateTime: params.dateTime || '',
    price: params.price || '',
    image: params.image,
    consultationType: params.consultationType,
    duration: params.duration,
    doctorName: params.doctorName,
    doctorAvatar: params.doctorAvatar,
    serviceName: params.serviceName,
    services: params.services || [],
  });

  // Fetch payment details from API
  useEffect(() => {
    fetchPaymentDetails();
  }, [params.paymentId]);

  const fetchPaymentDetails = async () => {
    if (!params.paymentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Determine which API to call
      const endpoint = isAppointment
        ? `${API.HISTORY.GET_APPOINTMENT_DETAILS}/${params.paymentId}`
        : `${API.HISTORY.GET_CONSULTATION_PAYMENT_DETAILS}/${params.paymentId}`;

      const response = await apiClient.get(endpoint);
      console.log('Payment details response:', response.data);

      if (response.data?.success !== false && response.data?.data) {
        const data = response.data.data;
        setPaymentDetails(data);

        // Extract clinicID for rating
        const extractedClinicID = data.clinicID || data.clinic?.id || null;
        setClinicID(extractedClinicID);

        // Map API response to display data
        if (isAppointment) {
          // Appointment payment details
          setDisplayData({
            clinicName: data.clinic?.name || data.clinicName || params.clinicName || '',
            clinicLocation: data.clinic?.location || data.clinicLocation || params.clinicLocation || '',
            status: data.status || params.status || '',
            statusColor: data.status === 'Completed' || data.status === 'Success' 
              ? colors.green 
              : data.status === 'Pending' 
              ? colors.yellow 
              : colors.red,
            dateTime: data.date || data.created_at || params.dateTime || '',
            price: data.price || data.amount || params.price || '',
            image: data.clinic?.image ? { uri: data.clinic.image } : params.image || RecommandImage,
            services: data.services?.map((service: any, index: number) => ({
              id: service.id || index,
              name: service.name || service.serviceName || '',
              duration: service.duration || '',
              price: service.price || '0',
              category: service.category || service.group?.name || '',
              categoryBadge: service.category || service.group?.name || '',
              image: service.image ? { uri: service.image } : RecommandImage,
            })) || params.services || [],
            consultationType: undefined,
            duration: undefined,
            doctorName: undefined,
            doctorAvatar: undefined,
            serviceName: undefined,
          });
        } else {
          // Consultation payment details
          setDisplayData({
            clinicName: data.clinic?.name || data.clinicName || params.clinicName || '',
            clinicLocation: data.clinic?.location || data.clinicLocation || params.clinicLocation || '',
            status: data.status || params.status || '',
            statusColor: data.status === 'Completed' || data.status === 'Success' 
              ? colors.green 
              : data.status === 'Pending' 
              ? colors.yellow 
              : colors.red,
            dateTime: data.date || data.created_at || params.dateTime || '',
            price: data.price || data.amount || params.price || '',
            image: data.clinic?.image ? { uri: data.clinic.image } : params.image || RecommandImage,
            consultationType: data.type || data.consultationType || params.consultationType,
            duration: data.duration || data.service?.duration || params.duration,
            doctorName: data.doctor?.name || data.doctorName || params.doctorName,
            doctorAvatar: data.doctor?.image || data.doctorAvatar || params.doctorAvatar,
            serviceName: data.service?.name || data.serviceName || params.serviceName,
            services: [],
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      Toast.error(error?.message || t('failed_to_load_payment_details') || 'Failed to load payment details');
      // Keep using params data if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleGiveReview_Vist = () => {
    isAppointment
      ? navigation.navigate('ClinicDetail', {
          clinic: {
            id: `clinic_${Date.now()}`,
            name: 'AI Health Clinic',
            location: 'None',
            image: RecommandImage,
            specialty: 'General',
            rating: 3,
          },
        })
      : handleGiveReview();
  };

  const handleGiveReview = () => setShowRating(true);
  
  const handleRatingSubmit = async (rating: number, feedback: string) => {
    if (!clinicID) {
      Toast.error(t('clinic_id_required') || 'Clinic ID is required');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await apiClient.post(API.HISTORY.RATE_CLINIC, {
        clinicID: clinicID,
        rating: rating,
        review: feedback || '',
      });

      if (response.data?.success !== false) {
        Toast.success(t('review_submitted_successfully') || 'Review submitted successfully');
        setShowRating(false);
      } else {
        throw new Error(response.data?.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Toast.error(error?.response?.data?.message || error?.message || t('failed_to_submit_review') || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownloadInvoice = () => {
    alert('Invoice download not implemented yet');
  };

  const handleRefund = () => {
    navigation.navigate('Refund', {
      paymentId: params.paymentId,
      clinicName: params.clinicName,
      clinicLocation: params.clinicLocation,
      image: params.image,
      services: params.services,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <Header2 title={params.paymentId} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.secondaryText }}>
            {t('loading') || 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <Header2 title={params.paymentId} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.clinicInfo}>
          <View style={styles.clinicLeft}>
            <Image
              source={displayData.image || RecommandImage}
              style={styles.clinicImage}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.clinicName}>{displayData.clinicName}</Text>
              <Text style={styles.clinicLocation}>{displayData.clinicLocation}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              ...styles.consultButton,
              backgroundColor: isAppointment ? colors.gray : colors.black,
            }}
            onPress={handleGiveReview_Vist}
          >
            <Text
              style={{
                ...styles.consultButtonText,
                color: isAppointment ? colors.text : colors.white,
              }}
            >
              {isAppointment ? t('visit') : t('give_review')}
            </Text>
          </TouchableOpacity>
        </View>

        {isAppointment &&
          displayData.services?.map(service => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceLeft}>
                <Image source={service.image} style={styles.serviceImage} />
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceBadges}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {service.category}
                      </Text>
                    </View>
                    <View style={styles.nameBadge}>
                      <Text style={styles.nameBadgeText}>
                        {service.categoryBadge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.serviceName}>{service.name}</Text>

                  <View style={styles.durationContainer}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={colors.secondaryText}
                    />
                    <Text style={styles.duration}>{service.duration}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
          ))}
        {reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('reason_for_refund')}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{reason}</Text>
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payment_detail')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('payment_type')}</Text>
            <Text style={styles.detailValue}>{t('payInInstallments')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('payment_method')}</Text>
            <Text style={styles.detailValue}>{t('credit_card')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('points_earned')}</Text>
            <Text style={styles.points_earn}>20 SAR</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('points_used')}</Text>
            <Text style={styles.points_use}>20 SAR</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('status')}</Text>
            <Text style={[styles.detailValue, { color: displayData.statusColor }]}>
              {displayData.status}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('date_time')}</Text>
            <Text style={styles.detailValue}>{displayData.dateTime}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAppointment
              ? t('appointment_summary')
              : t('consultation_summary')}
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('no_of_service')}</Text>
            <Text style={styles.detailValue}>3</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('subtotal')}</Text>
            <Text style={styles.detailValue}>SAR 700</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('discount')}</Text>
            <Text style={styles.points_use}>- SAR 300</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('redemption')}</Text>
            <Text style={styles.points_use}>- SAR 300</Text>
          </View>

          {displayData.consultationType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('consultation_type')}</Text>
              <Text style={styles.detailValue}>{displayData.consultationType}</Text>
            </View>
          )}

          {displayData.doctorName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('doctor_name')}</Text>
              <Text style={styles.detailValue}>{displayData.doctorName}</Text>
            </View>
          )}

          {displayData.duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('duration')}</Text>
              <Text style={styles.detailValue}>{displayData.duration}</Text>
            </View>
          )}

          {displayData.serviceName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('service')}</Text>
              <Text style={styles.detailValue}>{displayData.serviceName}</Text>
            </View>
          )}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalAmount}>{displayData.price}</Text>
          </View>
        </View>
      </ScrollView>

      {!reason && (
        <View style={styles.bottomButtonContainer}>
          {isAppointment ? (
            <CustomButton
              title={t('request_for_refund')}
              onPress={handleRefund}
            />
          ) : (
            <CustomButton
              title={t('download_invoice')}
              onPress={handleDownloadInvoice}
            />
          )}
        </View>
      )}

      <RatingBottomSheet
        visible={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
        loading={submittingRating}
      />
    </SafeAreaView>
  );
}
