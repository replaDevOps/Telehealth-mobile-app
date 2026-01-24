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
import { translateCityToEnglish } from '../../../utils/cityTranslator';

type CardDetailsRouteParams = {
  paymentId: string;
  isAppointment?: boolean;
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
  servicePrice?: string;
  serviceType?: string;
  serviceGroup?: string;
  paymentMethod?: string;
  total?: string;

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
  const isAppointment = params.isAppointment;
  console.log('isAppointment', isAppointment);

  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [clinicID, setClinicID] = useState<number | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // State for displaying data
  const [displayData, setDisplayData] = useState<{
    clinicName: string;
    clinicLocation: string;
    status: string;
    statusColor: string;
    dateTime: string;
    price: string;
    image: any;
    consultationType: 'Chat' | 'Video' | 'Audio' | undefined;
    duration: string | undefined;
    doctorName: string | undefined;
    doctorAvatar: string | undefined;
    serviceName: string | undefined;
    servicePrice?: string;
    serviceType?: string;
    serviceGroup?: string;
    paymentMethod?: string;
    total?: string;
    services: any[];
  }>({
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
    servicePrice: undefined,
    serviceType: undefined,
    serviceGroup: undefined,
    paymentMethod: undefined,
    total: params.price || '',
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
      console.log('endpoint', endpoint);

      const response = await apiClient.get(endpoint);
      console.log('Payment details response:', endpoint, response);

      // API response structure for appointment details:
      // {
      //   success: true,
      //   clinic: {...},
      //   appointment: {...},
      //   appointment_services: [...],
      //   transactions: {...}
      // }
      // OR for consultations:
      // {
      //   success: true,
      //   data: {...} // nested structure
      // }
      const responseData = response.data;

      if (responseData?.success !== false) {
        // Extract data - for appointments, data is at root level
        // For consultations, data might be nested in responseData.data
        let data = responseData.data || responseData;

        // If data is an array, extract the first item (legacy format)
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
              servicePrice: undefined,
              serviceType: undefined,
              serviceGroup: undefined,
              paymentMethod: undefined,
              total: '',
              services: [],
            });
            setLoading(false);
            return;
          }
          // Extract first item from array
          data = data[0];
        }

        // For appointments, use responseData directly (it's already the object)
        // For consultations, use extracted data
        const finalData = isAppointment ? responseData : data;
        setPaymentDetails(finalData);

        // Map API response to display data
        if (isAppointment) {
          // Appointment payment details - map from new API structure
          // Data is at root level: responseData.clinic, responseData.appointment, etc.
          const clinicData = finalData.clinic || {};
          const clinicDetails = clinicData.details || {};
          const appointmentData = finalData.appointment || {};
          const appointmentServices = finalData.appointment_services || [];
          const transactionData = finalData.transactions || {};

          // Extract clinicID for rating
          const extractedClinicID = clinicData.clinicID || clinicData.id || appointmentData.clinicID || null;
          setClinicID(extractedClinicID);

          // Format date from appointment requestDate or transaction date
          const dateStr = appointmentData.requestDate || transactionData.date || appointmentData.created_at || '';
          let formattedDateTime = '';
          if (dateStr) {
            try {
              const date = new Date(dateStr);
              formattedDateTime = date.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
            } catch (e) {
              formattedDateTime = dateStr;
            }
          }

          // Format price from transaction amount
          const priceValue = transactionData.amount || '0';
          const formattedPrice = priceValue ? `SAR ${parseFloat(priceValue).toFixed(2)}` : 'SAR 0.00';

          // Map appointment_services to services array
          const mappedServices = appointmentServices.map((appointmentService: any, index: number) => {
            const serviceData = appointmentService.service || {};
            const groupData = serviceData.group || {};

            return {
              id: serviceData.id || appointmentService.serviceID || index,
              appointmentServiceID: appointmentService.id, // This is the ID needed for refund API
              name: serviceData.name || '',
              duration: serviceData.duration ? `${serviceData.duration} min` : '',
              price: serviceData.price || appointmentService.price || '0',
              category: serviceData.serviceType && typeof serviceData.serviceType === 'string' && serviceData.serviceType.length
                ? serviceData.serviceType.charAt(0).toUpperCase() + serviceData.serviceType.slice(1)
                : '',
              categoryBadge: groupData.name && typeof groupData.name === 'string' && groupData.name.length
                ? groupData.name.charAt(0).toUpperCase() + groupData.name.slice(1)
                : (serviceData.serviceType && typeof serviceData.serviceType === 'string'
                  ? serviceData.serviceType.charAt(0).toUpperCase() + serviceData.serviceType.slice(1)
                  : ''),
              image: serviceData.image ? { uri: serviceData.image } : RecommandImage,
            };
          });

          // Determine status from appointment or transaction
          const status = transactionData.status || appointmentData.status || '';
          const statusColor = status === 'Paid' || status === 'Completed' || status === 'Success'
            ? colors.green
            : status === 'Pending' || status === 'Request'
              ? colors.yellow
              : colors.red;

          setDisplayData({
            clinicName: clinicData.clinicName || clinicDetails.businessName || clinicData.name || '',
            clinicLocation: (() => {
              const city = translateCityToEnglish(clinicDetails.city);
              const district = translateCityToEnglish(clinicDetails.district);
              return clinicDetails.address || `${city || ''}${district ? `, ${district}` : ''}`.trim() || '';
            })(),
            status: status,
            statusColor: statusColor,
            dateTime: formattedDateTime,
            price: formattedPrice,
            image: clinicData.image || clinicDetails.coverImage || clinicDetails.logo
              ? { uri: clinicData.image || clinicDetails.coverImage || clinicDetails.logo }
              : RecommandImage,
            consultationType: undefined,
            duration: undefined,
            doctorName: undefined,
            doctorAvatar: undefined,
            serviceName: undefined,
            servicePrice: undefined,
            serviceType: undefined,
            serviceGroup: undefined,
            paymentMethod: undefined,
            total: formattedPrice,
            services: mappedServices,
          });
        } else {
          // Consultation payment details - map according to the API response structure
          const consultationData = finalData;
          const clinicData = consultationData.clinic || {};
          const doctorData = consultationData.doctor || {};
          const serviceData = consultationData.service || {};

          // Extract clinicID for rating
          setClinicID(clinicData.id || consultationData.clinicID || null);

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

          // Format service price
          const servicePriceValue = serviceData.price || '0';
          const formattedServicePrice = servicePriceValue ? `SAR ${parseFloat(servicePriceValue).toFixed(2)}` : 'SAR 0.00';

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
            duration: consultationData.duration || '',
            doctorName: doctorData.name || '',
            doctorAvatar: doctorData.image || undefined,
            serviceName: (serviceData.name || '').toUpperCase(),
            servicePrice: formattedServicePrice,
            serviceType: (serviceData.serviceType || '').toUpperCase(),
            serviceGroup: (serviceData.group?.name || '').toUpperCase(),
            paymentMethod: (consultationData.transaction?.paymentMethod || 'CreditCard').toUpperCase(),
            total: formattedPrice,
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
          servicePrice: undefined,
          serviceType: undefined,
          serviceGroup: undefined,
          paymentMethod: undefined,
          total: '',
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
        servicePrice: undefined,
        serviceType: undefined,
        serviceGroup: undefined,
        paymentMethod: undefined,
        total: '',
        services: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveReview_Vist = () => {
    if (isAppointment && paymentDetails) {
      const clinicData = paymentDetails.clinic || {};
      const clinicDetails = clinicData.details || {};
      navigation.navigate('ClinicDetail', {
        clinic: {
          id: clinicData.id || clinicData.clinicID,
          name: displayData.clinicName,
          location: displayData.clinicLocation,
          image: displayData.image,
          specialty: clinicDetails.specialization || 'General',
          rating: clinicData.rating || 0,
        },
      });
    } else {
      handleGiveReview();
    }
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

    setIsDownloadingInvoice(true);
    try {
      // Get user location
      const location = await getLocation();

      // Get auth token
      const token = (useAuthStore.getState().auth as any)?.token;
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      let idForFileName = '';

      if (isAppointment) {
        // For appointments, use appointmentID from appointment or transaction
        const appointmentID = paymentDetails.appointment?.id ||
          paymentDetails.appointmentID ||
          paymentDetails.transactions?.appointmentID ||
          paymentDetails.id;

        if (!appointmentID) {
          throw new Error(t('appointment_id_required') || 'Appointment ID is required');
        }

        idForFileName = appointmentID.toString();
        // Use appointment invoice endpoint if available, otherwise use consultation endpoint with appointmentID
        endpoint = `${API.CONSULTATIONS.DOWNLOAD_INVOICE}?appointmentID=${appointmentID}&lat=${location.lat}&long=${location.long}`;
      } else {
        // For consultations, use consultationID
        const consultationID = paymentDetails.id || paymentDetails.consultationID;
        if (!consultationID) {
          throw new Error(t('consultation_id_required') || 'Consultation ID is required');
        }

        idForFileName = consultationID.toString();
        endpoint = `${API.CONSULTATIONS.DOWNLOAD_INVOICE}?consultationID=${consultationID}&lat=${location.lat}&long=${location.long}`;
      }

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
      let fileName = `Invoice_${idForFileName || Date.now()}.pdf`;

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
    // Get business info and services from paymentDetails (API response)
    if (isAppointment && paymentDetails) {
      const clinicData = paymentDetails.clinic || {};
      const clinicDetails = clinicData.details || {};
      const appointmentServices = paymentDetails.appointment_services || [];

      // Map services with all necessary info including appointmentServiceID
      const servicesForRefund = appointmentServices.map((appointmentService: any) => {
        const serviceData = appointmentService.service || {};
        const groupData = serviceData.group || {};

        return {
          id: serviceData.id || appointmentService.serviceID,
          appointmentServiceID: appointmentService.id, // Required for cancellation API
          serviceID: appointmentService.serviceID,
          name: serviceData.name || '',
          duration: serviceData.duration ? `${serviceData.duration} min` : '',
          price: serviceData.price || appointmentService.price || '0',
          category: groupData.name || serviceData.serviceType || '',
          categoryBadge: groupData.name || serviceData.serviceType || '',
          image: serviceData.image ? { uri: serviceData.image } : RecommandImage,
        };
      });

      navigation.navigate('Refund', {
        paymentId: params.paymentId,
        clinicName: displayData.clinicName || clinicData.clinicName || clinicDetails.businessName || '',
        clinicLocation: displayData.clinicLocation || clinicDetails.address || '',
        image: displayData.image,
        services: servicesForRefund,
        businessInfo: {
          clinicID: clinicData.clinicID || clinicData.id,
          businessName: clinicDetails.businessName || clinicData.clinicName || '',
          businessEmail: clinicDetails.businessEmail || '',
          businessNumber: clinicDetails.businessNumber || '',
          address: clinicDetails.address || '',
          city: translateCityToEnglish(clinicDetails.city) || '',
          district: clinicDetails.district || '',
        },
        appointmentID: paymentDetails.appointment?.id,
      });
    } else {
      // Fallback to params for consultations or if no paymentDetails
      navigation.navigate('Refund', {
        paymentId: params.paymentId,
        clinicName: params.clinicName,
        clinicLocation: params.clinicLocation,
        image: params.image,
        services: params.services,
      });
    }
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
      <Header2 title={"#" + params.paymentId} />

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
        {isAppointment ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('payment_detail')}</Text>

             

              {paymentDetails?.transactions?.paymentMethod && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('payment_method')}</Text>
                  <Text style={styles.detailValue}>
                    {paymentDetails.transactions.paymentMethod.charAt(0).toUpperCase() + paymentDetails.transactions.paymentMethod.slice(1)}
                  </Text>
                </View>
              )}

              {paymentDetails?.transactions?.loyaltyPointEarn !== null && paymentDetails?.transactions?.loyaltyPointEarn !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('points_earned')}</Text>
                  <Text style={styles.points_earn}>{paymentDetails.transactions.loyaltyPointEarn} {t('points') || 'Points'}</Text>
                </View>
              )}

              {paymentDetails?.transactions?.loyaltyPointUsed !== null && paymentDetails?.transactions?.loyaltyPointUsed !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('points_used')}</Text>
                  <Text style={styles.points_use}>{paymentDetails.transactions.loyaltyPointUsed} {t('points') || 'Points'}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('status')}</Text>
                <Text
                  style={[styles.detailValue, { color: displayData.statusColor }]}
                >
                  {displayData.status}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('date_time')}</Text>
                <Text style={styles.detailValue}>{displayData.dateTime}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('appointment_summary')}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('no_of_service')}</Text>
                <Text style={styles.detailValue}>
                  {displayData.services?.length || 0}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('subtotal')}</Text>
                <Text style={styles.detailValue}>{displayData.price}</Text>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalAmount}>{displayData.price}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('payment_detail')}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment_method')}</Text>
                <Text style={styles.detailValue}>{displayData.paymentMethod}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('status')}</Text>
                <Text
                  style={[styles.detailValue, { color: displayData.statusColor }]}
                >
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
                {t('consultation_summary')}
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('consultation_type')}</Text>
                <Text style={styles.detailValue}>
                  {displayData.consultationType}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('doctor_name')}</Text>
                <Text style={styles.detailValue}>{displayData.doctorName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('duration')}</Text>
                <Text style={styles.detailValue}>{displayData.duration}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('price')}</Text>
                <Text style={styles.detailValue}>{displayData.servicePrice}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('service_type')}</Text>
                <Text style={styles.detailValue}>{displayData.serviceType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('service_group')}</Text>
                <Text style={styles.detailValue}>{displayData.serviceGroup}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('service')}</Text>
                <Text style={styles.detailValue}>{displayData.serviceName}</Text>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>
                  {t('total').toUpperCase()}
                </Text>
                <Text style={styles.totalAmount}>{displayData.total}</Text>
              </View>
            </View>
          </>
        )}
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
