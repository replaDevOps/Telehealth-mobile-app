import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorMessage?: string;
  value: string;
  onChangeText: (text: string) => void;
  theme?: 'light' | 'dark';
  leftIconName?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  containerStyle,
  errorMessage,
  style,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  theme = 'light',
  leftIconName,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false); // Start with password hidden
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const alignmentStyle = {
    textAlign: isRtl ? 'right' : 'left' as const,
    writingDirection: isRtl ? 'rtl' : 'ltr' as const,
  };

  const isLight = theme === 'light';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            alignmentStyle,
            { color: isLight ? colors.black : colors.white },
          ]}
        >
          {label}
        </Text>
      )}

      {/* inputContainer always uses standard flexDirection: 'row' so left icons stay left, right visibility stays right */}
      <View
        style={[
          styles.inputContainer,
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isLight ? '#F1F3F8' : '#1D1236',
            borderColor: isLight ? colors.border : '#3A2E5B',
          },
        ]}
      >
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={mvs(18)}
            color={isLight ? colors.secondaryText : '#C4B5FD'}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            alignmentStyle,
            { color: isLight ? colors.black : colors.white },
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={isLight ? colors.secondaryText : '#B0A8B9'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword} // Toggle visibility
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={handleTogglePassword}
            disabled={props.editable === false}
          >
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={mvs(20)}
              color={isLight ? colors.black : colors.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? (
        <Text style={[styles.errorText, alignmentStyle]}>{errorMessage}</Text>
      ) : null}
    </View>
  );

  function handleTogglePassword() {
    setShowPassword(!showPassword);
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(16),
  },
  label: {
    fontSize: mvs(13),
    marginBottom: mvs(8),
    fontWeight: '600',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: mvs(12),
    height: mvs(50),
    paddingHorizontal: mvs(8),
  },
  leftIcon: {
    paddingHorizontal: mvs(8),
  },
  input: {
    flex: 1,
    paddingHorizontal: mvs(8),
    height: '100%',
    fontSize: mvs(14),
  },
  iconContainer: {
    paddingHorizontal: mvs(10),
  },
  errorText: {
    color: 'red',
    marginTop: mvs(5),
    fontSize: mvs(12),
  },
});

export { CustomTextInput };
export type { CustomTextInputProps };
