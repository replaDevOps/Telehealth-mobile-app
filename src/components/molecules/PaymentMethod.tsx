import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ApplePaySvg, MastercardSvg, StcPaySvg } from '@assets/icons';
import { StyleSheet } from 'react-native';
import { colors } from '../../styles/colors'; // Adjust path as needed
import { useTranslation } from 'react-i18next';

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
}) {
  const { t } = useTranslation();
  // Use internal state if no external control provided
  const [internalSelectedPayment, setInternalSelectedPayment] =
    useState('credit');
  const [internalCardholderName, setInternalCardholderName] = useState('');
  const [internalCardNumber, setInternalCardNumber] = useState('');
  const [internalExpiryDate, setInternalExpiryDate] = useState('');
  const [internalCvv, setInternalCvv] = useState('');

  // Use external props if provided, otherwise use internal state
  const selectedPayment =
    externalSelectedPayment !== undefined
      ? externalSelectedPayment
      : internalSelectedPayment;
  const cardholderName =
    externalCardholderName !== undefined
      ? externalCardholderName
      : internalCardholderName;
  const cardNumber =
    externalCardNumber !== undefined ? externalCardNumber : internalCardNumber;
  const expiryDate =
    externalExpiryDate !== undefined ? externalExpiryDate : internalExpiryDate;
  const cvv = externalCvv !== undefined ? externalCvv : internalCvv;

  const handlePaymentSelect = paymentMethod => {
    if (onPaymentChange) {
      onPaymentChange(paymentMethod);
    } else {
      setInternalSelectedPayment(paymentMethod);
    }
  };

  const handleCardholderNameChange = text => {
    if (onCardholderNameChange) {
      onCardholderNameChange(text);
    } else {
      setInternalCardholderName(text);
    }
  };

  const handleCardNumberChange = text => {
    if (onCardNumberChange) {
      onCardNumberChange(text);
    } else {
      setInternalCardNumber(text);
    }
  };

  const handleExpiryDateChange = text => {
    if (onExpiryDateChange) {
      onExpiryDateChange(text);
    } else {
      setInternalExpiryDate(text);
    }
  };

  const handleCvvChange = text => {
    if (onCvvChange) {
      onCvvChange(text);
    } else {
      setInternalCvv(text);
    }
  };

  const getPaymentData = () => {
    return {
      selectedPayment,
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
    };
  };

  return (
    <View style={[styles.paymentSection, compact && styles.compactSection]}>
      {showTitle && (
        <Text style={styles.sectionTitle}>{t('payment_method')}</Text>
      )}

      {/* Credit/Debit Card */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'credit' && styles.paymentOptionSelected,
        ]}
        onPress={() => handlePaymentSelect('credit')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.radioOuter}>
            {selectedPayment === 'credit' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.paymentLabel}>{t('credit_debit_card')}</Text>
        </View>
        <View style={styles.cardLogos}>
          <MastercardSvg />
        </View>
      </TouchableOpacity>

      {/* Card Details Form */}
      {selectedPayment === 'credit' && (
        <View style={styles.cardForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('cardholder_name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enter_cardholder_name')}
              placeholderTextColor="#9ca3af"
              value={cardholderName}
              onChangeText={handleCardholderNameChange}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('card_number')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enter_card_number')}
              placeholderTextColor="#9ca3af"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputGroupHalf]}>
              <Text style={styles.inputLabel}>{t('expiry_date')}</Text>
              <TextInput
                style={styles.input}
                placeholder="01/2025"
                placeholderTextColor="#9ca3af"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.inputGroupHalf]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="000"
                placeholderTextColor="#9ca3af"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}

      {/* Apple Pay */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'applepay' && styles.paymentOptionSelected,
        ]}
        onPress={() => handlePaymentSelect('applepay')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.radioOuter}>
            {selectedPayment === 'applepay' && (
              <View style={styles.radioInner} />
            )}
          </View>
          <Text style={styles.paymentLabel}>{t('apple_pay')}</Text>
        </View>
        <ApplePaySvg />
      </TouchableOpacity>

      {/* STC Pay */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'stc' && styles.paymentOptionSelected,
        ]}
        onPress={() => handlePaymentSelect('stc')}
      >
        <View style={styles.paymentLeft}>
          <View style={styles.radioOuter}>
            {selectedPayment === 'stc' && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.paymentLabel}>{t('stc_pay')}</Text>
        </View>
        <StcPaySvg />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paymentSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  compactSection: {
    marginHorizontal: 0,
    marginTop: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
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
  cardLogos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardForm: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 16,
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroupHalf: {
    width: '48%',
  },
});
