import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Platform, PermissionsAndroid, Text } from 'react-native';
import HomeHeader from '../../../components/molecules/HomeHeadder';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import RecommendedClinics from '../../../components/molecules/RecommendedClinics';
import NearbyClinics from '../../../components/molecules/ClinicListItem';
import { RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import { useCartCount } from '../../../hooks/useCartCount';

interface Clinic {
  id: string;
  name: string;
  specialty: string;
  rating: number | string;
  location: string;
  image?: { uri: string } | number;
  isFeatured?: boolean;
}

export const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { cartCount } = useCartCount();
  const [recommendedClinics, setRecommendedClinics] = useState<Clinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationAndFetchClinics();
  }, []);

  const requestLocationAndFetchClinics = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocationAndFetch();
        } else {
          // Use default location if permission denied
          fetchClinics(24.7136, 46.6753);
        }
      } else {
        Geolocation.requestAuthorization();
        getCurrentLocationAndFetch();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      fetchClinics(24.7136, 46.6753);
    }
  };

  const getCurrentLocationAndFetch = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchClinics(latitude, longitude);
      },
      error => {
        console.warn('Error getting location:', error);
        // Use default location (Riyadh, Saudi Arabia)
        fetchClinics(24.7136, 46.6753);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchClinics = async (lat: number, long: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: '',
          lat: lat.toString(),
          long: long.toString(),
        },
      });
      console.log('response', response.data.data);
      if (response.data.success && response.data.data) {
        const clinics = transformClinicsData(response.data.data);
        
        // Recommended clinics are those with is_featured === true
        const featured = clinics.filter(clinic => clinic.isFeatured === true);
        // Nearby clinics are all other clinics
        const nearby = clinics.filter(clinic => clinic.isFeatured !== true);

        setRecommendedClinics(featured);
        setNearbyClinics(nearby);
      }
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      Toast.error(error.message || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  const transformClinicsData = (apiClinics: ClinicApiResponse[]): Clinic[] => {
    return apiClinics.map((clinic): Clinic => {
      const clinicName = clinic.name || clinic.clinicName || 'Clinic';
      const location = clinic.details?.address || 
                      clinic.details?.city || 
                      clinic.details?.district || 
                      'Location not available';
      const specialty = clinic.details?.businessName || 
                       clinic.businessType || 
                       'General';
      const rating = parseFloat(clinic.avgRating) || 0;
      
      // Use cover image, logo, or default image
      let image: { uri: string } | number = RecommandImage;
      if (clinic.details?.coverImage) {
        image = { uri: clinic.details.coverImage };
      } else if (clinic.details?.logo) {
        image = { uri: clinic.details.logo };
      }

      return {
        id: clinic.clinicID.toString(),
        name: clinicName,
        specialty: specialty,
        rating: rating,
        location: location,
        image: image,
        isFeatured: clinic.is_featured === true,
      };
    });
  };

  const handleLocationPress = () => {
    console.log('Location pressed');
    navigation.navigate('NearbyClinics');
  };

  const handleCartPress = () => {
    navigation.navigate('CartScreen');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
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
        location={t('makkah_saudi_arabia')}
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onSLPress={handleSLPress}
        cartItemCount={cartCount}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
        </View>
      ) : recommendedClinics.length === 0 && nearbyClinics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t('no_clinics_found')}</Text>
          <Text style={styles.emptyMessage}>{t('no_clinics_message')}</Text>
        </View>
      ) : (
      <ScrollView style={styles.content}>
          {recommendedClinics.length > 0 && (
        <RecommendedClinics
              clinics={recommendedClinics}
          onClinicPress={clinic =>
                navigation.navigate('ClinicDetail', { clinic, clinicID: parseInt(clinic.id) })
          }
        />
          )}

          {nearbyClinics.length > 0 && (
        <NearbyClinics
              clinics={nearbyClinics}
          onClinicPress={clinic =>
                navigation.navigate('ClinicDetail', { clinic, clinicID: parseInt(clinic.id) })
          }
        />
          )}
      </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(30),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: mvs(10),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;
