import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  TextProps,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  textStyle?: TextProps['style'];
  style?: ViewStyle;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  textStyle,
  style,
  disabled,
  loading,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: mvs(12),
    borderRadius: mvs(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: mvs(10),
  },
  disabledButton: {
    backgroundColor: colors.neutral,
  },
  buttonText: {
    color: colors.white,
    fontSize: mvs(16),
    fontWeight: 'bold',
  },
  disabledText: {},
});

export { CustomButton };
