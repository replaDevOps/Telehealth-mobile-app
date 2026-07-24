import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const RadioItem = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radioOuter}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7B68EE',
  },
  radioLabel: {
    fontSize: 15,
    color: '#1A1A1A',
  },
});

// Export all styles
