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
  ...props
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} {...props}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
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
  buttonText: {
    color: colors.white,
    fontSize: mvs(16),
    fontWeight: 'bold',
  },
});

export { CustomButton };
