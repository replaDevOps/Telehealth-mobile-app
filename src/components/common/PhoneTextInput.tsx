import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';

const PhoneNumberInput = ({
  phone,
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
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('PK');
  const [componentKey, setComponentKey] = useState(0);
  const phoneInput = useRef(null);
  const hasUserTypedRef = useRef(false);

  const safeSetCountryCode = setCountryCode || (() => {});
  const safeSetPhone = setPhone || (() => {});

  useEffect(() => {
    console.log('🔄 PhoneNumberInput received:', { phone, countryCode });

    if (!hasBeenTouched) {
      if (phone && phone !== value) {
        setValue(phone);
        console.log('✅ Set value to:', phone);
        setComponentKey(prev => prev + 1);
      }

      if (countryCode && countryCode !== selectedCountryCode) {
        setSelectedCountryCode(countryCode);
        console.log('✅ Set country code to:', countryCode);
        setComponentKey(prev => prev + 1);
      }
    }
  }, [phone, countryCode]);

  // --- Keep validation updated ---
  useEffect(() => {
    if (value && phoneInput.current) {
      const isValidNumber = phoneInput.current.isValidNumber(value);
      setIsValid(isValidNumber === true);

      if (onValidationChange) {
        onValidationChange(isValidNumber && value.trim() !== '');
      }
    }
  }, [value, selectedCountryCode, onValidationChange]);

  const handleTextChange = text => {
    console.log('📝 User typing:', text);
    setValue(text);
    setHasBeenTouched(true);
    hasUserTypedRef.current = true;

    if (phoneInput.current) {
      const isValidNumber = phoneInput.current.isValidNumber(text);
      setIsValid(isValidNumber === true);
    }
  };

  const handleFormattedTextChange = formattedText => {
    if (!hasUserTypedRef.current) {
      return;
    }

    console.log('📱 Formatted text:', formattedText);

    const parsed = parsePhoneNumberFromString(formattedText);
    const digitsOnly = parsed
      ? parsed.nationalNumber
      : formattedText.replace(/\D/g, '');

    safeSetPhone(digitsOnly);

    if (formattedText && phoneInput.current) {
      const isValidFormatted = phoneInput.current.isValidNumber(formattedText);
      setIsValid(isValidFormatted === true);
    }
  };

  // --- Handle country change ---
  const handleCountryChange = country => {
    console.log('🌍 Country changed to:', country.cca2);
    setSelectedCountryCode(country.cca2);
    safeSetCountryCode(country.cca2);
    setHasBeenTouched(true);

    if (value.trim() && phoneInput.current) {
      const isValidNumber = phoneInput.current.isValidNumber(value);
      setIsValid(isValidNumber === true);
    }
  };

  const hasError =
    ((phoneError || errorMessage) && hasBeenTouched) ||
    (!isValid && hasBeenTouched && value);

  console.log('🎨 Rendering PhoneInput with:', {
    value,
    selectedCountryCode,
    componentKey,
  });

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
          defaultCode={selectedCountryCode}
          layout="second"
          withDarkTheme={false}
          withShadow={false}
          autoFocus={false}
          disabled={!editable}
          placeholder={placeholder}
          textInputProps={{
            placeholderTextColor: colors.gray,
            editable: editable,
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
    marginBottom: mvs(10),
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
