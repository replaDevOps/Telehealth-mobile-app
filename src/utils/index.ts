import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores a key-value pair in async storage.
 * @param key The key to store the value under.
 * @param value The value to store; can be anything serializable.
 */
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // handle error
    console.error('Error storing data', e);
  }
};

/**
 * Retrieves a value for a given key from async storage.
 * @param key The key of the item to retrieve.
 * @returns The value associated with the key, or null if not found.
 */
export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
  } catch (e) {
    console.error('Error getting data', e);
    return null;
  }
};

/**
 * Removes a key-value pair from async storage.
 * @param key The key of the item to remove.
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing data', e);
  }
};

// Try catch block
type SuccessResult<T> = readonly [T, null];

type ErrorResult<E = Error> = readonly [null, E];

type Result<T, E = Error> = SuccessResult<T> | ErrorResult<E>;

export const tryCatch = async <T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T,E>> => {
  try {
    const data = await promise;
    return [data, null] as const
  } catch (error) {
    return [null, error as E] as const;
  }
};

/**
 * Converts a UTC timestamp to local time format (HH:MM AM/PM)
 * Handles various timestamp formats: ISO strings, Unix timestamps, Date objects
 * @param timestamp The timestamp to convert (can be string, number, or Date)
 * @returns Formatted time string in local timezone
 */
export const formatUTCToLocalTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    let date: Date;
    
    // Handle different timestamp formats
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // Unix timestamp - check if seconds or milliseconds
      date = timestamp < 1e12 ? new Date(timestamp * 1000) : new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      // Normalize common server timestamp formats and ensure UTC parsing when needed
      let ts = timestamp.trim();

      // If timestamp looks like 'YYYY-MM-DD HH:MM:SS' convert space to 'T'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(ts)) {
        ts = ts.replace(' ', 'T');
      }

      // If timestamp is ISO-like but has no timezone (no 'Z' or +/-offset), treat as UTC by appending 'Z'
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(ts)) {
        ts = ts + 'Z';
      }

      date = new Date(ts);
    } else {
      return String(timestamp);
    }

    // Check if valid date
    if (isNaN(date.getTime())) {
      return String(timestamp);
    }

    // Convert to local time and format
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return String(timestamp);
  }
};

export * from './getMappedErrorMessage';

