import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBarRow } from '@components/atoms';

export const SelectLocation = () => {
  const onSearchPress = () => {
    console.log('Search button pressed');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title="Select Location" />
      <SearchBarRow
        placeholder="Search Location"
        onSearchPress={onSearchPress}
      />
      <View style={styles.container}>
        <Text style={styles.text}>map view</Text>
      </View>
    </SafeAreaView>
  );
};

export default SelectLocation;
