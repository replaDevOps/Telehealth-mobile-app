import { StyleSheet, Text, TextProps } from 'react-native';

import React from 'react';

interface CustomTextProps extends TextProps {
  text?: string;
  children?: React.ReactNode;
}

export const CustomText = ({
  text,
  children,
  style,
  ...rest
}: CustomTextProps) => {
  return (
    <Text style={[styles.text, style]} {...rest}>
      {text || children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontWeight: '600',
  },
});
