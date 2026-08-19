import { Header2 } from '@components/common/Header2';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CheckboxWithText } from '@components/common/CheckboxWithText';
import {
  PaymentMethod,
  SuccessMessageModal,
  SavedCardsSection,
  InlineHyperPayWidget,
  InlineHyperPayWidgetRef,
} from '@components/molecules';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import {
  prepareCartCheckout,
  getSavedCards,
  deleteSavedCard,
} from '@services/payments/hyperpayService';
import {
  EMPTY_BILLING,
  buildBillingPrefill,
  loadCachedBilling,
  saveCachedBilling,
  validateBilling,
  splitName,
} from '@utils/billingDetails';
import type { BillingDetails, SavedCard, PrepareResponseData } from '../../../types/payment.types';
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
  // Tokenise the card at HyperPay so the next checkout can reuse it.
  const [saveCard, setSaveCard] = useState(false);
  // Saved cards from backend
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Fetch saved cards on mount
  useEffect(() => {
    let active = true;
    getSavedCards().then(cards => {
      if (!active) return;
      setSavedCards(cards);
      const defaultCard = cards.find(c => c.is_default);
      if (defaultCard) {
        setSelectedCardId(defaultCard.id);
      } else if (cards.length > 0) {
        setSelectedCardId(cards[0].id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteSavedCard = useCallback(async (cardId: number) => {
    try {
      await deleteSavedCard(cardId);
      setSavedCards(prev => prev.filter(c => c.id !== cardId));
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
    } catch (e) {
      console.warn('[Checkout] Failed to delete card:', e);
    }
  }, [selectedCardId]);

  // The input clamps to what the user can actually spend, so the stored value
  // never exceeds their balance. This remembers that they asked for more, so
  // the inline "Insufficient coins" notice still has something to react to.
  const [attemptedOverBalance, setAttemptedOverBalance] = useState(false);

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
  const subtotal = groupServicePrice > 0 ? groupServicePrice : itemsSubtotal;
  const campaignDiscountTotal = groupCampaignDiscount > 0
    ? groupCampaignDiscount
    : calculateCampaignDiscount();
  const isSaudi =
    profileData?.country?.toUpperCase() === 'SA' ||
    profileData?.country?.toLowerCase() === 'saudi arabia' ||
    profileData?.nationality?.toLowerCase() === 'saudi';
  const TAX_RATE = isSaudi ? 0 : 0.15;
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
    // Digits only. The keyboard is numeric but text can still be pasted, and
    // anything unparseable used to be silently coerced to 0.
    const digits = value.replace(/[^0-9]/g, '');

    // An empty field stays empty. Coercing '' to 0 wrote "0" back into a
    // controlled input, so the field could never be cleared.
    if (digits === '') {
      setRedeemPoints('');
      setAttemptedOverBalance(false);
      return;
    }

    const requested = Number(digits);

    // Recompute max redeemable coins based on current amounts
    const maxRedemptionSAR = Math.max(0, subtotal - campaignDiscountTotal + tax - discountAmount);
    const maxRedeemableCoinsLocal = Math.floor(maxRedemptionSAR / COIN_TO_SAR);
    const limit = Math.max(0, Math.min(userLoyaltyPoints, maxRedeemableCoinsLocal));

    // Clamp instead of rejecting. Rejecting fired a toast on every keystroke
    // past the limit and froze the field at its previous value; the
    // "Redemption ... | Remaining Amount ..." line under the input already
    // reports exactly what was applied.
    setAttemptedOverBalance(requested > userLoyaltyPoints);
    setRedeemPoints(String(Math.min(requested, limit)));
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

  const [inlineWidgetData, setInlineWidgetData] = useState<PrepareResponseData | null>(null);
  const [loadingWidget, setLoadingWidget] = useState(false);
  const [isCardFormFilled, setIsCardFormFilled] = useState(false);
  const inlineWidgetRef = useRef<InlineHyperPayWidgetRef>(null);

  // Fetch inline HyperPay COPYandPAY widget for active selection (New Card or Saved Card)
  const loadInlineWidget = useCallback(async () => {
    setLoadingWidget(true);
    try {
      const { first_name, last_name } = splitName(profileData?.name);
      const prepareBilling = {
        first_name: first_name || 'Vena',
        last_name: last_name || 'Patient',
        email: profileData?.email || 'patient@example.com',
        phone: profileData?.phoneNo || '0500000000',
        billing_street1: 'King Fahd Rd',
        billing_city: profileData?.city || 'Riyadh',
        billing_state: profileData?.city || 'Riyadh',
        billing_country: 'SA',
        billing_postcode: '12211',
      };

      const selectedCardObj = savedCards.find(c => c.id === selectedCardId);
      const preparePayload: PrepareCartPayload = {
        purpose: 'cart',
        redeem_points: appliedCoins,
        ...(selectedCardId !== null
          ? {
            saved_card_id: selectedCardId,
            card_id: selectedCardId,
            registration_id: selectedCardObj?.registration_id || selectedCardId,
          }
          : { save_card: saveCard }),
        ...prepareBilling,
      };

      const data = await prepareCartCheckout(preparePayload);
      setInlineWidgetData(data);
    } catch (e) {
      console.warn('[Checkout] Auto-prepare inline widget error:', e);
    } finally {
      setLoadingWidget(false);
    }
  }, [selectedCardId, savedCards, profileData, appliedCoins, saveCard]);

  useEffect(() => {
    loadInlineWidget();
  }, [loadInlineWidget]);

  const handleProceedToPayment = async () => {
    const token = useAuthStore.getState().auth?.token;
    if (!token) {
      Toast.error(t('please_login_to_checkout'));
      return;
    }

    if (insufficientCoins) {
      Toast.error(t('insufficient_coins'));
      return;
    }

    if (redemptionCoinsInput > maxRedeemableCoins) {
      Toast.error(t('redeem_exceeds_total'));
      return;
    }

    // Submit form and navigate immediately to PaymentStatus screen for both New Card and Saved Card
    if (inlineWidgetData?.payment_id) {
      if (inlineWidgetRef.current) {
        inlineWidgetRef.current.submitForm();
      }
      navigation.navigate('PaymentStatus', {
        paymentId: inlineWidgetData.payment_id,
        expectedAmount: total,
      });
    } else {
      loadInlineWidget();
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

        {/* Royalty Points Section */}
        <PaymentMethod
          variant="card-only"
          hidePaymentOptions={true}
          showTitle={true}
          compact={true}
          showRoyaltyPoints={true}
          royaltyPoints={clinicLoyaltyPoints}
          pointsToRedeem={redeemPoints}
          onPointsToRedeemChange={handlePointsToRedeemChange}
          coinToSar={COIN_TO_SAR}
          maxRedemptionSAR={maxRedemptionSAR}
        />

        {/* Saved Cards Selection */}
        <SavedCardsSection
          cards={savedCards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          saveCard={saveCard}
          onSaveCardChange={setSaveCard}
          hideSaveCard={true}
        />

        {/* Inline HyperPay COPYandPAY Widget directly on Checkout screen */}
        {selectedCardId === null && (
          <View style={{ marginVertical: 4 }}>
            {loadingWidget ? (
              <View style={{ height: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ marginTop: 8, fontSize: 13, color: colors.secondaryText }}>
                  {t('loading_payment_widget') || 'Loading payment form...'}
                </Text>
              </View>
            ) : inlineWidgetData?.widget_url && inlineWidgetData?.result_url ? (
              <InlineHyperPayWidget
                ref={inlineWidgetRef}
                widgetUrl={inlineWidgetData.widget_url}
                resultUrl={inlineWidgetData.result_url}
                integrity={inlineWidgetData.integrity}
                brands={inlineWidgetData.brands}
                paymentId={inlineWidgetData.payment_id}
                expectedAmount={total}
                onHandOffToStatus={(pid, amt) =>
                  navigation.replace('PaymentStatus', {
                    paymentId: pid,
                    expectedAmount: amt || total,
                  })
                }
                onCardFormFilled={setIsCardFormFilled}
              />
            ) : null}

            {/* Save Card Checkbox AFTER the Widget */}
            {selectedCardId === null && (
              <View style={{ marginHorizontal: 16, marginTop: 10, marginBottom: 12 }}>
                <CheckboxWithText
                  isChecked={saveCard}
                  onToggle={() => setSaveCard(!saveCard)}
                >
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>
                    {t('save_card_for_future') || 'Save this card for future payments'}
                  </Text>
                </CheckboxWithText>
              </View>
            )}
          </View>
        )}


        {attemptedOverBalance && (
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
