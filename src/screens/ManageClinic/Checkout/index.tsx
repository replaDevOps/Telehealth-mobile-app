import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
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
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mvs } from '@config/metrices';
import { ApplePaySvg, StcPaySvg, TabbySvg, TamaraSvg } from '@assets/icons';
import MasterCardSvg from '@assets/icons/MastercardSvg';
import { CustomTextInput } from '@components/common/CustomTextInput';
import { CustomButton } from '@components/common/CustomButton';
import { styles } from './style';
import { PaymentMethod, SuccessMessageModal } from '@components/molecules'; // Verify this path
import { useTranslation } from 'react-i18next';
import { coinIcon } from '@assets/images';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { Toast } from 'toastify-react-native';
import { useAuthStore } from '@store';

export function CheckoutScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { services = [] } = route.params || {};
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');

  const allPaymentMethods = [
    {
      id: 'credit',
      label: t('credit_debit_card'),
      logo: <MasterCardSvg />,
      type: 'card',
    },
    {
      id: 'applepay',
      label: t('apple_pay'),
      logo: <ApplePaySvg />,
      type: 'digital',
    },
    { id: 'stc', label: t('stc_pay'), logo: <StcPaySvg />, type: 'digital' },
    { id: 'tabby', label: t('tabby'), logo: <TabbySvg />, type: 'installment' },
    {
      id: 'tamara',
      label: t('tamara'),
      logo: <TamaraSvg />,
      type: 'installment',
    },
  ];

  // Calculate totals
  const calculateSubtotal = () => {
    return services.reduce((total, item) => {
      const price = parseFloat(item.service.price.replace(/[^0-9.]/g, ''));
      return total + price;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.15; // 15% tax
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const handleApplyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(10);
    } else if (couponCode.toUpperCase() === 'SAVE20') {
      setDiscount(20);
    } else {
      setDiscount(0);
      // You can show an error message here
      alert(t('invalid_coupon_code'));
    }
  };

  const parseExpiryDate = (expiryDate: string) => {
    // Expected format: MM/YY or MM/YYYY
    const parts = expiryDate.split('/');
    if (parts.length !== 2) {
      return { month: '', year: '' };
    }
    const month = parts[0].trim();
    let year = parts[1].trim();
    // If year is 2 digits, assume 20XX
    if (year.length === 2) {
      year = `20${year}`;
    }
    return { month, year };
  };

  const handleProceedToPayment = async () => {
    // Only allow credit/debit card payment for now
    if (selectedPayment !== 'credit') {
      Toast.error('Only card payment is available at the moment');
      return;
    }

    // Check authentication
    const authState = useAuthStore.getState();
    const token = authState.auth?.token;
    
    if (!token) {
      Toast.error('Please login to proceed with checkout');
      // Optionally navigate to login screen
      // navigation.navigate('SignIn');
      return;
    }

    // Validate payment details
      const { cardholderName, cardNumber, expiryDate, cvv } = cardDetails;
      if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
      Toast.error(t('fill_card_details') || 'Please fill all card details');
      return;
    }

    // Validate expiry date format
    const { month, year } = parseExpiryDate(expiryDate);
    if (!month || !year || month.length !== 2 || year.length !== 4) {
      Toast.error('Please enter expiry date in MM/YY format');
      return;
    }

    setLoading(true);

    try {
      // Prepare checkout payload
      const payload = {
        paymentMethod: 'stripe',
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
        expMonth: month,
        expYear: year,
        cvc: cvv,
        cardholderName: cardholderName,
        redeemPoints: redeemPoints || '',
      };

      console.log('Checkout payload:', { ...payload, cardNumber: '***', cvc: '***' });
      console.log('Auth token present:', !!token);

      const response = await apiClient.post(API.CHECKOUT.CHECKOUT, payload);

      // Check for success: false in response
      if (response.data?.success === false) {
        const errorMessage = response.data?.message || 'Checkout failed';
        Toast.error(errorMessage);
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // Success
      const successMessage = response.data?.message || 'Payment processed successfully';
      Toast.success(successMessage);
      setShowSuccessModal(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      // Handle 401 Unauthenticated error
      if (error?.status === 401 || error?.response?.status === 401) {
        Toast.error('Session expired. Please login again.');
        
        try {
          // Call logout API
          await apiClient.post(API.AUTH.LOGOUT);
        } catch (logoutError: any) {
          // Even if logout API call fails, proceed with logout
          console.log('Logout API error:', logoutError);
        } finally {
          console.log('Logout API call failed');
          // Clear auth store and navigate to login
          useAuthStore.getState().logout();
          navigation.replace('Auth', { screen: 'SignIn' });
        }
        
        setLoading(false);
        return;
      }

      const errorMessage = 
        error?.response?.data?.message || 
        error?.data?.message ||
        error?.message || 
        'Failed to process payment';
      Toast.error(errorMessage);
      setShowErrorModal(true);
      setLoading(false);
    }
  };
  const HandleRequest = () => {
    console.log('the okay button is pressed');
    setShowSuccessModal(false);
    navigation.goBack();
  };

  // Group services by clinic
  const groupedServices = services.reduce((acc, item) => {
    const clinicId = item.clinic.id;
    if (!acc[clinicId]) {
      acc[clinicId] = {
        clinic: item.clinic,
        services: [],
      };
    }
    acc[clinicId].services.push(item.service);
    return acc;
  }, {});

  const installmentPaymentMethods = allPaymentMethods.filter(
    method => method.type === 'installment',
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('checkout')} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Render services grouped by clinic */}
        {Object.values(groupedServices).map((group: any) => (
          <View
            key={group.clinic.id}
            style={{
              backgroundColor: colors.gray,
              margin: 20,
              borderRadius: 10,
            }}
          >
            {/* Clinic Card */}
            <View style={styles.clinicCard}>
              <Image
                source={group.clinic.image}
                resizeMode="cover"
                style={styles.clinicImage}
              />
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{group.clinic.name}</Text>
                <Text style={styles.clinicLocation}>
                  {group.clinic.location}, 2.2km
                </Text>
              </View>
            </View>

            {/* Services from this clinic */}
            {group.services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceLeft}>
                  <Image source={service.image} style={styles.serviceImage} />
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceBadges}>
                      <View style={styles.categoryBadge}>
                        <Text
                          style={styles.categoryBadgeText}
                          numberOfLines={1}
                        >
                          {service.type}
                        </Text>
                      </View>
                      <View style={styles.nameBadge}>
                        <Text style={styles.nameBadgeText} numberOfLines={1}>
                          {service.serviceGroup}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {service.serviceName}
                    </Text>
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

            <View style={styles.pointsContainer}>
              <Image source={coinIcon} style={{ width: 16, height: 16 }} />
              <Text style={styles.bonusInstruction}>
                {t('you_will_earn_10_coins_for_this_appointment')}
              </Text>
            </View>
          </View>
        ))}

        {/* Payment Methods Section - Only show card form for credit card */}
        <PaymentMethod
          selectedPayment="credit" // Force credit card selection
          onPaymentChange={(payment) => {
            // Only allow credit card, ignore other selections
            if (payment !== 'credit') {
              Toast.error('Only card payment is available at the moment');
              return;
            }
            setSelectedPayment(payment);
          }}
          cardholderName={cardDetails.cardholderName}
          onCardholderNameChange={text =>
            setCardDetails(prev => ({ ...prev, cardholderName: text }))
          }
          cardNumber={cardDetails.cardNumber}
          onCardNumberChange={text =>
            setCardDetails(prev => ({ ...prev, cardNumber: text }))
          }
          expiryDate={cardDetails.expiryDate}
          onExpiryDateChange={text =>
            setCardDetails(prev => ({ ...prev, expiryDate: text }))
          }
          cvv={cardDetails.cvv}
          onCvvChange={text => setCardDetails(prev => ({ ...prev, cvv: text }))}
          showTitle={true}
          compact={true}
          showRoyaltyPoints={true}
          royaltyPoints={300}
          pointsToRedeem={redeemPoints}
          onPointsToRedeemChange={setRedeemPoints}
          onApplyCoupon={code => console.log('Apply', code)}
          showCouponCode
        />

        {/* Pay in Installments - Disabled for now */}
        {/* {installmentPaymentMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>
              {t('pay_in_installments')}
            </Text>

            {installmentPaymentMethods.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  selectedPayment === option.id && styles.paymentOptionSelected,
                ]}
                onPress={() => setSelectedPayment(option.id)}
              >
                <View style={styles.radioContainer}>
                  <View style={styles.radioOuter}>
                    {selectedPayment === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.paymentLabel}>{option.label}</Text>
                </View>
                {option.logo}
              </TouchableOpacity>
            ))}
          </View>
        )} */}

        {/* Coupon Code Section */}
        <View style={styles.couponSection}>
          <CustomTextInput
            label={t('coupon_code')}
            placeholder={t('enter_coupon_code')}
            value={couponCode}
            onChangeText={setCouponCode}
            containerStyle={styles.couponInput}
          />
          <CustomButton
            title={t('apply_code')}
            onPress={handleApplyCoupon}
            style={{ backgroundColor: colors.black, marginHorizontal: mvs(15) }}
            textStyle={{ color: colors.white }}
          />
          {discount > 0 && (
            <Text style={styles.discountAppliedText}>
              ✓ {discount}% {t('discount_applied')}!
            </Text>
          )}
        </View>

        {/* Appointment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>{t('appointment_summary')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('no_of_services')}</Text>
            <Text style={styles.summaryValue}>{services.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} SAR</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('tax')} (15%)</Text>
            <Text style={styles.summaryValue}>{tax.toFixed(2)} SAR</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t('discount')} ({discount}%)
              </Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -{discountAmount.toFixed(2)} SAR
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} SAR</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.proceedButton, loading && { opacity: 0.7 }]}
          onPress={handleProceedToPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
          <Text style={styles.proceedButtonText}>
            {t('proceed_to_payment')}
          </Text>
          )}
        </TouchableOpacity>
      </View>

      <SuccessMessageModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        title={t('request_send')}
        description={t('request_sent_description')}
        buttonTitle={t('okay')}
        buttonPress={HandleRequest}
      />

      <SuccessMessageModal
        visible={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          navigation.goBack();
        }}
        title={t('payment_failed')}
        description={t('payment_failed_Description')}
        buttonTitle={t('okay')}
        buttonPress={HandleRequest}
      />
    </SafeAreaView>
  );
}
