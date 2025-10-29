import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';

export const NearbyClinics = () => {
  return (
    <View>
      <Header2 title="Nearby Clinic" />
      <View style={styles.container}></View>
    </View>
  );
};

export default NearbyClinics;
