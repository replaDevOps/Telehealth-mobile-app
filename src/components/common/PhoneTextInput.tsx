import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';

// ✅ Props Interface
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
  maxLength?: number;
  onValidationChange?: (isValid: boolean) => void;
  initialValue?: string;
  CustomStyle?: ViewStyle;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phone = '',
  setPhone,
  countryCode,
  setCountryCode,
  placeholder = 'Number goes here',
  containerStyle = {},
  phoneError,
  errorMessage,
  editable = true,
  maxLength = 11,
  onValidationChange,
  initialValue = '',
  CustomStyle,
}) => {
  const [value, setValue] = useState<string>(initialValue || '');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [hasBeenTouched, setHasBeenTouched] = useState<boolean>(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PK');
  const [componentKey, setComponentKey] = useState<number>(0);

  const phoneInput = useRef<PhoneInput | null>(null);
  const hasUserTypedRef = useRef<boolean>(false);

  const safeSetCountryCode = setCountryCode || (() => {});
  const safeSetPhone = setPhone || (() => {});

  useEffect(() => {
    if (!hasBeenTouched) {
      if (phone && phone !== value) {
        setValue(phone);
        setComponentKey(prev => prev + 1);
      }

      if (countryCode && countryCode !== selectedCountryCode) {
        setSelectedCountryCode(countryCode);
        setComponentKey(prev => prev + 1);
      }
    }
  }, [phone, countryCode]);

  useEffect(() => {
    if (value && phoneInput.current) {
      const valid = phoneInput.current.isValidNumber(value);
      setIsValid(valid === true);
      onValidationChange?.(valid && value.trim() !== '');
    }
  }, [value, selectedCountryCode]);

  const handleTextChange = (text: string) => {
    setValue(text);
    setHasBeenTouched(true);
    hasUserTypedRef.current = true;

    if (phoneInput.current) {
      const valid = phoneInput.current.isValidNumber(text);
      setIsValid(valid === true);
    }
  };

  const handleFormattedTextChange = (formattedText: string) => {
    if (!hasUserTypedRef.current) return;

    const parsed = parsePhoneNumberFromString(formattedText);
    const digitsOnly = parsed
      ? parsed.nationalNumber
      : formattedText.replace(/\D/g, '');

    safeSetPhone(digitsOnly);

    if (formattedText && phoneInput.current) {
      const valid = phoneInput.current.isValidNumber(formattedText);
      setIsValid(valid === true);
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

  const hasError =
    ((phoneError || errorMessage) && hasBeenTouched) ||
    (!isValid && hasBeenTouched && value);

  return (
    <View>
      <View
        style={[
          styles.phoneInputContainer,
          containerStyle,
          CustomStyle,
          hasError && styles.errorContainer,
        ]}
      >
        <PhoneInput
          key={componentKey}
          ref={phoneInput}
          defaultValue={value}
          defaultCode={selectedCountryCode as any}
          layout="second"
          withDarkTheme={false}
          withShadow={false}
          autoFocus={false}
          disabled={!editable}
          placeholder={placeholder}
          textInputProps={{
            placeholderTextColor: colors.gray,
            editable: editable,
            maxLength,
          }}
          onChangeText={handleTextChange}
          onChangeCountry={handleCountryChange}
          onChangeFormattedText={handleFormattedTextChange}
          containerStyle={styles.phoneInputInnerContainer}
          textContainerStyle={styles.textContainer}
          flagButtonStyle={styles.flagButton}
          codeTextStyle={styles.codeText}
          textInputStyle={styles.textInput}
        />
      </View>

      {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
    borderColor: colors.border,
    borderRadius: mvs(8),
    marginBottom: mvs(16),
    overflow: 'hidden',
  },
  errorContainer: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  phoneInputInnerContainer: {
    width: '100%',
    height: mvs(40),
    backgroundColor: colors.gray,
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  flagButton: {
    backgroundColor: 'transparent',
    paddingLeft: mvs(12),
  },
  codeText: {
    fontSize: mvs(16),
    color: colors.black,
  },
  textInput: {
    fontSize: mvs(16),
    color: colors.black,
    paddingVertical: mvs(12),
    paddingRight: mvs(12),
  },
  errorText: {
    color: 'red',
    marginBottom: mvs(5),
    fontSize: mvs(12),
    marginLeft: mvs(2),
  },
});

export default PhoneNumberInput;
