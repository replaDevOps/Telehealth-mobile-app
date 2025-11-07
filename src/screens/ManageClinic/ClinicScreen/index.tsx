import { Header2 } from '@components/common/Header2';
import SearchServicesBar from '@components/common/SearchInput';
import NearbyClinics from '@components/molecules/ClinicListItem';
import RecommendedClinics from '@components/molecules/RecommendedClinics';
import { mvs } from '@config/metrices';
import { NEARBYCLINICS, SAMPLECLINICS } from '@constants/appData';
import { colors } from '../../../styles/colors';

import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ClinicScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Header2 title="Clinic" />
      <SearchServicesBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => navigation.navigate('FilterScreen')}
      />
      <ScrollView style={styles.content}>
        <RecommendedClinics
          clinics={SAMPLECLINICS}
          onClinicPress={clinic =>
            navigation.navigate('ClinicDetail', { clinic })
          }
        />

        <NearbyClinics
          clinics={NEARBYCLINICS}
          onClinicPress={clinic =>
            navigation.navigate('ClinicDetail', { clinic })
          }
          onSeeAllPress={() => console.log('button is pressed')}
        />
      </ScrollView>
    </SafeAreaView>
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
});
