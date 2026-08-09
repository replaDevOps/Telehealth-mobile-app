import React, { useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import type { BillingDetails } from '../../types/payment.types';

interface BillingDetailsFormProps {
  value: BillingDetails;
  onChange: (next: BillingDetails) => void;
  invalidFields?: (keyof BillingDetails)[];
}

type FieldConfig = {
  key: keyof BillingDetails;
  label: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
  maxLength?: number;
  half?: boolean;
};

const FIELDS: FieldConfig[] = [
  {
    key: 'first_name',
    label: 'first_name',
    autoCapitalize: 'words',
    half: true,
  },
  { key: 'last_name', label: 'last_name', autoCapitalize: 'words', half: true },
  {
    key: 'email',
    label: 'email_address',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  { key: 'phone', label: 'phone_number', keyboardType: 'phone-pad' },
  { key: 'billing_street1', label: 'street_address' },
  { key: 'billing_city', label: 'city', half: true },
  { key: 'billing_state', label: 'state_region', half: true },
  { key: 'billing_postcode', label: 'postcode', half: true },
  {
    key: 'billing_country',
    label: 'country_code',
    autoCapitalize: 'characters',
    maxLength: 2,
    half: true,
  },
];

export function BillingDetailsForm({
  value,
  onChange,
  invalidFields = [],
}: BillingDetailsFormProps) {
  const { t } = useTranslation();

  const setField = useCallback(
    (key: keyof BillingDetails, text: string) =>
      onChange({ ...value, [key]: text }),
    [value, onChange],
  );

  // Pair consecutive half-width fields onto a single row.
  const rows: FieldConfig[][] = [];
  FIELDS.forEach(field => {
    const last = rows[rows.length - 1];
    if (field.half && last && last.length === 1 && last[0].half) {
      last.push(field);
    } else {
      rows.push([field]);
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('billing_details')}</Text>

      {rows.map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(field => (
            <View
              key={field.key}
              style={[styles.group, field.half && styles.half]}
            >
              <Text style={styles.label}>{t(field.label)}</Text>
              <TextInput
                style={[
                  styles.input,
                  invalidFields.includes(field.key) && styles.inputError,
                ]}
                value={value[field.key]}
                onChangeText={text => setField(field.key, text)}
                placeholder={t(field.label)}
                placeholderTextColor="#9ca3af"
                keyboardType={field.keyboardType ?? 'default'}
                autoCapitalize={field.autoCapitalize ?? 'sentences'}
                maxLength={field.maxLength}
                autoCorrect={false}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8 },
  group: { marginBottom: 12, flex: 1 },
  half: { flex: 1 },
  label: {
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
  inputError: { borderColor: colors.red },
});
