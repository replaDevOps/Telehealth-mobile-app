import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '@services/api/api-client';
import { API } from '@services/api/api-endpoint';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';
import { useCartCountContext } from '@context/CartCountContext';

export const useCartCount = () => {
  const { cartCount: contextCount, setCartCount: setContextCount, refreshTrigger } = useCartCountContext();
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const cachedLocationRef = useRef<{ lat: number; long: number; timestamp: number } | null>(null);
  const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // Cache location for 5 minutes

  const fetchCartCount = useCallback(async () => {
    // Prevent concurrent calls
    if (isFetchingRef.current) {
      return;
    }

    // Debounce: Don't fetch if we fetched less than 2 seconds ago
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    try {
      setLoading(true);
      
      // Check if we have a cached location that's still valid
      if (cachedLocationRef.current) {
        const cacheAge = now - cachedLocationRef.current.timestamp;
        if (cacheAge < LOCATION_CACHE_DURATION) {
          // Use cached location
          const { lat, long } = cachedLocationRef.current;
          const requestStartTime = Date.now();
          const requestId = `CART_COUNT_CACHED_${requestStartTime}`;
          
          console.log(`📊 [${requestId}] START fetchCartCount (CACHED LOCATION) API Call`);
          console.log(`📊 [${requestId}] Endpoint: ${API.CART.VIEW_CART_DETAILS}`);
          console.log(`📊 [${requestId}] Params: lat=${lat}, long=${long} (cached, age: ${(cacheAge / 1000).toFixed(0)}s)`);
          console.log(`📊 [${requestId}] Timestamp: ${new Date().toISOString()}`);
          
          const response = await apiClient.get(API.CART.VIEW_CART_DETAILS, {
            params: {
              lat: lat.toString(),
              long: long.toString(),
            },
          });
          
          const requestEndTime = Date.now();
          const requestDuration = requestEndTime - requestStartTime;
          
          console.log(`📊 [${requestId}] ✅ SUCCESS - fetchCartCount (CACHED LOCATION)`);
          console.log(`📊 [${requestId}] Duration: ${requestDuration}ms (${(requestDuration / 1000).toFixed(2)}s)`);
          console.log(`📊 [${requestId}] Response Status: ${response.status}`);
          console.log(`📊 [${requestId}] Cart Count: ${response.data?.data ? 'calculated' : 0}`);
          
          if (response.data?.success && response.data?.data) {
            const cartData = response.data.data;
            let totalCount = 0;
            if (Array.isArray(cartData)) {
              cartData.forEach((clinicGroup: any) => {
                if (clinicGroup.items && Array.isArray(clinicGroup.items)) {
                  totalCount += clinicGroup.items.length;
                }
              });
            }
            setContextCount(totalCount);
          } else {
            setContextCount(0);
          }
          return;
        }
      }
      
      // Get current location or use default
      const getLocation = async (): Promise<{ lat: number; long: number }> => {
        try {
          if (Platform.OS === 'android') {
            // First check if permission is already granted
            const hasPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            if (hasPermission) {
              // Permission already granted, get location
              const position = await new Promise<any>((resolve, reject) => {
                Geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 } // 5 second timeout, 5 min cache
                );
              });
              return {
                lat: position.coords.latitude,
                long: position.coords.longitude,
              };
            } else {
              // Permission not granted, request it
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
              );

              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                const position = await new Promise<any>((resolve, reject) => {
                  Geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 } // 5 second timeout, 5 min cache
                  );
                });
                return {
                  lat: position.coords.latitude,
                  long: position.coords.longitude,
                };
              } else {
                // Use default location if permission denied
                return { lat: 24.7136, long: 46.6753 };
              }
            }
          } else {
            // iOS
            const position = await new Promise<any>((resolve, reject) => {
              Geolocation.getCurrentPosition(
                resolve,
                reject,
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 } // 5 second timeout, 5 min cache
              );
            });
            return {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            };
          }
        } catch (error) {
          // Use default location on any error (don't log to reduce noise)
          // Cache default location too so we don't keep trying
          const defaultLocation = { lat: 24.7136, long: 46.6753 };
          cachedLocationRef.current = { ...defaultLocation, timestamp: Date.now() };
          return defaultLocation;
        }
      };

      const locationStartTime = Date.now();
      const { lat, long } = await getLocation();
      const locationEndTime = Date.now();
      const locationDuration = locationEndTime - locationStartTime;
      
      console.log(`📍 Location fetch took: ${locationDuration}ms (${(locationDuration / 1000).toFixed(2)}s)`);
      
      // Cache the location (whether it's real or default)
      cachedLocationRef.current = { lat, long, timestamp: Date.now() };

      const requestStartTime = Date.now();
      const requestId = `CART_COUNT_${requestStartTime}`;
      
      console.log(`📊 [${requestId}] START fetchCartCount API Call`);
      console.log(`📊 [${requestId}] Endpoint: ${API.CART.VIEW_CART_DETAILS}`);
      console.log(`📊 [${requestId}] Params: lat=${lat}, long=${long}`);
      console.log(`📊 [${requestId}] Timestamp: ${new Date().toISOString()}`);
      console.log(`📊 [${requestId}] Location fetch duration: ${locationDuration}ms`);

      const response = await apiClient.get(API.CART.VIEW_CART_DETAILS, {
        params: {
          lat: lat.toString(),
          long: long.toString(),
        },
      });
      
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.log(`📊 [${requestId}] ✅ SUCCESS - fetchCartCount`);
      console.log(`📊 [${requestId}] Duration: ${requestDuration}ms (${(requestDuration / 1000).toFixed(2)}s)`);
      console.log(`📊 [${requestId}] Total time (location + API): ${(requestEndTime - locationStartTime)}ms`);
      console.log(`📊 [${requestId}] Response Status: ${response.status}`);
      console.log(`📊 [${requestId}] Response Data Size: ~${JSON.stringify(response.data).length} bytes`);

      if (response.data?.success && response.data?.data) {
        // Calculate total count of items across all clinic groups
        const cartData = response.data.data;
        let totalCount = 0;

        if (Array.isArray(cartData)) {
          cartData.forEach((clinicGroup: any) => {
            if (clinicGroup.items && Array.isArray(clinicGroup.items)) {
              totalCount += clinicGroup.items.length;
            }
          });
        }

        setContextCount(totalCount);
      } else {
        setContextCount(0);
      }
    } catch (error: any) {
      const totalEndTime = Date.now();
      const totalDuration = totalEndTime - now;
      
      console.error(`📊 [CART_COUNT] ❌ ERROR - fetchCartCount`);
      console.error(`📊 [CART_COUNT] Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.error(`📊 [CART_COUNT] Error:`, error);
      console.error(`📊 [CART_COUNT] Error Message:`, error?.message);
      console.error(`📊 [CART_COUNT] Error Response:`, error?.response?.data);
      console.error(`📊 [CART_COUNT] Error Status:`, error?.response?.status);
      
      setContextCount(0);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      const totalDuration = Date.now() - now;
      console.log(`📊 [CART_COUNT] 🏁 COMPLETE - Total time: ${totalDuration}ms`);
    }
  }, [setContextCount]);

  // Fetch on mount (only once when component mounts)
  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Refresh when refreshTrigger changes (triggered by cart operations)
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Small delay to ensure cart operation is complete
      const timer = setTimeout(() => {
        fetchCartCount();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Only depend on refreshTrigger

  // Refresh when screen is focused (with debouncing)
  useFocusEffect(
    useCallback(() => {
      // Only fetch if we haven't fetched recently (debounce focus events)
      const now = Date.now();
      if (now - lastFetchTimeRef.current > 3000) {
        const timer = setTimeout(() => {
          fetchCartCount();
        }, 300);
        return () => clearTimeout(timer);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty deps - only check lastFetchTime via ref
  );

  return { cartCount: contextCount, loading, refreshCartCount: fetchCartCount };
};
