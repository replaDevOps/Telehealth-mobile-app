import { GOOGLE_MAPS_API_KEY, GOOGLE_PLACES_API_BASE_URL } from '../../constants/maps';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface PlacesAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

/**
 * Search for places using Google Places Autocomplete API
 * @param query - Search query string
 * @param location - Optional location bias (latitude, longitude)
 * @returns Promise with array of place predictions
 */
export const searchPlaces = async (
  query: string,
  location?: { lat: number; lng: number }
): Promise<PlacePrediction[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    let url = `${GOOGLE_PLACES_API_BASE_URL}/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=en`;

    // Add location bias if provided
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=50000`; // 50km radius
    }

    const response = await fetch(url);
    const data: PlacesAutocompleteResponse = await response.json();

    if (data.status === 'OK' && data.predictions) {
      return data.predictions;
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.warn('Google Places API error:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Get place details by place_id
 * @param placeId - Google Places place_id
 * @returns Promise with place details including coordinates
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const url = `${GOOGLE_PLACES_API_BASE_URL}/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&language=en&fields=place_id,formatted_address,geometry,name,address_components`;

    const response = await fetch(url);
    const data: PlaceDetailsResponse = await response.json();

    if (data.status === 'OK' && data.result) {
      // Ensure coordinates are numbers (API might return them as strings)
      if (data.result.geometry && data.result.geometry.location) {
        const lat = data.result.geometry.location.lat;
        const lng = data.result.geometry.location.lng;
        
        // Validate coordinates exist and convert to numbers
        if (lat == null || lng == null) {
          console.warn('Missing coordinates from Google Places API');
          return null;
        }
        
        // Convert to numbers, handling both string and number types
        const latNum = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
        const lngNum = typeof lng === 'string' ? parseFloat(lng) : Number(lng);
        
        // Validate coordinates are valid numbers
        if (isNaN(latNum) || isNaN(lngNum)) {
          console.warn('Invalid coordinates from Google Places API:', { lat, lng });
          return null;
        }
        
        // Update with numeric values
        data.result.geometry.location.lat = latNum;
        data.result.geometry.location.lng = lngNum;
      }
      return data.result;
    } else {
      console.warn('Google Places Details API error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to a short "City, Country" label using the
 * Google Geocoding API.
 *
 * Unlike `reverseGeocode` (which returns a full street address, suitable for a
 * map pin), this reads `address_components` and returns only the locality and
 * country - the format the home header expects.
 *
 * Callers should cache the result: see `useLocationStore`, which only calls
 * this when its cached label is stale or the user has moved a meaningful
 * distance, keeping usage inside the Geocoding API free tier.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with "City, Country", or an empty string if unavailable
 */
export const reverseGeocodeCity = async (lat: number, lng: number): Promise<string> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('Google Geocoding API error:', data.status);
      return '';
    }

    // Google returns results from most to least specific; scan every result's
    // components so we still find a locality when the closest match is a
    // street address or a plus code.
    const components: Array<{ long_name: string; types: string[] }> = data.results.flatMap(
      (result: any) => result.address_components ?? []
    );

    const pick = (...types: string[]): string => {
      for (const type of types) {
        const match = components.find(c => Array.isArray(c.types) && c.types.includes(type));
        if (match?.long_name) return match.long_name;
      }
      return '';
    };

    // postal_town covers regions (e.g. the UK) where locality is often absent;
    // the admin-area levels are a last resort for rural coordinates.
    const city = pick(
      'locality',
      'postal_town',
      'administrative_area_level_2',
      'administrative_area_level_1'
    );
    const country = pick('country');

    if (city && country) return `${city}, ${country}`;
    return country || city || '';
  } catch (error) {
    console.error('Error reverse geocoding city:', error);
    return '';
  }
};

/**
 * Reverse geocode coordinates to get address using Google Geocoding API
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with formatted address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.warn('Google Geocoding API error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};
