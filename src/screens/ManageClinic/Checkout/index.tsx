import { Header2 } from '@components/common/Header2';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
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
import { PaymentMethod } from '@components/molecules'; // Verify this path
import { useTranslation } from 'react-i18next';
import { coinIcon } from '@assets/images';

export function CheckoutScreen({ route }) {
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

  const handleProceedToPayment = () => {
    // Validate payment details if credit card is selected
    if (selectedPayment === 'credit') {
      const { cardholderName, cardNumber, expiryDate, cvv } = cardDetails;
      if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
        alert(t('fill_card_details'));
        return;
      }
    }

    console.log('Processing payment:', {
      services,
      total,
      selectedPayment,
      cardDetails: selectedPayment === 'credit' ? cardDetails : null,
    });
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
                        <Text style={styles.categoryBadgeText}>
                          {service.type}
                        </Text>
                      </View>
                      <View style={styles.nameBadge}>
                        <Text style={styles.nameBadgeText}>
                          {service.serviceGroup}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.serviceName}>
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
                You will earn 10 coins for this appointment
              </Text>
            </View>
          </View>
        ))}

        {/* Payment Methods Section - Only show card form for credit card */}
        <PaymentMethod
          selectedPayment={selectedPayment}
          onPaymentChange={setSelectedPayment}
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
        />

        {/* Pay in Installments - As separate section */}
        {installmentPaymentMethods.length > 0 && (
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
        )}

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
          style={styles.proceedButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.proceedButtonText}>
            {t('proceed_to_payment')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
