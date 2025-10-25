import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const CustomText = ({ text }: { text: string }) => {
  return (
    <View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    fontFamily: 'HelveticaNeueItalic',
    fontSize: 22,
    fontWeight: '600',
  },
});
