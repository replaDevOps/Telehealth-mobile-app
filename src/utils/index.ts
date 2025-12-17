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
