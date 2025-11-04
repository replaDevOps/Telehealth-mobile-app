import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export const NearbyClinics = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title="Nearby Clinic" />
      <View style={styles.container}>
        <Text style={styles.text}>map view</Text>
      </View>
    </SafeAreaView>
  );
};

export default NearbyClinics;
