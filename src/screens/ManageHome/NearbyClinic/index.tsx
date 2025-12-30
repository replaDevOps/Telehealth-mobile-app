import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';

export const NearbyClinics = () => {
  const { t } = useTranslation();
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [clinics, setClinics] = useState<ClinicApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby clinics.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationLoading(false);
          // Still fetch clinics with default location
          fetchClinics(region.latitude, region.longitude);
          Alert.alert('Permission Denied', 'Location permission is required to show nearby clinics.');
        }
      } catch (err) {
        console.warn(err);
        setLocationLoading(false);
        fetchClinics(region.latitude, region.longitude);
      }
    } else {
      // iOS
      Geolocation.requestAuthorization();
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        setLocationLoading(false);
        // Fetch clinics with the new coordinates
        fetchClinics(latitude, longitude);
      },
      error => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);
        // Fetch clinics with default location
        fetchClinics(region.latitude, region.longitude);
        Toast.error('Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchClinics = async (lat: number, long: number, pageNo: number = 1, recordsPerPage: number = 10) => {
    try {
      setLoading(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: '',
          lat: lat.toString(),
          long: long.toString(),
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
        },
      });

      if (response.data.success && response.data.data) {
        // Filter clinics that have valid lat/long coordinates
        const validClinics = response.data.data.filter(
          (clinic: ClinicApiResponse) =>
            clinic.details?.lat !== null &&
            clinic.details?.lat !== undefined &&
            clinic.details?.long !== null &&
            clinic.details?.long !== undefined
        );
        setClinics(validClinics);
      }
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      Toast.error(error.message || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('nearby_clinic')} />
      {locationLoading || loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
          <Text style={styles.loadingText}>
            {locationLoading ? 'Getting your location...' : 'Loading clinics...'}
          </Text>
      </View>
      ) : (
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={false}
        >
          {clinics.map((clinic, index) => {
            if (!clinic.details?.lat || !clinic.details?.long) return null;
            return (
              <Marker
                key={`${clinic.clinicID}-${index}`}
                coordinate={{
                  latitude: clinic.details.lat,
                  longitude: clinic.details.long,
                }}
                title={clinic.name || clinic.clinicName || 'Clinic'}
                description={clinic.details?.address || clinic.details?.businessName || ''}
              />
            );
          })}
        </MapView>
      )}
    </SafeAreaView>
  );
};

export default NearbyClinics;
