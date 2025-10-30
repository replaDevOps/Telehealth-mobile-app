import { Header2 } from '@components/common/Header2';
import SearchServicesBar from '@components/common/SearchInput';
import NearbyClinics from '@components/molecules/ClinicListItem';
import RecommendedClinics from '@components/molecules/RecommendedClinics';
import { mvs } from '@config/metrices';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

const ClinicScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const sampleClinics = [
    {
      id: '1',
      name: 'Eden Medical Center',
      specialty: 'Dermatology',
      rating: 4.5,
      location: 'Makkah, Saudi Arabia',
      image: require('@assets/images/recommandationImage.jpg'),
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Eden Medical Center',
      specialty: 'Dermatology',
      rating: 4.5,
      location: 'Makkah, Saudi Arabia',
      image: require('@assets/images/recommandationImage.jpg'),
      isFeatured: true,
    },
    // Add more clinics...
  ];

  const nearbyClinics = [
    {
      id: '1',
      name: 'Eden Medical Center',
      specialty: 'Dermatology',
      rating: 4.5,
      location: 'Makkah, Saudi Arabia',
      image: require('@assets/images/recommandationImage.jpg'),
    },

    {
      id: '2',
      name: 'Eden Center',
      specialty: 'Dermatology',
      rating: 4.9,
      location: 'Makkah, Saudi Arabia',
      image: require('@assets/images/recommandationImage.jpg'),
    },
    // Add more clinics...
  ];
  return (
    <View style={styles.container}>
      <Header2 title="Clinic" />
      <SearchServicesBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => navigation.navigate('FilterScreen')}
      />
      <ScrollView style={styles.content}>
        <RecommendedClinics
          clinics={sampleClinics}
          onClinicPress={clinic =>
            navigation.navigate('ClinicDetail', { clinic })
          }
        />

        <NearbyClinics
          clinics={nearbyClinics}
          onClinicPress={(clinic: any) =>
            // navigation.navigate('ClinicDetail', { clinic })
            console.log(clinic)
          }
          onSeeAllPress={() => console.log('button is pressed')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingVertical: mvs(10),
    paddingHorizontal: mvs(15),
  },
});

export default ClinicScreen;
