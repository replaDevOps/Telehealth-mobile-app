import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import HomeHeader from '../../../components/molecules/HomeHeadder';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import RecommendedClinics from '../../../components/molecules/RecommendedClinics';
import NearbyClinics from '../../../components/molecules/ClinicListItem';
import { NEARBYCLINICS, SAMPLECLINICS } from '@constants';

export const HomeScreen = ({ navigation }) => {
  const handleLocationPress = () => {
    console.log('Location pressed');
    navigation.navigate('NearbyClinics');
  };

  const handleCartPress = () => {
    navigation.navigate('CartScreen');
  };

  const handleNotificationPress = () => {
    // navigation.navigate('Notifications');
  };

  const handleSearchPress = () => {
    // navigation.navigate('Search');
  };

  const handleSLPress = () => {
    navigation.navigate('SelectLocation');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        location="Makkah, Saudi Arabia"
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onSLPress={handleSLPress}
        cartItemCount={4}
      />

      <ScrollView style={styles.content}>
        <RecommendedClinics
          clinics={SAMPLECLINICS}
          onClinicPress={clinic =>
            navigation.navigate('Clinic', {
              screen: 'ClinicDetail',
              params: { clinic },
            })
          }
        />

        <NearbyClinics
          clinics={NEARBYCLINICS}
          onClinicPress={clinic =>
            navigation.navigate('Clinic', {
              screen: 'ClinicDetail',
              params: { clinic },
            })
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(15),
  },
  Heading: {
    fontSize: 18,
    color: colors.black,
  },
});

export default HomeScreen;
