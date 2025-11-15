import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  TextProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { mvs } from '../../config/metrices';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  textStyle?: TextProps['style'];
  style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  textStyle,
  style,
  disabled,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton, style]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={[styles.buttonText, disabled && styles.disabledText, textStyle]}
      >
        {title}
      </Text>
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
    backgroundColor: colors.neutral, // Black background when disabled
  },
  buttonText: {
    color: colors.white,
    fontSize: mvs(16),
    fontWeight: 'bold',
  },
  disabledText: {
    // Optional: You can also change text color for disabled state
    // color: colors.gray, // Uncomment if you want different text color
  },
});

export { CustomButton };
