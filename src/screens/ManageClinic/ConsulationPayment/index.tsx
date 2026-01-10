import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
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

export function ConsultationPayment({ navigation, route }) {
  const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'applepay' | 'stc' | 'tabby' | 'tamara'>('credit');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      Toastify.success(successMessage);

      // Extract consultation data from response
      // Response structure: { success: true, message: '...', consultation: { id: 28, ... } }
      const consultationResponse = response.data?.consultation || response.data?.data || response.data;
      const consultationID = consultationResponse?.id || response.data?.consultationID;
      
      console.log('Consultation booked successfully. ID:', consultationID);
      console.log('Waiting for doctor to accept consultation...');

      // Navigate to waiting screen - will handle Pusher events and timeout
      setTimeout(() => {
        navigation.navigate('WaitingForDoctor', {
          consultationID: consultationID,
          consultationType: consultationData.consultationTypeId || 'chat',
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

      <View style={styles.bottomContainer}>
        <CustomButton
          title={t('connect_with_doctor')}
          onPress={handleConnectWithDoctor}
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
