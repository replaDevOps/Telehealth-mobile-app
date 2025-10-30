import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import HomeHeader from '../../../components/molecules/HomeHeadder';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import RecommendedClinics from '../../../components/molecules/RecommendedClinics';
import NearbyClinics from '../../../components/molecules/ClinicListItem';

// Type the props using NativeStackScreenProps

export const HomeScreen = ({ navigation }) => {
  const handleLocationPress = () => {
    console.log('Location pressed');
    navigation.navigate('NearbyClinics');
  };

  const handleCartPress = () => {
    // navigation.navigate('Cart');
  };

  const handleNotificationPress = () => {
    // navigation.navigate('Notifications');
  };

  const handleSearchPress = () => {
    // navigation.navigate('Search');
  };

  const handleQRPress = () => {
    navigation.navigate('SelectLocation');
  };

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
    {
      id: '3',
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
      <HomeHeader
        location="Makkah, Saudi Arabia"
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onQRPress={handleQRPress}
        cartItemCount={4}
      />

      <ScrollView style={styles.content}>
        <RecommendedClinics
          clinics={sampleClinics}
          onClinicPress={clinic =>
            // navigation.navigate('ClinicDetail', { clinic })
            console.log(clinic)
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
