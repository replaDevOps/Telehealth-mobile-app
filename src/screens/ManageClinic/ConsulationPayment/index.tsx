import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { CustomButton } from '@components/common/CustomButton';
import { RecommandImage, doctor } from '@assets/images';
import { styles } from './style';
import { PaymentMethod, SuccessMessageModal } from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { Toast as Toastify } from 'toastify-react-native';
import { Toast } from '@components/common/Toast';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { pusherService } from '@services/pusher/PusherService';
import NoResponseModal from '@components/molecules/NoResponseModal';
import { useAuthStore } from '@store';

export function ConsultationPayment({ navigation, route }) {
  const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'applepay' | 'stc' | 'tabby' | 'tamara'>('credit');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForDoctor, setWaitingForDoctor] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<any>(null);
  const refundProcessedRef = useRef(false);
  const [showNoResponseModal, setShowNoResponseModal] = useState(false);
  const auth = useAuthStore(state => state.auth);
  const patientID = auth ? ((auth as any).id || (auth as any).user?.id) : undefined;
  const consultationIdRef = useRef<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const consultationData = route?.params || {
    consultationType: 'Chat',
    consultationTypeId: 'chat',
    duration: '30 Min',
    price: '20 SAR',
    serviceType: 'Derma',
    serviceGroup: 'Diagnostics',
    service: 'Impacted Surgical Exposure - Difficult',
  };

  // Debug: Log received data
  React.useEffect(() => {
    console.log('ConsultationPayment received params:', consultationData);
  }, []);

  const consultationType = consultationData.consultationTypeId || 'chat';

  // Handle payment method change - only allow card payment
  const handlePaymentChange = (payment: 'credit' | 'applepay' | 'stc' | 'tabby' | 'tamara') => {
    if (payment !== 'credit') {
      Alert.alert(
        t('payment_method_not_available') || 'Payment Method Not Available',
        t('only_card_payment_available') || 'Only card payment is currently available. Please select card payment to proceed.',
        [
          {
            text: t('ok') || 'OK',
            onPress: () => setSelectedPayment('credit'), // Reset to card
          },
        ]
      );
      return;
    }
    setSelectedPayment(payment);
  };

  const handleConnectWithDoctor = async () => {
    // Only card payment is implemented
    if (selectedPayment !== 'credit') {
      Alert.alert(
        t('payment_method_not_available') || 'Payment Method Not Available',
        t('only_card_payment_available') || 'Only card payment is currently available. Please select card payment to proceed.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    // Validate card details
      if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
      Alert.alert(
        t('fill_card_details') || 'Fill Card Details',
        t('please_fill_all_card_details') || 'Please fill in all card details to proceed.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    // Parse expiry date from MM/YYYY format to expMonth and expYear
    const expiryParts = expiryDate.split('/');
    if (expiryParts.length !== 2) {
      Alert.alert(
        t('invalid_expiry_date') || 'Invalid Expiry Date',
        t('please_enter_valid_expiry_date') || 'Please enter a valid expiry date in MM/YYYY format.',
        [{ text: t('ok') || 'OK' }]
      );
        return;
      }

    const expMonth = expiryParts[0].trim();
    const expYear = expiryParts[1].trim();

    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 4) {
      Alert.alert(
        t('invalid_expiry_date') || 'Invalid Expiry Date',
        t('please_enter_valid_expiry_date') || 'Please enter a valid expiry date in MM/YYYY format.',
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Prepare booking payload
      const payload = {
        paymentMethod: 'stripe',
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
        expMonth: expMonth,
        expYear: expYear,
        cvc: cvv,
        cardholderName: cardholderName,
        // Include consultation data if available
        serviceID: consultationData.serviceID,
        consultationType: consultationData.consultationType,
        serviceType: consultationData.serviceType,
        serviceGroup: consultationData.serviceGroup,
      };

      console.log('Booking consultation with payload:', payload);

      // Call book consultation API
      const response = await apiClient.post(API.CONSULTATIONS.BOOK_CONSULTATION, payload);

      console.log('Book consultation response:', response.data);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || t('failed_to_book_consultation') || 'Failed to book consultation';
        Toastify.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // Success - show toast and navigate to home
      setIsLoading(false);

      // Show success message
      const successMessage = response.data?.message || t('consultation_booked_successfully') || 'Consultation booked successfully';
      // Toastify.success(successMessage);

      // Extract consultation data from response
      // Response structure: { success: true, message: '...', consultation: { id: 28, ... } }
      const consultationResponse = response.data?.consultation || response.data?.data || response.data;
      const consultationID = consultationResponse?.id || response.data?.consultationID;
      
      console.log('Consultation booked successfully. ID:', consultationID);
      console.log('Waiting for doctor to accept consultation...');

      // Instead of navigating to WaitingForDoctor, show loader here and wait for acceptance
      consultationIdRef.current = consultationID;
      setWaitingForDoctor(true);
      setTimeLeft(120);
      refundProcessedRef.current = false;

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer expired - show modal
            if (timerRef.current) clearInterval(timerRef.current);
            setWaitingForDoctor(false);
            setShowNoResponseModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error booking consultation:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        t('failed_to_book_consultation') || 'Failed to book consultation';
      Toastify.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Setup Pusher listener to detect acceptance while waiting here
  useEffect(() => {
    if (!waitingForDoctor || !consultationIdRef.current || !patientID) {
      console.log('📞 [ConsultationPayment] Skipping Pusher setup:', {
        waitingForDoctor,
        consultationId: consultationIdRef.current,
        patientID,
      });
      return;
    }

    console.log('📞 [ConsultationPayment] Setting up Pusher listener for consultation:', consultationIdRef.current);

    pusherService.initialize();
    const channelName = `patient-consultation${patientID}`;

    const handleConsultationUpdate = (data: any) => {
      console.log('📞 [ConsultationPayment] Consultation update received:', data);
      
      // Skip if already processed
      if (refundProcessedRef.current) {
        console.log('📞 [ConsultationPayment] Already processed, skipping');
        return;
      }

      const consultation = data?.consultation || data?.message || data;
      const consultationStatus = consultation?.status || data?.status;
      const isAcceptedStatus = consultationStatus === 'Accepted' || consultationStatus === 'accepted' || consultationStatus === 'Pending' || consultationStatus === 'pending' || consultationStatus === 'Booked' || consultationStatus === 'booked';
      const consultationIdFromEvent = consultation?.id || data?.consultationID || data?.id;

      console.log('📞 [ConsultationPayment] Check:', {
        isAcceptedStatus,
        eventConsultationId: consultationIdFromEvent,
        ourConsultationId: consultationIdRef.current,
        match: consultationIdFromEvent?.toString() === consultationIdRef.current?.toString(),
      });

      if (isAcceptedStatus && consultationIdFromEvent?.toString() === consultationIdRef.current?.toString()) {
        console.log('✅ [ConsultationPayment] MATCH! Doctor accepted - navigating now!');
        
        // Mark as processed FIRST to prevent duplicate handling
        refundProcessedRef.current = true;
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        const doctorData = consultation?.doctor || data?.doctor;
        const clinicData = consultation?.clinic || data?.clinic;
        const consultationType = consultation?.type || consultationData.consultationTypeId || 'chat';

        console.log('✅ [ConsultationPayment] Navigation details:', {
          consultationType,
          doctorName: doctorData?.name,
          doctorId: doctorData?.id,
          recipientID: doctorData?.id || consultation?.doctorID,
        });

        // Show toast
        Toastify.success('Doctor has accepted your consultation!');

        // Navigate immediately - don't wait for setWaitingForDoctor
        const recipientID = String(doctorData?.id || consultation?.doctorID || '');
        const userId = patientID ? `patient_${patientID}` : `patient_${Date.now()}`;
        const consultationId = `consultation_${consultationIdRef.current}`;

        if (consultationType === 'Audio' || consultationType === 'audio') {
          console.log('🎤 [ConsultationPayment] Navigating to AudioConsultation');
          navigation.replace('AudioConsultation', {
            consultationId: consultationId,
            userId: userId,
            isInitiator: true,
            recipientID: recipientID,
            doctorInfo: {
              id: recipientID,
              name: doctorData?.name || 'Doctor',
              avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
              specialization: doctorData?.specialization || '',
            },
          });
        } else if (consultationType === 'Video' || consultationType === 'video') {
          console.log('📹 [ConsultationPayment] Navigating to VideoConsultation');
          navigation.replace('VideoConsultation', {
            consultationId: consultationId,
            userId: userId,
            isInitiator: true,
            recipientID: recipientID,
            doctorInfo: {
              id: recipientID,
              name: doctorData?.name || 'Doctor',
              avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
              specialization: doctorData?.specialization || '',
            },
          });
        } else {
          console.log('💬 [ConsultationPayment] Navigating to ChatScreen');
          navigation.replace('ChatScreen', {
            chatType: 'doctor',
            consultationID: consultationIdRef.current,
            recipientID: recipientID,
            doctorInfo: {
              id: recipientID,
              name: doctorData?.name || 'Doctor',
              avatar: doctorData?.image ? { uri: doctorData.image } : 'https://i.pravatar.cc/150?img=12',
              specialization: doctorData?.specialization || '',
            },
            clinicInfo: {
              name: clinicData?.name || clinicData?.clinicName || 'Clinic',
              location: clinicData?.location || '',
              image: clinicData?.image ? { uri: clinicData.image } : undefined,
            },
            fromHistory: false,
          });
        }

        // Clear waiting state after navigation
        setTimeout(() => {
          setWaitingForDoctor(false);
        }, 100);
      }
    };

    console.log(`📞 [ConsultationPayment] Binding listener on channel: ${channelName}`);
    pusherService.bind(channelName, 'consultation-patient', handleConsultationUpdate);

    return () => {
      console.log(`📞 [ConsultationPayment] Cleaning up Pusher listener on channel: ${channelName}`);
      pusherService.unbind(channelName, 'consultation-patient');
      pusherService.unsubscribe(channelName);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [waitingForDoctor, patientID, navigation]);

  // User initiated refund from modal
  const handleUserInitiatedRefund = useCallback(async () => {
    if (refundProcessedRef.current || !consultationIdRef.current) return;

    refundProcessedRef.current = true;
    setShowNoResponseModal(false);

    try {
      const response = await apiClient.post(API.CONSULTATIONS.REFUND_CONSULTATION, {
        consultationID: consultationIdRef.current,
      });

      if (response.data?.success !== false) {
        Toastify.success(response.data?.message || 'Refund has been initiated');
      } else {
        Toastify.error(response.data?.message || 'Failed to initiate refund');
      }
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      Toastify.error(error?.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setTimeout(() => {
        navigation.replace('EntryPoint');
      }, 800);
    }
  }, []);

  const getHeaderTitle = () => {
    if (consultationType === 'chat') return t('chat_consultation');
    if (consultationType === 'audio') return t('audio_consultation');
    if (consultationType === 'video') return t('video_consultation');
    return t('consultation');
  };

  const HandleRequest = () => {
    setTimeout(() => {
      setShowErrorModal(false);
      setToast({
        visible: true,
        message: t('request_submit'),
        type: 'success',
      });

      setTimeout(() => {
        navigation.navigate('EntryPoint');
      }, 1500);
    }, 3000);
  };

  const hideToast = (): void => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title={getHeaderTitle()} />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={3000}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!waitingForDoctor}
      >
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            {consultationData.message || t('doctors_available')}
          </Text>
        </View>

        {/* Consultation Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{t('consultation_summary')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('consultation_type')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.consultationType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('duration')}</Text>
            <Text style={styles.summaryValue}>{consultationData.duration}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('price')}</Text>
            <Text style={styles.summaryValue}>{consultationData.price}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service_type')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceType}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service_group')}</Text>
            <Text style={styles.summaryValue}>
              {consultationData.serviceGroup}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('service')}</Text>
            <Text style={[styles.summaryValue, styles.serviceValue]}>
              {consultationData.service}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{consultationData.price}</Text>
          </View>
        </View>

        {/* Payment Method Component */}
        <PaymentMethod
          selectedPayment={selectedPayment}
          onPaymentChange={handlePaymentChange}
          cardholderName={cardholderName}
          onCardholderNameChange={setCardholderName}
          cardNumber={cardNumber}
          onCardNumberChange={setCardNumber}
          expiryDate={expiryDate}
          onExpiryDateChange={setExpiryDate}
          cvv={cvv}
          onCvvChange={setCvv}
          showTitle={true}
          compact={false}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Waiting overlay shown after successful booking instead of navigating */}
      {waitingForDoctor && (
        <View style={styles.loadingOverlay}>
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: "#ffff", marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
              Connecting you with doctor.{"\n"}This may take a moment.
            </Text>
            <Text style={{ color: colors.secondaryText, marginTop: 12, fontSize: 14 }}>
              Time Remaining: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      )}

      <NoResponseModal
        visible={showNoResponseModal}
        onClose={() => setShowNoResponseModal(false)}
        onGetPrescription={handleUserInitiatedRefund}
      />

      <View style={styles.bottomContainer}>
        <CustomButton
          title={t('connect_with_doctor')}
          onPress={handleConnectWithDoctor}
          disabled={waitingForDoctor || isLoading}
        />
      </View>

      <SuccessMessageModal
        visible={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          navigation.goBack();
        }}
        title={t('no_answer')}
        description={t('no_answer_description')}
        buttonTitle={t('request_for_refund')}
        buttonPress={HandleRequest}
      />

      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>{t('finding_doctor')}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
