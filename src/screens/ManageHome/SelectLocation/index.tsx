import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBarRow } from '@components/atoms';
import { useTranslation } from 'react-i18next';

export const SelectLocation = () => {
  const { t } = useTranslation();
  const onSearchPress = () => {
    console.log('Search button pressed');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('select_location')} />
      <SearchBarRow
        placeholder={t('search_location')}
        onSearchPress={onSearchPress}
      />
      <View style={styles.container}>
        <Text style={styles.text}>{t('map_view')}</Text>
      </View>
    </SafeAreaView>
  );
};

export default SelectLocation;
