import { View, Text } from 'react-native';
import React from 'react';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export const NearbyClinics = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('nearby_clinic')} />
      <View style={styles.container}>
        <Text style={styles.text}>{t('map_view')}</Text>
      </View>
    </SafeAreaView>
  );
};

export default NearbyClinics;
