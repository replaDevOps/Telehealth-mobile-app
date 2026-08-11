import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './style';
import ClinicAvatar from '@components/common/ClinicAvatar';
import {
  PaymentMethod,
  SuccessMessageModal,
  BillingDetailsForm,
} from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { prepareCartCheckout } from '@services/payments/hyperpayService';
import {
  EMPTY_BILLING,
  buildBillingPrefill,
  loadCachedBilling,
  saveCachedBilling,
  validateBilling,
} from '@utils/billingDetails';
import type { BillingDetails } from '../../../types/payment.types';
import { Toast } from 'toastify-react-native';
import { useAuthStore, useProfileStore } from '@store';

export function CheckoutScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
    const formatted = isNaN(num) ? '0.00' : num.toFixed(2);
    return isArabic ? `${formatted} ر.س` : `SAR ${formatted}`;
  };
  const insets = useSafeAreaInsets();
  const { profileData, fetchProfile, currencyValuePerPoint } = useProfileStore();
  const { services = [], totalLoyaltyPoints = 0 } = route.params || {};
  const groupServicePrice = Number(route.params?.groupServicePrice || 0);
  const groupCampaignDiscount = Number(route.params?.groupCampaignDiscount || 0);
  const groupTotalPrice = Number(route.params?.groupTotalPrice || 0);
  const clinicLoyaltyPointsParam = route.params?.clinicLoyaltyPoints;
  const clinicLoyaltyPoints = clinicLoyaltyPointsParam
    ? typeof clinicLoyaltyPointsParam === 'string'
      ? parseInt(clinicLoyaltyPointsParam, 10) || 0
      : Number(clinicLoyaltyPointsParam) || 0
    : 0;

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Prefill billing once the profile is available: profile owns identity
  // fields, the cache owns the address.
  useEffect(() => {
    let cancelled = false;

    loadCachedBilling().then(cached => {
      if (!cancelled) setBilling(buildBillingPrefill(profileData, cached));
    });

    return () => {
      cancelled = true;
    };
  }, [profileData]);

  const userLoyaltyPoints = profileData?.loyaltyPoints
    ? typeof profileData.loyaltyPoints === 'string'
      ? parseInt(profileData.loyaltyPoints, 10) || 0
      : Number(profileData.loyaltyPoints) || 0
    : 0;
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [billing, setBilling] = useState<BillingDetails>(EMPTY_BILLING);
  const [invalidFields, setInvalidFields] = useState<(keyof BillingDetails)[]>(
    [],
  );
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');

  // Calculate totals
  const calculateSubtotal = () => {
    return services.reduce((total, item) => {
      const price = parseFloat(String(item.service.price).replace(/[^0-9.]/g, ''));
      return total + price;
    }, 0);
  };

  const calculateCampaignDiscount = () => {
    return services.reduce((total, item) => {
      return total + Number(item.service?.campaignDiscount || 0);
    }, 0);
  };

  const itemsSubtotal = calculateSubtotal();
  // Prefer clinic-level group values from the cart payload (the API exposes
  // campaignDiscount/servicePrice/totalPrice at the clinic group level, not per item).
  // Fall back to per-item summation when the group values aren't provided.
  const subtotal = groupServicePrice > 0 ? groupServicePrice : itemsSubtotal;
  const campaignDiscountTotal = groupCampaignDiscount > 0
    ? groupCampaignDiscount
    : calculateCampaignDiscount();
  // groupTotalPrice (post-discount, pre-tax) is informational — totals are recomputed below.
  void groupTotalPrice;
  // Apply 15% tax only for non-Saudi users
  const isNonSaudi = profileData?.nationality && String(profileData.nationality).toLowerCase() === 'non_saudi';
  const TAX_RATE = isNonSaudi ? 0.15 : 0;
  // Tax is calculated on the post-campaign-discount subtotal
  const taxableBase = Math.max(0, subtotal - campaignDiscountTotal);
  const tax = taxableBase * TAX_RATE;
  const discountAmount = subtotal * (discount / 100);

  // Loyalty conversion: prefer server-provided `currencyValuePerPoint`, fallback to 0.05 SAR per coin
  const parsedCurrencyPerPoint = Number(String(currencyValuePerPoint ?? '').replace(/,/g, '.'));
  const COIN_TO_SAR = parsedCurrencyPerPoint > 0 ? parsedCurrencyPerPoint : 5 / 100;

  // `redeemPoints` input is number of coins the user wants to redeem
  const redemptionCoinsInput = Math.max(0, Math.floor(Number(redeemPoints) || 0));

  // Maximum amount (SAR) that can be redeemed against the remaining payable amount
  const maxRedemptionSAR = Math.max(0, subtotal - campaignDiscountTotal + tax - discountAmount); // Updated to use new tax calculation
  // Convert SAR limit to maximum redeemable coins
  const maxRedeemableCoins = Math.floor(maxRedemptionSAR / COIN_TO_SAR);

  const insufficientCoins = redemptionCoinsInput > userLoyaltyPoints;

  // Applied coins are limited by user's balance and by the payable amount
  const appliedCoins = insufficientCoins ? 0 : Math.min(redemptionCoinsInput, maxRedeemableCoins);
  const appliedRedemptionAmount = appliedCoins * COIN_TO_SAR; // SAR value

  const total = subtotal - campaignDiscountTotal + tax - discountAmount - appliedRedemptionAmount;

  // Handler to validate points input from UI
  const handlePointsToRedeemChange = (value: string) => {
    // Normalize to integer coins
    const coins = Math.max(0, Math.floor(Number(value) || 0));

    // Recompute max redeemable coins based on current amounts
    const maxRedemptionSAR = Math.max(0, subtotal - campaignDiscountTotal + tax - discountAmount);
    const maxRedeemableCoinsLocal = Math.floor(maxRedemptionSAR / COIN_TO_SAR);

    if (coins > userLoyaltyPoints) {
      Toast.error(t('insufficient_coins') || 'You do not have enough coins');
      return;
    }

    if (coins > maxRedeemableCoinsLocal) {
      Toast.error(t('redeem_exceeds_total') || 'Redeem amount exceeds remaining payable total');
      return;
    }

    // Accept value (store as string to preserve controlled input behavior)
    setRedeemPoints(String(coins));
  };

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

  const handleProceedToPayment = async () => {
    const token = useAuthStore.getState().auth?.token;
    if (!token) {
      Toast.error(t('please_login_to_checkout'));
      return;
    }

    const invalid = validateBilling(billing);
    if (invalid.length > 0) {
      setInvalidFields(invalid);
      Toast.error(t('fill_billing_details'));
      return;
    }
    setInvalidFields([]);

    if (insufficientCoins) {
      Toast.error(t('insufficient_coins'));
      return;
    }

    if (redemptionCoinsInput > maxRedeemableCoins) {
      Toast.error(t('redeem_exceeds_total'));
      return;
    }

    setLoading(true);

    try {
      await saveCachedBilling(billing);

      // The amount is computed server-side from the cart. `total` on this
      // screen is a preview only and is deliberately not sent.
      const checkout = await prepareCartCheckout({
        purpose: 'cart',
        redeem_points: appliedCoins,
        ...billing,
        billing_country: billing.billing_country.toUpperCase(),
      });

      setLoading(false);
      navigation.navigate('PaymentWebView', {
        paymentUrl: checkout.payment_url,
        paymentId: checkout.payment_id,
        expectedAmount: total,
      });
    } catch (error: any) {
      setLoading(false);
      console.error('[Checkout] prepare failed', error);

      if (error?.status === 401) {
        Toast.error(t('session_expired_login_again'));
        try {
          await apiClient.post(API.AUTH.LOGOUT);
        } catch (logoutError) {
          console.log('Logout API error:', logoutError);
        } finally {
          useAuthStore.getState().logout();
          navigation.replace('Auth', { screen: 'SignIn' });
        }
        return;
      }

      if (error?.status === 422) {
        Toast.error(error?.message || t('payment_failed_Description'));
        return;
      }

      setShowErrorModal(true);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header2 title={t('checkout')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Render services grouped by clinic */}
        {Object.values(groupedServices).map((group: any) => (
          <View
            key={group.clinic.id}
            style={{
              backgroundColor: colors.gray,
              margin: 10,
              borderRadius: 10,
            }}
          >
            {/* Clinic Card */}
            <View style={styles.clinicCard}>
              {group.clinic.image ? (
                <Image
                  source={group.clinic.image}
                  resizeMode="cover"
                  style={styles.clinicImage}
                />
              ) : (
                <ClinicAvatar name={group.clinic.name} size={56} style={styles.clinicImage} />
              )}
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{group.clinic.name}</Text>
                <Text style={styles.clinicLocation}>
                  {group.clinic.address || group.clinic.location || ''}{group.clinic.distance ? `, ${group.clinic.distance}` : ''}
                </Text>
              </View>
            </View>

            {/* Services from this clinic */}
            {group.services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                 <View style={styles.serviceBadges}>
                      <View style={styles.categoryBadge}>
                        <Text
                          style={styles.categoryBadgeText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {service.type}
                        </Text>
                      </View>
                      <View style={styles.nameBadge}>
                        <Text style={styles.nameBadgeText} numberOfLines={1} ellipsizeMode="tail">
                          {service.serviceGroup}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.serviceContent}>
                <View style={styles.serviceLeft}>
                  <Image source={service.image} style={styles.serviceImage} />
                  <View style={styles.serviceInfo}>
                   
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
                {Number(service.campaignDiscount || 0) > 0 && service.finalPrice !== undefined && service.finalPrice !== null ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.servicePrice, { fontSize: 12, color: '#888', textDecorationLine: 'line-through', fontWeight: '400' }]}>
                      {service.price}
                    </Text>
                    <Text style={styles.servicePrice}>{formatCurrency(service.finalPrice)}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#16a34a', marginTop: 2 }}>
                      {isArabic ? `-${Number(service.campaignDiscount).toFixed(2)} ر.س` : `-SAR ${Number(service.campaignDiscount).toFixed(2)}`}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.servicePrice}>{formatCurrency(service.finalPrice || service.rawPrice || service.price)}</Text>
                )}
                </View>
              </View>
            ))}

            <View style={styles.bonusInstructionContainer}>
              <Text style={[styles.bonusInstruction, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>
                {t('you_will_earn_coins_for_this_appointment', {
                  count: totalLoyaltyPoints,
                })}
              </Text>
            </View>
          </View>
        ))}

        {/* Payment Methods Section - Only show card form for credit card */}
        <PaymentMethod
          variant="card-only"
          showTitle={true}
          compact={true}
          showRoyaltyPoints={true}
          royaltyPoints={clinicLoyaltyPoints}
          pointsToRedeem={redeemPoints}
          onPointsToRedeemChange={handlePointsToRedeemChange}
          coinToSar={COIN_TO_SAR}
          maxRedemptionSAR={maxRedemptionSAR}
        />

        <BillingDetailsForm
          value={billing}
          onChange={setBilling}
          invalidFields={invalidFields}
        />


        {insufficientCoins && (
          <View style={{ marginHorizontal: 20, marginTop: 8 }}>
            <Text style={styles.insufficientText}>{t('insufficient_coins') || 'Insufficient coins'}</Text>
          </View>
        )}




        {/* Appointment Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>{t('appointment_summary')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('no_of_services')}</Text>
            <Text style={styles.summaryValue}>{services.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

      

          <View style={styles.summaryRow}>
            {TAX_RATE > 0 && (
              <>
                <Text style={styles.summaryLabel}>{t('tax')}</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
              </>
            )}
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('discount')}</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>
            {isArabic ? `-${campaignDiscountTotal.toFixed(2)} ر.س` : `-SAR ${campaignDiscountTotal.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('redemption')}</Text>
            <Text style={[styles.summaryValue, appliedRedemptionAmount > 0 ? styles.redemptionValue : null]}>
              {appliedRedemptionAmount > 0
                ? (isArabic ? `-${appliedRedemptionAmount.toFixed(2)} ر.س` : `-SAR ${appliedRedemptionAmount.toFixed(2)}`)
                : formatCurrency(0)}
            </Text>
          </View>


        </View>



        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: 20 + insets.bottom }]}>
        <View style={styles.bottomInfoRow}>
          <Text style={styles.totalAmountText}>
            {t('total_amount') || 'Total Amount'}{' '}
            <Text style={styles.inclTaxText}>({t('incl_tax') || 'incl tax'})</Text>
          </Text>
          <Text style={styles.totalAmountValue}>{formatCurrency(total)}</Text>
        </View>

        {(discountAmount > 0 || appliedRedemptionAmount > 0 || campaignDiscountTotal > 0) && (
          <View style={styles.summaryTriggerRow}>
            <TouchableOpacity>
              {/* <Text style={styles.summaryTriggerText}>
                {t('appointment_summary') || 'Appointment Summary'}
              </Text> */}
            </TouchableOpacity>
            <Text style={styles.originalSubtotal}>{formatCurrency(subtotal + tax)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.proceedButton, loading && { opacity: 0.7 }]}
          onPress={handleProceedToPayment}
          disabled={loading}
        >
          <Text style={styles.proceedButtonText}>
            {t('continue_to_payment')}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessMessageModal
        visible={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
        }}
        title={t('payment_failed')}
        description={t('payment_failed_Description')}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
