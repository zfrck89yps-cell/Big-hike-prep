import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  PROFILES: 'big-hike:profiles',
  ACTIVE_PROFILE: 'big-hike:active-profile',
  LOGS: 'big-hike:logs',
};

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
