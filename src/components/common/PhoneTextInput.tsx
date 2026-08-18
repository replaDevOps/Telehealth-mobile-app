import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';

import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';

// The parent may hold the full international number (e.g. "+966501234567"),
// but the input's text field should only show the national part — the dial
// code is already displayed separately next to the flag.
const toNationalNumber = (raw?: string, code?: string): string => {
  if (!raw) return '';
  const parsed = raw.trim().startsWith('+')
    ? parsePhoneNumberFromString(raw.trim())
    : parsePhoneNumberFromString(raw.trim(), code as CountryCode);
  return parsed ? String(parsed.nationalNumber) : raw;
};

// Props Interface
interface PhoneNumberInputProps {
  phone?: string;
  setPhone?: (phone: string) => void;
  countryCode?: string;
  setCountryCode?: (code: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  phoneError?: string;
  errorMessage?: string;
  editable?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  initialValue?: string;
  CustomStyle?: ViewStyle;
  theme?: 'light' | 'dark';
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phone = '',
  setPhone,
  countryCode,
  setCountryCode,
  placeholder,
  containerStyle = {},
  phoneError,
  errorMessage,
  editable = true,
  onValidationChange,
  initialValue = '',
  CustomStyle,
  theme = 'light',
}) => {
  const { t } = useTranslation();
  const activePlaceholder = placeholder ?? t('enter_phone_number');
  const [value, setValue] = useState<string>(initialValue || '');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [hasBeenTouched, setHasBeenTouched] = useState<boolean>(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('SA');
  const [componentKey, setComponentKey] = useState<number>(0);

  const phoneInput = useRef<PhoneInput | null>(null);
  const hasUserTypedRef = useRef<boolean>(false);

  const safeSetCountryCode = setCountryCode || (() => {});
  const safeSetPhone = setPhone || (() => {});

  useEffect(() => {
    if (!hasBeenTouched) {
      // Normalise to the national number so a persisted "+966..." value doesn't
      // render the dial code twice (once in the field, once by the flag button).
      const nationalPhone = toNationalNumber(phone, countryCode);
      const phoneChanged = nationalPhone && nationalPhone !== value;
      const countryChanged = countryCode && countryCode !== selectedCountryCode;

      if (phoneChanged) {
        if ((countryCode || selectedCountryCode) === 'SA') {
          let cleaned = nationalPhone.replace(/\D/g, '');
          if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
          }
          cleaned = cleaned.substring(0, 9);
          let formatted = cleaned;
          if (cleaned.length <= 2) {
            formatted = cleaned;
          } else if (cleaned.length <= 5) {
            formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
          } else {
            formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
          }
          setValue(formatted);
        } else {
          setValue(nationalPhone);
        }
      }
      if (countryChanged) setSelectedCountryCode(countryCode);
      if (phoneChanged || countryChanged) setComponentKey(prev => prev + 1);
    }
  }, [phone, countryCode]);

  useEffect(() => {
    if (value && phoneInput.current) {
      let rawText = value.replace(/\s/g, '');
      if (selectedCountryCode === 'SA') {
        const valid = rawText.length === 9 && rawText.startsWith('5');
        setIsValid(valid);
        onValidationChange?.(valid);
      } else {
        const valid = phoneInput.current.isValidNumber(rawText);
        setIsValid(valid === true);
        onValidationChange?.(valid && rawText.trim() !== '');
      }
    }
  }, [value, selectedCountryCode]);

  const handleTextChange = (text: string) => {
    let rawText = text;
    let formatted = text;

    if (selectedCountryCode === 'SA') {
      // Clean non-digits
      let cleaned = text.replace(/\D/g, '');
      // Strip leading 0
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = cleaned.substring(0, 9);
      rawText = cleaned;

      // Format as 5X XXX XXXX
      if (cleaned.length <= 2) {
        formatted = cleaned;
      } else if (cleaned.length <= 5) {
        formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
      } else {
        formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
      }
    }

    setValue(formatted);
    setHasBeenTouched(true);
    hasUserTypedRef.current = true;

    // Validate
    if (selectedCountryCode === 'SA') {
      const valid = rawText.length === 9 && rawText.startsWith('5');
      setIsValid(valid);
      onValidationChange?.(valid);

      // Update parent phone number
      const phoneCode = phoneInput.current?.getCallingCode() || '966';
      safeSetPhone(`+${phoneCode}${rawText}`);
    } else {
      if (phoneInput.current) {
        const valid = phoneInput.current.isValidNumber(rawText);
        setIsValid(valid === true);
        onValidationChange?.(valid && rawText.trim() !== '');
      }
    }
  };

  const handleFormattedTextChange = (formattedText: string) => {
    if (!hasUserTypedRef.current) return;
    if (selectedCountryCode === 'SA') return;

    // Preserve the formatted international number (includes country dialing code)
    const formattedClean = (formattedText || '').replace(/\s/g, '');
    safeSetPhone(formattedClean);

    if (formattedClean && phoneInput.current) {
      const valid = phoneInput.current.isValidNumber(formattedClean);
      setIsValid(valid === true);
      onValidationChange?.(valid && formattedClean.trim() !== '');
    } else {
      onValidationChange?.(false);
    }
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountryCode(country.cca2);
    safeSetCountryCode(country.cca2);
    setHasBeenTouched(true);

    if (value.trim() && phoneInput.current) {
      const valid = phoneInput.current.isValidNumber(value);
      setIsValid(valid === true);
    }
  };

  const displayError =
    phoneError ||
    errorMessage ||
    (!isValid && hasBeenTouched && value ? t('invalid_phone') : '');

  const hasError = !!displayError;
  const isLight = theme === 'light';

  return (
    <View>
      <View
        style={[
          styles.phoneInputContainer,
          containerStyle,
          CustomStyle,
          {
            backgroundColor: isLight ? colors.gray : '#1D1236',
            borderColor: isLight ? colors.border : '#3A2E5B',
          },
          hasError && styles.errorContainer,
        ]}
      >
        <PhoneInput
          key={componentKey}
          ref={phoneInput}
          defaultValue={value}
          defaultCode={selectedCountryCode as any}
          layout="second"
          withDarkTheme={!isLight}
          withShadow={false}
          autoFocus={false}
          disabled={!editable}
          placeholder={activePlaceholder}
          textInputProps={{
            placeholderTextColor: isLight ? colors.secondaryText : '#B0A8B9',
            editable: editable,
            value: value,
          }}
          onChangeText={handleTextChange}
          onChangeCountry={handleCountryChange}
          onChangeFormattedText={handleFormattedTextChange}
          containerStyle={[
            styles.phoneInputInnerContainer,
            { backgroundColor: isLight ? colors.gray : '#1D1236' },
          ]}
          textContainerStyle={styles.textContainer}
          flagButtonStyle={styles.flagButton}
          codeTextStyle={[
            styles.codeText,
            { color: isLight ? colors.black : colors.white },
          ]}
          textInputStyle={[
            styles.textInput,
            { color: isLight ? colors.black : colors.white },
          ]}
        />
      </View>

      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: mvs(14),
    marginBottom: mvs(6),
    fontWeight: '500',
  },
  phoneInputContainer: {
    borderWidth: 1,
    borderRadius: mvs(8),
    marginBottom: mvs(16),
    overflow: 'hidden',
    direction: 'ltr',
  },
  errorContainer: {
    borderColor: colors.red,
    borderWidth: 1.5,
  },
  phoneInputInnerContainer: {
    width: '100%',
    height: mvs(50),
    direction: 'ltr',
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    height: mvs(50),
    direction: 'ltr',
  },
  flagButton: {
    backgroundColor: 'transparent',
    paddingLeft: mvs(12),
    direction: 'ltr',
  },
  codeText: {
    fontSize: mvs(16),
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 0,
    height: mvs(50),
    direction: 'ltr',
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  errorText: {
    color: colors.red,
    marginBottom: mvs(5),
    fontSize: mvs(12),
    marginLeft: mvs(2),
  },
});

export default PhoneNumberInput;
