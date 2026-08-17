import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ApplePaySvg,
  MastercardSvg,
  StcPaySvg,
  TabbySvg,
  TamaraSvg,
  SingleLogo,
} from '@assets/icons';
import { colors } from '../../styles/colors';
import { formatCurrency } from '@utils';

// Types
type PaymentType = 'card' | 'digital' | 'installment';
type PaymentMethodId = 'credit' | 'applepay' | 'stc' | 'tabby' | 'tamara';

interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  logo: React.ReactNode;
  type: PaymentType;
}

interface PaymentMethodProps {
  // Payment selection
  selectedPayment?: PaymentMethodId;
  onPaymentChange?: (payment: PaymentMethodId) => void;

  // Card details
  cardholderName?: string;
  onCardholderNameChange?: (text: string) => void;
  cardNumber?: string;
  onCardNumberChange?: (text: string) => void;
  expiryDate?: string;
  onExpiryDateChange?: (text: string) => void;
  cvv?: string;
  onCvvChange?: (text: string) => void;

  // Display options
  showTitle?: boolean;
  compact?: boolean;
  /**
   * 'full' (default) renders every method and the inline card form.
   * 'card-only' renders a single non-interactive card row — used by HyperPay
   * checkout, where card entry happens inside the HyperPay widget.
   */
  variant?: 'full' | 'card-only';

  // Royalty points
  showRoyaltyPoints?: boolean;
  royaltyPoints?: number;
  pointsToRedeem?: string;
  onPointsToRedeemChange?: (text: string) => void;
  onRedeemPoints?: (points: string) => void;
  // Optional conversion props to show SAR/remaining info
  coinToSar?: number;
  maxRedemptionSAR?: number;

  // Coupon code
  showCouponCode?: boolean;
  couponCode?: string;
  onCouponCodeChange?: (text: string) => void;
  onApplyCoupon?: (code: string) => void;
  couponError?: string;
  couponSuccess?: string;
}

export function PaymentMethod({
  selectedPayment: externalSelectedPayment,
  onPaymentChange,
  cardholderName: externalCardholderName,
  onCardholderNameChange,
  cardNumber: externalCardNumber,
  onCardNumberChange,
  expiryDate: externalExpiryDate,
  onExpiryDateChange,
  cvv: externalCvv,
  onCvvChange,
  showTitle = true,
  compact = false,
  variant = 'full',
  showRoyaltyPoints = false,
  royaltyPoints = 0,
  pointsToRedeem: externalPointsToRedeem,
  onPointsToRedeemChange,
  coinToSar = undefined,
  maxRedemptionSAR = undefined,
  showCouponCode = false,
  couponCode: externalCouponCode,
  onCouponCodeChange,
  couponError = '',
  couponSuccess = '',
}: PaymentMethodProps) {
  const { t } = useTranslation();

  // Internal state (used when component is uncontrolled)
  const [internalSelectedPayment, setInternalSelectedPayment] =
    useState<PaymentMethodId>('credit');
  const [internalCardholderName, setInternalCardholderName] = useState('');
  const [internalCardNumber, setInternalCardNumber] = useState('');
  const [internalExpiryDate, setInternalExpiryDate] = useState('');
  const [internalCvv, setInternalCvv] = useState('');
  const [internalPointsToRedeem, setInternalPointsToRedeem] = useState('');
  const [internalCouponCode, setInternalCouponCode] = useState('');

  // Payment method options
  const paymentMethods = useMemo<PaymentMethodOption[]>(
    () => [
      {
        id: 'credit',
        label: t('credit_debit_card'),
        logo: <MastercardSvg />,
        type: 'card',
      },
      {
        id: 'applepay',
        label: t('apple_pay'),
        logo: <ApplePaySvg />,
        type: 'digital',
      },
      {
        id: 'stc',
        label: t('stc_pay'),
        logo: <StcPaySvg />,
        type: 'digital',
      },
      {
        id: 'tabby',
        label: t('tabby'),
        logo: <TabbySvg />,
        type: 'installment',
      },
      {
        id: 'tamara',
        label: t('tamara'),
        logo: <TamaraSvg />,
        type: 'installment',
      },
    ],
    [t],
  );

  // Controlled/uncontrolled values
  const selectedPayment = externalSelectedPayment ?? internalSelectedPayment;
  const cardholderName = externalCardholderName ?? internalCardholderName;
  const cardNumber = externalCardNumber ?? internalCardNumber;
  const expiryDate = externalExpiryDate ?? internalExpiryDate;
  const cvv = externalCvv ?? internalCvv;
  const pointsToRedeem = externalPointsToRedeem ?? internalPointsToRedeem;
  const couponCode = externalCouponCode ?? internalCouponCode;

  // Filtered installment methods
  const installmentMethods = useMemo(
    () => paymentMethods.filter(method => method.type === 'installment'),
    [paymentMethods],
  );

  // Calculate remaining points
  const remainingPoints = useMemo(() => {
    const redeemed = parseInt(pointsToRedeem) || 0;
    return Math.max(0, royaltyPoints - redeemed);
  }, [royaltyPoints, pointsToRedeem]);

  // Redemption calculations when conversion props provided
  const appliedCoins = useMemo(() => Math.max(0, Math.floor(Number(pointsToRedeem) || 0)), [pointsToRedeem]);
  const appliedRedemptionAmount = useMemo(() => {
    if (!coinToSar) return 0;
    return appliedCoins * coinToSar;
  }, [appliedCoins, coinToSar]);
  const maxRedeemableCoins = useMemo(() => {
    if (!coinToSar || !maxRedemptionSAR) return 0;
    return Math.floor(maxRedemptionSAR / coinToSar);
  }, [coinToSar, maxRedemptionSAR]);

  // Event handlers
  const handlePaymentSelect = useCallback(
    (payment: PaymentMethodId) => {
      onPaymentChange?.(payment) ?? setInternalSelectedPayment(payment);
    },
    [onPaymentChange],
  );

  const handleCardholderNameChange = useCallback(
    (text: string) => {
      onCardholderNameChange?.(text) ?? setInternalCardholderName(text);
    },
    [onCardholderNameChange],
  );

  const handleCardNumberChange = useCallback(
    (text: string) => {
      // Strip non-digits
      const digits = text.replace(/\D/g, '');

      // Helper to detect Mastercard BIN ranges: 51-55 or 2221-2720
      const isMastercard = (() => {
        if (digits.length >= 2) {
          const two = parseInt(digits.substring(0, 2), 10);
          if (two >= 51 && two <= 55) return true;
        }
        if (digits.length >= 4) {
          const four = parseInt(digits.substring(0, 4), 10);
          if (four >= 2221 && four <= 2720) return true;
        }
        return false;
      })();

      const maxDigits = isMastercard ? 16 : 19; // enforce 16 digits for MasterCard

      const limited = digits.substring(0, maxDigits);

      // Format into groups of 4: '#### #### #### ####'
      const groups = limited.match(/.{1,4}/g) || [];
      const formatted = groups.join(' ');

      onCardNumberChange?.(formatted) ?? setInternalCardNumber(formatted);
    },
    [onCardNumberChange],
  );

  const handleExpiryDateChange = useCallback(
    (text: string) => {
      // Remove all non-numeric characters
      const numericText = text.replace(/\D/g, '');
      
      // Format as MM/YYYY
      let formattedText = '';
      if (numericText.length > 0) {
        formattedText = numericText.substring(0, 2); // MM
        if (numericText.length > 2) {
          formattedText += '/' + numericText.substring(2, 6); // /YYYY
        }
      }
      
      onExpiryDateChange?.(formattedText) ?? setInternalExpiryDate(formattedText);
    },
    [onExpiryDateChange],
  );

  const handleCvvChange = useCallback(
    (text: string) => {
      onCvvChange?.(text) ?? setInternalCvv(text);
    },
    [onCvvChange],
  );

  const handlePointsToRedeemChange = useCallback(
    (text: string) => {
      const digitsOnly = text.replace(/\D/g, '');
      if (digitsOnly === '') {
        onPointsToRedeemChange?.('') ?? setInternalPointsToRedeem('');
        return;
      }
      const num = parseInt(digitsOnly, 10) || 0;
      const capped = Math.min(num, royaltyPoints);
      const finalValue = String(capped);
      onPointsToRedeemChange?.(finalValue) ?? setInternalPointsToRedeem(finalValue);
    },
    [onPointsToRedeemChange, royaltyPoints],
  );

  const handleCouponCodeChange = useCallback(
    (text: string) => {
      onCouponCodeChange?.(text) ?? setInternalCouponCode(text);
    },
    [onCouponCodeChange],
  );

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {showTitle && <Text style={styles.title}>{t('payment_method')}</Text>}

      {/* Royalty Points Section */}
      {showRoyaltyPoints && (
        <RoyaltyPointsSection
          royaltyPoints={royaltyPoints}
          pointsToRedeem={pointsToRedeem}
          remainingPoints={remainingPoints}
          onPointsChange={handlePointsToRedeemChange}
          t={t}
          coinToSar={coinToSar}
          maxRedemptionSAR={maxRedemptionSAR}
        />
      )}

      {/* One-time Payment Section */}
      <Text style={styles.sectionLabel}>{t('one_time_payment')}</Text>

      {variant === 'card-only' ? (
        <View style={[styles.paymentOption, styles.paymentOptionSelected]}>
          <View style={styles.paymentLeft}>
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
            <Text style={styles.paymentLabel}>
              {t('card_mada_visa_master')}
            </Text>
          </View>
          <MastercardSvg />
        </View>
      ) : (
        <>
          {/* Credit/Debit Card */}
          <PaymentOption
            id="credit"
            label={t('credit_debit_card')}
            logo={<MastercardSvg />}
            isSelected={selectedPayment === 'credit'}
            onSelect={handlePaymentSelect}
          />

          {selectedPayment === 'credit' && (
            <CardDetailsForm
              cardholderName={cardholderName}
              cardNumber={cardNumber}
              expiryDate={expiryDate}
              cvv={cvv}
              onCardholderNameChange={handleCardholderNameChange}
              onCardNumberChange={handleCardNumberChange}
              onExpiryDateChange={handleExpiryDateChange}
              onCvvChange={handleCvvChange}
              t={t}
            />
          )}

          {/* Apple Pay */}
          <PaymentOption
            id="applepay"
            label={t('apple_pay')}
            logo={<ApplePaySvg />}
            isSelected={selectedPayment === 'applepay'}
            onSelect={handlePaymentSelect}
          />

          {/* STC Pay */}
          <PaymentOption
            id="stc"
            label={t('stc_pay')}
            logo={<StcPaySvg />}
            isSelected={selectedPayment === 'stc'}
            onSelect={handlePaymentSelect}
          />

          {/* Installment Methods */}
          {installmentMethods.length > 0 && (
            <View style={styles.installmentSection}>
              <Text style={styles.installmentLabel}>
                {t('pay_in_installments')}
              </Text>
              {installmentMethods.map(method => (
                <PaymentOption
                  key={method.id}
                  id={method.id}
                  label={method.label}
                  logo={method.logo}
                  isSelected={selectedPayment === method.id}
                  onSelect={handlePaymentSelect}
                />
              ))}
            </View>
          )}
        </>
      )}

      {/* Coupon Code Section */}
      {showCouponCode && (
        <CouponCodeSection
          couponCode={couponCode}
          couponError={couponError}
          couponSuccess={couponSuccess}
          onCouponCodeChange={handleCouponCodeChange}
          t={t}
        />
      )}
    </View>
  );
}

// Sub-components for better organization

interface PaymentOptionProps {
  id: PaymentMethodId;
  label: string;
  logo: React.ReactNode;
  isSelected: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

function PaymentOption({
  id,
  label,
  logo,
  isSelected,
  onSelect,
}: PaymentOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentLeft}>
        <View style={styles.radioOuter}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.paymentLabel}>{label}</Text>
      </View>
      {logo}
    </TouchableOpacity>
  );
}

interface CardDetailsFormProps {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  onCardholderNameChange: (text: string) => void;
  onCardNumberChange: (text: string) => void;
  onExpiryDateChange: (text: string) => void;
  onCvvChange: (text: string) => void;
  t: (key: string, options?: any) => string;
}

function CardDetailsForm({
  cardholderName,
  cardNumber,
  expiryDate,
  cvv,
  onCardholderNameChange,
  onCardNumberChange,
  onExpiryDateChange,
  onCvvChange,
  t,
}: CardDetailsFormProps) {
  return (
    <View style={styles.cardForm}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('cardholder_name')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enter_cardholder_name')}
          placeholderTextColor="#9ca3af"
          value={cardholderName}
          onChangeText={onCardholderNameChange}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('card_number')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enter_card_number')}
          placeholderTextColor="#9ca3af"
          value={cardNumber}
          onChangeText={onCardNumberChange}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.inputHalf]}>
          <Text style={styles.inputLabel}>{t('expiry_date')}</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YYYY"
            placeholderTextColor="#9ca3af"
            value={expiryDate}
            onChangeText={onExpiryDateChange}
            keyboardType="number-pad"
            maxLength={7}
          />
        </View>

        <View style={[styles.inputGroup, styles.inputHalf]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="000"
            placeholderTextColor="#9ca3af"
            value={cvv}
            onChangeText={onCvvChange}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>
    </View>
  );
}

interface RoyaltyPointsSectionProps {
  royaltyPoints: number;
  pointsToRedeem: string;
  remainingPoints: number;
  onPointsChange: (text: string) => void;
  t: (key: string, options?: any) => string;
  coinToSar?: number;
  maxRedemptionSAR?: number;
}

function RoyaltyPointsSection({
  royaltyPoints,
  pointsToRedeem,
  remainingPoints,
  onPointsChange,
  t,
  coinToSar,
  maxRedemptionSAR,
}: RoyaltyPointsSectionProps) {
  // `t` arrives as a prop, but formatCurrency below needs the active language
  // too. Reaching for a bare `i18n` here crashed the screen the moment a valid
  // redeem value was entered, because nothing in this file ever defined one.
  const { i18n } = useTranslation();
  const isArabic = !!i18n.language?.startsWith('ar');

  const appliedCoins = Math.max(0, Math.floor(Number(pointsToRedeem) || 0));
  const appliedRedemptionAmount = coinToSar ? appliedCoins * coinToSar : 0;
  return (
    <View style={styles.royaltySection}>
      <View style={styles.royaltyHeader}>
        <Text style={styles.royaltyTitle}>{t('loyalty_points')}</Text>
        <View style={styles.royaltyBadge}>
          <View style={styles.pointsBadge}>
            <View style={styles.coinIcon}>
              <SingleLogo width={20} height={20} fill="#FDA005" />
            </View>
            <Text style={styles.pointsValue}>{royaltyPoints}</Text>
          </View>
          <Text style={styles.conversionRate}>
            {t('points_conversion', {
              sar: coinToSar && coinToSar > 0 ? String(Math.round(coinToSar * 10)) : '20',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('redeem_points')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enter_points')}
          placeholderTextColor="#9ca3af"
          value={pointsToRedeem}
          onChangeText={onPointsChange}
          keyboardType="numeric"
        />
        {appliedCoins > 0 && (
          <Text style={[styles.royaltySubtext, { marginTop: 6 }] }>
            {`${t('redemption') || 'Redemption'} ${formatCurrency(appliedRedemptionAmount, isArabic)} | ${t('remaining_amount') || 'Remaining Amount'} ${formatCurrency(Math.max(0, (maxRedemptionSAR || 0) - appliedRedemptionAmount), isArabic)}`}
          </Text>
        )}
      </View>
    </View>
  );
}

interface CouponCodeSectionProps {
  couponCode: string;
  couponError: string;
  couponSuccess: string;
  onCouponCodeChange: (text: string) => void;
  t: (key: string, options?: any) => string;
}

function CouponCodeSection({
  couponCode,
  couponError,
  couponSuccess,
  onCouponCodeChange,
  t,
}: CouponCodeSectionProps) {
  return (
    <View style={styles.couponSection}>
      <Text style={styles.inputLabel}>
        {t('coupon_code')} ({t('optional')})
      </Text>
      <TextInput
        style={[styles.input, couponError && styles.inputError]}
        placeholder={t('enter_coupon_code')}
        placeholderTextColor="#9ca3af"
        value={couponCode}
        onChangeText={onCouponCodeChange}
        autoCapitalize="characters"
      />
      {couponError && <Text style={styles.errorText}>{couponError}</Text>}
      {couponSuccess && <Text style={styles.successText}>{couponSuccess}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  containerCompact: {
    marginHorizontal: 0,
    marginTop: 8,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  // Royalty Points
  royaltySection: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  royaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  royaltyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
    textTransform: 'uppercase',
  },
  royaltyBadge: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.yellow,
  },
  conversionRate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  royaltySubtext: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
  },

  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.gray,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },

  // Card Form
  cardForm: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.gray,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputHalf: {
    flex: 1,
  },

  // Installment Section
  installmentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  installmentLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.secondaryText,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Coupon Section
  couponSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
});
