import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';

export const SelectLocation = () => {
  return (
    <View>
      <Header2 title="Select Location" />
      <View style={styles.container}>
        <Text>this is selectionlocation screen</Text>
      </View>
    </View>
  );
};

export default SelectLocation;
