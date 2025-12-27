import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
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
import { Toast as Toastify } from 'toastify-react-native';
import { BASE_URL } from '@constants';
import { useAuthStore } from '@store';

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
  isRefundRequest?: boolean; // Flag to indicate this is from refund requests

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

  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [clinicID, setClinicID] = useState<number | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  
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

  // Get user location for refund appointment details
  const getLocation = async (): Promise<{ lat: number; long: number }> => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) {
          const position = await new Promise<any>((resolve, reject) => {
            Geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
            );
          });
          return {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const position = await new Promise<any>((resolve, reject) => {
              Geolocation.getCurrentPosition(
                resolve,
                reject,
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
              );
            });
            return {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            };
          } else {
            return { lat: 24.7136, long: 46.6753 }; // Default to Riyadh
          }
        }
      } else {
        // iOS
        const position = await new Promise<any>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
          );
        });
        return {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };
      }
    } catch (error) {
      console.log('Error getting location:', error);
      return { lat: 24.7136, long: 46.6753 }; // Default to Riyadh
    }
  };

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
      let endpoint = '';
      if (params.isRefundRequest && isAppointment) {
        // For refund appointment details, we need location
        const location = await getLocation();
        endpoint = `${API.REFUND.GET_REFUND_APPOINTMENT_DETAILS}/${params.paymentId}?lat=${location.lat}&long=${location.long}`;
      } else if (isAppointment) {
        endpoint = `${API.HISTORY.GET_APPOINTMENT_DETAILS}/${params.paymentId}`;
      } else {
        endpoint = `${API.HISTORY.GET_CONSULTATION_PAYMENT_DETAILS}/${params.paymentId}`;
      }

      const response = await apiClient.get(endpoint);
      console.log('Payment details response:', endpoint, response.data);

      // Check if API returned success but no data (empty array or null)
      if (response.data?.success === true) {
        const responseData = response.data.data;
        
        // Check if data is empty array or null/undefined
        if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
          // API returned success but no data - show empty state
          setPaymentDetails(null);
          setDisplayData({
            clinicName: '',
            clinicLocation: '',
            status: '',
            statusColor: colors.green,
            dateTime: '',
            price: '',
            image: undefined,
            consultationType: undefined,
            duration: undefined,
            doctorName: undefined,
            doctorAvatar: undefined,
            serviceName: undefined,
            services: [],
          });
          setLoading(false);
          return;
        }
      }

      if (response.data?.success !== false && response.data?.data) {
        let data = response.data.data;
        
        // If data is an array, extract the first item
        if (Array.isArray(data)) {
          if (data.length === 0) {
            setPaymentDetails(null);
            setDisplayData({
              clinicName: '',
              clinicLocation: '',
              status: '',
              statusColor: colors.green,
              dateTime: '',
              price: '',
              image: undefined,
              consultationType: undefined,
              duration: undefined,
              doctorName: undefined,
              doctorAvatar: undefined,
              serviceName: undefined,
              services: [],
            });
            setLoading(false);
            return;
          }
          // Extract first item from array
          data = data[0];
        }

        setPaymentDetails(data);

        // Extract clinicID for rating
        const extractedClinicID = data.clinicID || data.clinic?.id || null;
        setClinicID(extractedClinicID);

        // Map API response to display data
        if (isAppointment) {
          // Appointment payment details
          setDisplayData({
            clinicName: data.clinic?.clinicName || data.clinic?.name || data.clinicName || '',
            clinicLocation: data.clinic?.location || data.clinicLocation || '',
            status: data.status || '',
            statusColor: data.status === 'Completed' || data.status === 'Success' 
              ? colors.green 
              : data.status === 'Pending' 
              ? colors.yellow 
              : colors.red,
            dateTime: data.date || data.created_at || '',
            price: data.price || data.amount || '',
            image: data.clinic?.image ? { uri: data.clinic.image } : RecommandImage,
            services: data.services?.map((service: any, index: number) => ({
              id: service.id || index,
              name: service.name || service.serviceName || '',
              duration: service.duration || '',
              price: service.price || '0',
              category: service.category || service.group?.name || '',
              categoryBadge: service.category || service.group?.name || '',
              image: service.image ? { uri: service.image } : RecommandImage,
            })) || [],
            consultationType: undefined,
            duration: undefined,
            doctorName: undefined,
            doctorAvatar: undefined,
            serviceName: undefined,
          });
        } else {
          // Consultation payment details - map according to the API response structure
          const consultationData = data;
          const clinicData = consultationData.clinic || {};
          const doctorData = consultationData.doctor || {};
          const serviceData = consultationData.service || {};
          
          // Format date and time from date or created_at
          const dateTimeStr = consultationData.date || consultationData.created_at || '';
          let formattedDateTime = '';
          if (dateTimeStr) {
            try {
              const date = new Date(dateTimeStr);
              formattedDateTime = date.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
            } catch (e) {
              formattedDateTime = dateTimeStr;
            }
          }
          
          // Format price with currency
          const priceValue = consultationData.price || consultationData.amount || '0';
          const formattedPrice = priceValue ? `SAR ${parseFloat(priceValue).toFixed(2)}` : 'SAR 0.00';
          
          // Format duration from service duration (in minutes)
          let formattedDuration = '';
          if (serviceData.duration) {
            const durationMinutes = parseInt(serviceData.duration, 10);
            if (durationMinutes >= 60) {
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              formattedDuration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            } else {
              formattedDuration = `${durationMinutes}m`;
            }
          }
          
          setDisplayData({
            clinicName: clinicData.clinicName || clinicData.name || '',
            clinicLocation: clinicData.location || '',
            status: consultationData.status || '',
            statusColor: consultationData.status === 'Completed' || consultationData.status === 'Success' 
              ? colors.green 
              : consultationData.status === 'Pending' 
              ? colors.yellow 
              : colors.red,
            dateTime: formattedDateTime,
            price: formattedPrice,
            image: clinicData.image ? { uri: clinicData.image } : RecommandImage,
            consultationType: consultationData.type || consultationData.consultationType,
            duration: formattedDuration || serviceData.duration?.toString() || '',
            doctorName: doctorData.name || '',
            doctorAvatar: doctorData.image || undefined,
            serviceName: serviceData.name || '',
            services: [],
          });
        }
      } else {
        // API returned failure or no data - show empty state
        setPaymentDetails(null);
        setDisplayData({
          clinicName: '',
          clinicLocation: '',
          status: '',
          statusColor: colors.green,
          dateTime: '',
          price: '',
          image: undefined,
          consultationType: undefined,
          duration: undefined,
          doctorName: undefined,
          doctorAvatar: undefined,
          serviceName: undefined,
          services: [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      Toastify.error(error?.message || t('failed_to_load_payment_details') || 'Failed to load payment details');
      // Show empty state on error instead of using params data
      setPaymentDetails(null);
      setDisplayData({
        clinicName: '',
        clinicLocation: '',
        status: '',
        statusColor: colors.green,
        dateTime: '',
        price: '',
        image: undefined,
        consultationType: undefined,
        duration: undefined,
        doctorName: undefined,
        doctorAvatar: undefined,
        serviceName: undefined,
        services: [],
      });
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
      Toastify.error(t('clinic_id_required') || 'Clinic ID is required');
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
        Toastify.success(t('review_submitted_successfully') || 'Review submitted successfully');
        setShowRating(false);
      } else {
        throw new Error(response.data?.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Toastify.error(error?.response?.data?.message || error?.message || t('failed_to_submit_review') || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Helper function to download invoice from URL
  const downloadInvoiceFromUrl = async (invoiceUrl: string, downloadDir: string, fileName: string): Promise<void> => {
    const token = (useAuthStore.getState().auth as any)?.token;
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const filePath = `${downloadDir}/${fileName}`;
    
    // Use RNFS.downloadFile to download the PDF
    const downloadResult = await RNFS.downloadFile({
      fromUrl: invoiceUrl,
      toFile: filePath,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log('Invoice saved at:', filePath);
      Toastify.success(
        t('invoice_saved_successfully') || 
        `Invoice saved as PDF successfully\nLocation: ${Platform.OS === 'android' ? 'Downloads' : 'Documents'}`
      );
    } else {
      throw new Error(`Failed to download invoice: ${downloadResult.statusCode}`);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!paymentDetails) {
      Toastify.error(t('no_consultation_data') || 'No consultation data available');
      return;
    }

    // Get consultationID from paymentDetails
    const consultationID = paymentDetails.id || paymentDetails.consultationID;
    if (!consultationID) {
      Toastify.error(t('consultation_id_required') || 'Consultation ID is required');
      return;
    }

    setIsDownloadingInvoice(true);
    try {
      // Get user location
      const location = await getLocation();
      
      // Get auth token
      const token = (useAuthStore.getState().auth as any)?.token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build API endpoint with query parameters
      const endpoint = `${API.CONSULTATIONS.DOWNLOAD_INVOICE}?consultationID=${consultationID}&lat=${location.lat}&long=${location.long}`;
      const url = `${BASE_URL}${endpoint}`;

      console.log('Downloading invoice from:', url);

      // Fetch the invoice
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download invoice: ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      
      // Determine the download directory based on platform
      let downloadDir = '';
      let fileName = `Invoice_${consultationID || Date.now()}.pdf`;

      if (Platform.OS === 'android') {
        // For Android, save to Downloads folder
        downloadDir = RNFS.DownloadDirectoryPath;
      } else {
        // For iOS, save to Documents directory
        downloadDir = RNFS.DocumentDirectoryPath;
      }

      // If it's a PDF file, download and save it
      if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
        // Save the PDF file directly using RNFS
        const filePath = `${downloadDir}/${fileName}`;
        
        // Use RNFS.downloadFile for better handling
        const downloadResult = await RNFS.downloadFile({
          fromUrl: url,
          toFile: filePath,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
        }).promise;

        if (downloadResult.statusCode === 200) {
          console.log('Invoice saved at:', filePath);
          Toastify.success(
            t('invoice_saved_successfully') || 
            `Invoice saved as PDF successfully\nLocation: ${Platform.OS === 'android' ? 'Downloads' : 'Documents'}`
          );
        } else {
          throw new Error(`Failed to download invoice: ${downloadResult.statusCode}`);
        }
      } else {
        // Try to parse as JSON (might contain a URL or file data)
        try {
          const responseData = await response.json();
          
          if (responseData?.success === true) {
            // Check if response contains a URL
            if (responseData.url || responseData.invoiceUrl || responseData.downloadUrl) {
              const invoiceUrl = responseData.url || responseData.invoiceUrl || responseData.downloadUrl;
              // Download the PDF from the URL
              await downloadInvoiceFromUrl(invoiceUrl, downloadDir, fileName);
            } else if (responseData.file || responseData.data) {
              // If response contains file data (base64 or URL)
              const fileData = responseData.file || responseData.data;
              if (typeof fileData === 'string' && (fileData.startsWith('http') || fileData.startsWith('https'))) {
                // Download from URL
                await downloadInvoiceFromUrl(fileData, downloadDir, fileName);
              } else if (typeof fileData === 'string' && fileData.length > 100) {
                // Assume it's base64 data
                const filePath = `${downloadDir}/${fileName}`;
                await RNFS.writeFile(filePath, fileData, 'base64');
                console.log('Invoice saved at:', filePath);
                Toastify.success(
                  t('invoice_saved_successfully') || 
                  `Invoice saved as PDF successfully\nLocation: ${Platform.OS === 'android' ? 'Downloads' : 'Documents'}`
                );
              } else {
                throw new Error(t('invoice_format_not_supported') || 'Invoice format not supported');
              }
            } else {
              // If no URL or file data, try to download from the original URL
              await downloadInvoiceFromUrl(url, downloadDir, fileName);
            }
          } else {
            throw new Error(responseData?.message || t('failed_to_download_invoice') || 'Failed to download invoice');
          }
        } catch (jsonError: any) {
          // If response is not JSON, it might be a direct file download
          // Try to download from the URL
          try {
            await downloadInvoiceFromUrl(url, downloadDir, fileName);
          } catch (downloadError: any) {
            throw new Error(downloadError?.message || t('failed_to_download_invoice') || 'Failed to download invoice');
          }
        }
      }
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      Toastify.error(error?.message || t('failed_to_download_invoice') || 'Failed to download invoice. Please try again.');
    } finally {
      setIsDownloadingInvoice(false);
    }
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

  // Check if we have no data to display (no paymentDetails and empty displayData)
  const hasNoData = !paymentDetails && (!displayData.clinicName && !displayData.clinicLocation && !displayData.dateTime);

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

  if (hasNoData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <Header2 title={params.paymentId} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: colors.secondaryText, textAlign: 'center', fontSize: 16 }}>
            {t('no_payment_details_found') || 'No payment details found'}
          </Text>
          <Text style={{ color: colors.secondaryText, textAlign: 'center', marginTop: 8, fontSize: 14 }}>
            {t('no_payment_details_message') || 'Unable to load payment details for this appointment.'}
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
              <Text style={styles.clinicName}>{displayData.clinicName || t('clinic_name') || 'Clinic Name'}</Text>
              <Text style={styles.clinicLocation}>{displayData.clinicLocation || t('clinic_location') || 'Location'}</Text>
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
              loading={isDownloadingInvoice}
              disabled={isDownloadingInvoice}
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
