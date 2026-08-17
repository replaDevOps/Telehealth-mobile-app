import { View, Text, ActivityIndicator, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Header2 } from '../../../components/common/Header2';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import { ClinicApiResponse } from '../../../types/clinic.types';
import { Toast } from 'toastify-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClinicAvatar from '@components/common/ClinicAvatar';
import { Marker_Pin } from '@assets/images';
import { LocationPermissionNotice } from '@components/molecules/LocationPermissionNotice';
import { useLocationStore } from '@store';
import { coordsForNearby, nearbyView } from './mapState';

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
  // Starts false, and is only true while a clinic request is actually in
  // flight. It used to start true and gate the map, so any path that never
  // reached fetchClinics hid the map permanently.
  const [loading, setLoading] = useState(false);

  const {
    location,
    isLoading: locationLoading,
    permissionStatus,
    fetchLocation,
  } = useLocationStore();
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

  // One shared implementation of "where is the user", rather than this screen's
  // own copy. The store guarantees settlement: it wraps every geolocation call
  // in a timeout, because neither the module's own `timeout` option nor the
  // iOS authorization callbacks can be relied on to fire. That is exactly what
  // this screen used to get wrong - on iOS, requestAuthorization invokes
  // neither callback when the status is already determined, which left the
  // spinner up forever and the map unmounted.
  useEffect(() => {
    // Reuse a position we already hold rather than reading a new one. This
    // screen is an automatic caller: it opens as a side effect of tapping the
    // header, not because the user asked to update where they are. Only
    // Select Location and the retry button below force a fresh read.
    if (useLocationStore.getState().location) return;
    fetchLocation();
  }, [fetchLocation]);

  /** Re-checks permission after the user has been to Settings. */
  const retryLocationPermission = useCallback(() => {
    fetchLocation({ force: true });
  }, [fetchLocation]);

  // Centre the map and load clinics once the lookup has settled, whatever it
  // settled to. A refused permission renders the notice instead, so it is the
  // one outcome with nothing to fetch.
  useEffect(() => {
    if (locationLoading || permissionStatus === 'denied') return;

    const { lat, long } = coordsForNearby(location);
    setRegion(prev => {
      if (prev.latitude === lat && prev.longitude === long) return prev;
      return { ...prev, latitude: lat, longitude: long };
    });
    fetchClinics(lat, long);
    // fetchClinics is recreated every render and would loop; the coordinates
    // and the settled state are what should drive a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationLoading, permissionStatus, location?.lat, location?.long]);

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

  const view = nearbyView({
    permissionStatus,
    locationLoading,
    hasLocation: location !== null,
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header2 title={t('nearby_clinic')} />
      {view === 'permission-notice' ? (
        <LocationPermissionNotice onRetry={retryLocationPermission} />
      ) : view === 'locating' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7625D7" />
          <Text style={styles.loadingText}>{t('getting_location')}</Text>
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
            provider={PROVIDER_GOOGLE}
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

          {/* Small loading overlay, matching SelectLocation. Loading clinics
              must never hide the map: a request that hangs would otherwise
              take the whole screen down with it. */}
          {(locationLoading || loading) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#7625D7" />
              <Text style={styles.loadingOverlayText}>
                {locationLoading ? t('getting_location') : 'Loading clinics...'}
              </Text>
            </View>
          )}

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
