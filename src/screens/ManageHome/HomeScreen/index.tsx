import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, ActivityIndicator, Text, Platform, PermissionsAndroid } from 'react-native';
import HomeHeader from '../../../components/molecules/HomeHeadder';
import { colors } from '../../../styles/colors';
import { mvs } from '../../../config/metrices';
import RecommendedClinics from '../../../components/molecules/RecommendedClinics';
import NearbyClinics from '../../../components/molecules/ClinicListItem';
import { RecommandImage } from '@assets/images';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import { translateCityToEnglish } from '../../../utils/cityTranslator';
import { useCartCount } from '../../../hooks/useCartCount';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { useLocationStore } from '@store';

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
  const { notificationCount } = useNotificationCount();
  const { location } = useLocationStore();
  const [recommendedClinics, setRecommendedClinics] = useState<Clinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    fetchClinicsWithLocation();
  }, [location]);

  // Refetch when search query changes (with debounce)
  useEffect(() => {
    if (!location) return;
    
    const timeoutId = setTimeout(() => {
      fetchClinics(location.lat, location.long, 1, 10, searchQuery);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, location]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access for video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for audio and video consultations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('📱 [Permissions] Camera:', cameraGranted);
        console.log('📱 [Permissions] Audio:', audioGranted);

        setHasAudioPermission(audioGranted === PermissionsAndroid.RESULTS.GRANTED);
        setHasVideoPermission(
          cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
          audioGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('📱 [Permissions] Error requesting permissions:', err);
        setHasAudioPermission(false);
        setHasVideoPermission(false);
      }
    } else {
      // iOS permissions are handled at runtime by the system
      setHasAudioPermission(true);
      setHasVideoPermission(true);
    }
  };

  const fetchClinicsWithLocation = () => {
    if (location) {
      // Use stored location
      fetchClinics(location.lat, location.long);
    } else {
      // No location available - don't fetch clinics or use dummy location
      setLoading(false);
    }
  };

  const fetchClinics = async (lat: number, long: number, pageNo: number = 1, recordsPerPage: number = 10, searchName: string = '') => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: searchName || '',
          lat: lat.toString(),
          long: long.toString(),
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
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
      // Use clinicName (not name) for the card title
      const clinicName = clinic.clinicName || clinic.name || 'Clinic';
      const location = clinic.details?.address || 
                      clinic.details?.city || 
                      clinic.details?.district || 
                      'Location not available';
      // Use businessType for the chip (specialty field)
      // Format businessType to ensure "Both" is displayed properly (case-insensitive)
      const businessType = clinic.businessType || null;
      const specialty = businessType && businessType.toString().toLowerCase() === 'both' 
        ? 'Both' 
        : (businessType || 'General');
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
        name: clinicName, // This is displayed as the clinic name in the card
        specialty: specialty, // This is displayed in the chip
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
    // Search is handled by onChangeText with debounce
    // This can be used for submit if needed
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSLPress = () => {
    navigation.navigate('SelectLocation');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HomeHeader
        location={location?.locationText}
        onLocationPress={handleLocationPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
        onSearchChange={handleSearchChange}
        searchValue={searchQuery}
        onSLPress={handleSLPress}
        cartItemCount={cartCount}
        notificationCount={notificationCount}
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
