import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClinicAvatar from '@components/common/ClinicAvatar';
import { Marker_Pin } from '@assets/images';
import {
  showLocationSettingsAlert,
  handleLocationError,
  isPermissionDeniedError,
} from '../../../utils/locationUtils';
import { LocationPermissionNotice } from '@components/molecules/LocationPermissionNotice';

// Same Android-friendly marker pattern used in SelectLocation: start with
// tracksViewChanges=true so the child Image is composited into the native
// marker bitmap, then flip it off after load to avoid per-frame redraws.
const ClinicMarker = ({
  coordinates,
  isSelected,
  zIndex,
  onPress,
}: {
  coordinates: { latitude: number; longitude: number };
  isSelected: boolean;
  zIndex: number;
  onPress: () => void;
}) => {
  const [tracksChanges, setTracksChanges] = useState(true);
  return (
    <Marker
      coordinate={coordinates}
      tracksViewChanges={tracksChanges}
      zIndex={isSelected ? 1000 : zIndex}
      stopPropagation
      onPress={onPress}
    >
      <Image
        source={Marker_Pin}
        style={{ width: 36, height: 44 }}
        resizeMode="contain"
        onLoad={() => setTracksChanges(false)}
      />
    </Marker>
  );
};

export const NearbyClinics = ({ navigation }: any) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: Number(24.7136),
    longitude: Number(46.6753),
    latitudeDelta: Number(0.0922),
    longitudeDelta: Number(0.0421),
  });
  const [clinics, setClinics] = useState<ClinicApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  // Terminal state: the map is replaced by a notice pointing at Settings,
  // because no amount of further waiting can produce a position.
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicApiResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);

  const cardWidth = 260;
  const pointerWidth = 20;
  // Conservative starting estimate: real measured heights for clinics with
  // 2-line names land around 270–290px.
  const cardApproxHeight = 290;
  const [cardHeight, setCardHeight] = useState<number>(cardApproxHeight);
  const [mapAreaHeight, setMapAreaHeight] = useState<number>(() => Dimensions.get('window').height);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const parseLatLng = (clinic: ClinicApiResponse) => {
    if (!clinic.details?.lat || !clinic.details?.long) return null;
    const lat = typeof clinic.details.lat === 'string' ? parseFloat(clinic.details.lat) : Number(clinic.details.lat);
    const lng = typeof clinic.details.long === 'string' ? parseFloat(clinic.details.long) : Number(clinic.details.long);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { latitude: lat, longitude: lng };
  };

  const updateSelectedPoint = useCallback(
    async (clinic: ClinicApiResponse | null) => {
      if (!clinic || !mapRef.current) {
        setSelectedPoint(null);
        return;
      }
      const coord = parseLatLng(clinic);
      if (!coord) {
        setSelectedPoint(null);
        return;
      }
      try {
        const point = await mapRef.current.pointForCoordinate(coord);
        setSelectedPoint({ x: point.x, y: point.y });
      } catch (e) {
        // If map isn't ready yet, ignore.
        setSelectedPoint(null);
      }
    },
    []
  );

  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted and attached to Activity
    const timer = setTimeout(() => {
      requestLocationPermission();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) {
          getCurrentLocation();
          return;
        }

        // Request permission
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
          // Refused: show the Settings notice rather than a map centred on a
          // default region the user never chose.
          setLocationLoading(false);
          setPermissionDenied(true);
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        setLocationLoading(false);
        fetchClinics(region.latitude, region.longitude);
        Toast.error('Failed to request location permission');
      }
    } else {
      // iOS. requestAuthorization was previously called without callbacks and
      // getCurrentLocation ran immediately regardless of the answer, so a
      // refusal was indistinguishable from a grant. Both outcomes are handled
      // here, and the error path is what stops the endless spinner.
      try {
        Geolocation.requestAuthorization(
          () => getCurrentLocation(),
          () => {
            setLocationLoading(false);
            setPermissionDenied(true);
          },
        );
      } catch (err) {
        console.warn('iOS location error:', err);
        setLocationLoading(false);
        fetchClinics(region.latitude, region.longitude);
      }
    }
  };

  /** Re-checks permission after the user has been to Settings. */
  const retryLocationPermission = useCallback(() => {
    setPermissionDenied(false);
    setLocationLoading(true);
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        // Ensure coordinates are numbers
        const lat = typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude);
        const lng = typeof longitude === 'string' ? parseFloat(longitude) : Number(longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          setLocationLoading(false);
          fetchClinics(region.latitude, region.longitude);
          Toast.error('Invalid location coordinates');
          return;
        }

        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: Number(0.0922),
          longitudeDelta: Number(0.0421),
        };
        setRegion(newRegion);
        setLocationLoading(false);
        // Fetch clinics with the new coordinates
        fetchClinics(lat, lng);
      },
      error => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);

        // A denial can also arrive here rather than from the permission
        // request - notably on iOS, where the authorization callbacks are not
        // always invoked when the status is already determined.
        if (isPermissionDeniedError(error)) {
          setPermissionDenied(true);
          return;
        }

        // Anything else (slow GPS, position unavailable) is not terminal, so
        // the map still opens on the default region.
        fetchClinics(region.latitude, region.longitude);
        handleLocationError(error, {
          title: 'Location Not Available',
          message: 'Please enable location services to see nearby clinics. Would you like to open settings?',
          openLocationSettings: true,
        });
      },
      // Coarse and cache-tolerant: the map opens on a city-level region, so
      // waiting on a satellite fix only delayed the clinic list.
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  };

  const fetchClinics = async (lat: number, long: number, pageNo: number = 1, recordsPerPage: number = 10) => {
    // Clear old data first
    setClinics([]);
    setSelectedClinic(null);
    setSelectedPoint(null);

    try {
      setLoading(true);
      const response = await apiClient.get(API.CLINIC.GET_CLINICS, {
        params: {
          name: '',
          lat: lat.toString(),
          long: long.toString(),
          pageNo: pageNo,
          recordsPerPage: recordsPerPage,
          sendFrom: 'map',
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

  // Add small offset to markers at the same location to prevent overlap
  const getOffsetCoordinates = useCallback((clinic: ClinicApiResponse) => {
    if (!clinic.details?.lat || !clinic.details?.long) return null;

    let lat = typeof clinic.details.lat === 'string'
      ? parseFloat(clinic.details.lat)
      : Number(clinic.details.lat);
    let lng = typeof clinic.details.long === 'string'
      ? parseFloat(clinic.details.long)
      : Number(clinic.details.long);

    if (isNaN(lat) || isNaN(lng)) return null;

    // Check for other clinics at the same location and apply offset
    const sameLocationClinics = clinics.filter((c) => {
      if (!c.details?.lat || !c.details?.long) return false;
      const cLat = typeof c.details.lat === 'string' ? parseFloat(c.details.lat) : Number(c.details.lat);
      const cLng = typeof c.details.long === 'string' ? parseFloat(c.details.long) : Number(c.details.long);
      // Consider same location if within 0.0001 degrees (~11 meters)
      return Math.abs(cLat - lat) < 0.0001 && Math.abs(cLng - lng) < 0.0001;
    });

    if (sameLocationClinics.length > 1) {
      const myIndex = sameLocationClinics.findIndex(c => c.clinicID === clinic.clinicID);
      if (myIndex > 0) {
        // Apply circular offset for overlapping markers
        const offsetAmount = 0.0003; // ~33 meters
        const angle = (myIndex * 60) * (Math.PI / 180); // 60 degrees apart
        lat += offsetAmount * Math.cos(angle);
        lng += offsetAmount * Math.sin(angle);
      }
    }

    return { latitude: lat, longitude: lng };
  }, [clinics]);

  const handleMarkerPress = async (clinic: ClinicApiResponse) => {
    setSelectedClinic(clinic);

    const coords = getOffsetCoordinates(clinic);
    if (!coords || !mapRef.current) {
      updateSelectedPoint(clinic);
      return;
    }

    try {
      const point = await mapRef.current.pointForCoordinate(coords);
      const gap = 12;
      const minPinY = cardHeight + gap + 12;
      if (point.y >= minPinY) {
        setSelectedPoint({ x: point.x, y: point.y });
        return;
      }

      // Pan the map north so the pin lands at minPinY, leaving room above
      // the pin for the card.
      const deltaPx = minPinY - point.y;
      const latPerPx = region.latitudeDelta / mapAreaHeight;
      const newRegion: Region = {
        latitude: region.latitude + deltaPx * latPerPx,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };
      // Hide the card while panning so it doesn't flash at the old position.
      setSelectedPoint(null);
      mapRef.current.animateToRegion(newRegion, 300);

      setTimeout(async () => {
        if (!mapRef.current) return;
        try {
          const next = await mapRef.current.pointForCoordinate(coords);
          setSelectedPoint({ x: next.x, y: next.y });
        } catch {
          updateSelectedPoint(clinic);
        }
      }, 320);
    } catch {
      updateSelectedPoint(clinic);
    }
  };

  const handleCardPress = () => {
    if (selectedClinic) {
      navigation.navigate('ClinicDetail', {
        clinic: selectedClinic,
        clinicID: selectedClinic.clinicID
      });
    }
  };

  const getBusinessTypeDisplay = (businessType: string | null) => {
    if (businessType?.toLowerCase() === 'both') {
      return ['Dermatology', 'Dentistry'];
    }
    return businessType ? [businessType] : [];
  };

  const cardPosition = useMemo(() => {
    if (!selectedPoint) return null;
    const gap = 12;
    const maxBottom = mapAreaHeight - 12;
    const left = clamp(selectedPoint.x - cardWidth / 2, 12, 9999);
    // Always position above the pin. handleMarkerPress pans the map when
    // needed to ensure there's room above; the clamp keeps the card on screen.
    const top = clamp(selectedPoint.y - cardHeight - gap, 12, maxBottom - cardHeight);
    const pointerLeft = clamp(selectedPoint.x - left - pointerWidth / 2, 12, cardWidth - pointerWidth - 12);
    return { left, top, pointerLeft };
  }, [selectedPoint, cardHeight, mapAreaHeight]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('nearby_clinic')} />
      {permissionDenied ? (
        <LocationPermissionNotice onRetry={retryLocationPermission} />
      ) : locationLoading || loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
          <Text style={styles.loadingText}>
            {locationLoading ? 'Getting your location...' : 'Loading clinics...'}
          </Text>
        </View>
      ) : (
        <View
          style={{ flex: 1 }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h && Math.abs(h - mapAreaHeight) > 1) setMapAreaHeight(h);
          }}
        >
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={region}
            onRegionChangeComplete={(newRegion) => {
              // Ensure all region coordinates are numbers
              setRegion({
                latitude: Number(newRegion.latitude),
                longitude: Number(newRegion.longitude),
                latitudeDelta: Number(newRegion.latitudeDelta),
                longitudeDelta: Number(newRegion.longitudeDelta),
              });

              // Keep card anchored while panning/zooming
              if (selectedClinic) {
                updateSelectedPoint(selectedClinic);
              }
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            toolbarEnabled={false}
            onPress={() => setSelectedClinic(null)}
          >
            {clinics.map((clinic, index) => {
              // Get coordinates with offset for overlapping markers
              const coordinates = getOffsetCoordinates(clinic);
              if (!coordinates) return null;

              const isSelected = selectedClinic?.clinicID === clinic.clinicID;

              return (
                <ClinicMarker
                  key={`${clinic.clinicID}-${index}`}
                  coordinates={coordinates}
                  isSelected={isSelected}
                  zIndex={index}
                  onPress={() => handleMarkerPress(clinic)}
                />
              );
            })}
          </MapView>

          {/* Clinic Info Card */}
          {selectedClinic && cardPosition && (
            <TouchableOpacity
              style={[styles.clinicCard, { left: cardPosition.left, top: cardPosition.top, width: cardWidth }]}
              activeOpacity={0.9}
              onPress={handleCardPress}
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                // Only grow — shrinking can race with a just-completed pan.
                if (h && h > cardHeight + 1) setCardHeight(h);
              }}
            >
              <View style={styles.cardContent}>
                {/* Clinic Image with Featured Badge */}
                <View style={styles.imageContainer}>
                  {selectedClinic.details?.coverImage ? (
                    <Image source={{ uri: selectedClinic.details.coverImage }} style={styles.clinicImage} resizeMode="cover" />
                  ) : selectedClinic.details?.logo ? (
                    <Image source={{ uri: selectedClinic.details.logo }} style={styles.clinicImage} resizeMode="cover" />
                  ) : (
                    <ClinicAvatar name={selectedClinic.details?.businessName || selectedClinic.clinicName || ''} size={56} style={styles.clinicImage} />
                  )}
                  {/* Featured Badge on Image */}
                  {selectedClinic.is_featured && (
                    <View style={styles.featuredBadgeOnImage}>
                      <Ionicons name="pricetag" size={10} color="#E8A317" />
                      <Text style={styles.featuredTextOnImage}>Featured</Text>
                    </View>
                  )}
                </View>

                {/* Clinic Info */}
                <View style={styles.clinicInfo}>
                  {/* Business Type and Rating Row */}
                  <View style={styles.typeRatingRow}>
                    {/* Business Type Chips */}
                    <View style={styles.businessTypeContainer}>
                      {getBusinessTypeDisplay(selectedClinic.businessType).map((type, idx) => (
                        <View key={idx} style={styles.businessTypeChip}>
                          <Text style={styles.businessTypeText}>{type}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {parseFloat(selectedClinic.avgRating).toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Clinic Name */}
                  <Text style={styles.clinicName} numberOfLines={2}>
                    {selectedClinic.details?.businessName || selectedClinic.clinicName || ''}
                  </Text>
                </View>
              </View>

              {/* Arrow/Pointer for card */}
              <View style={[styles.cardPointer, { left: cardPosition.pointerLeft }]} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default NearbyClinics;
