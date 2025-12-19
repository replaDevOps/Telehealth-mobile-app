import { Header2 } from '@components/common/Header2';
import React from 'react';
import { View, FlatList } from 'react-native';
import { mvs } from '@config/metrices';
import { styles } from './style';
import { useTranslation } from 'react-i18next';
import { LOYALTYPOINTSDATA } from '@constants';
import { ClinicCard } from '../LoyaltyPointsDetails/components';

export const RoyaltyPoints = ({ navigation }) => {
  const { t } = useTranslation();

  const handlePointDetails = (item: any) => {
    navigation.navigate('LoyaltyPointsDetails', {
      clinicId: item.clinicId,
      clinicName: item.clinicName,
      clinicImage: item.image,
      totalPoints: item.points,
      category: item.category,
    });
  };

  const renderItem = ({ item }) => (
    <ClinicCard
      clinicImage={item.image}
      category={item.category}
      clinicName={item.clinicName}
      totalPoints={item.points}
      handlePress={() => handlePointDetails(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Header2 title={t('loyalty_points')} />
      <View style={{ flex: 1, paddingHorizontal: 20, marginTop: mvs(20) }}>
        <FlatList
          data={LOYALTYPOINTSDATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};
