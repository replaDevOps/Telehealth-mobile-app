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
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this is installed

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorMessage?: string;
  value: string;
  onChangeText: (text: string) => void;
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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!!secureTextEntry); // Start hidden if secureTextEntry is true

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
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
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={mvs(20)}
              color={colors.black}
            />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: mvs(16),
  },
  label: {
    fontSize: mvs(13),
    color: colors.black,
    marginBottom: mvs(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: mvs(10),
    backgroundColor: colors.gray,
  },
  input: {
    flex: 1,
    paddingHorizontal: mvs(12),
    paddingVertical: mvs(10),
    fontSize: mvs(14),
    color: colors.black,
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
