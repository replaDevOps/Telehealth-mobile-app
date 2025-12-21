import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBarRow } from '@components/atoms';
import { useTranslation } from 'react-i18next';
import Geolocation from '@react-native-community/geolocation';
import { Toast } from 'toastify-react-native';

export const SelectLocation = () => {
  const { t } = useTranslation();
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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
            message: 'This app needs access to your location to help you select a location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationLoading(false);
          Alert.alert('Permission Denied', 'Location permission is recommended to select your location.');
        }
      } catch (err) {
        console.warn(err);
        setLocationLoading(false);
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
        setSelectedLocation({ latitude, longitude });
        setLocationLoading(false);
      },
      error => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);
        Toast.error('Failed to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const onSearchPress = () => {
    console.log('Search button pressed');
    // TODO: Implement location search functionality
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('select_location')} />
      <SearchBarRow
        placeholder={t('search_location')}
        onSearchPress={onSearchPress}
      />
      {locationLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : (
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title={t('selected_location')}
              description={`Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`}
              pinColor="#7625D7"
            />
          )}
        </MapView>
      )}
      {selectedLocation && !locationLoading && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfoText}>
            {t('selected_location')}: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SelectLocation;
