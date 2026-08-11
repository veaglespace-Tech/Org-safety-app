import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const DEFAULT_PORT = 5001;
export const FALLBACK_LAN_IP = '10.76.207.139';

export const LIVE_API_URL =
  process.env.EXPO_PUBLIC_LIVE_API_URL || 'https://tichisuraksha.veaglespace.com/api';

export const LIVE_CLIENT_URL =
  process.env.EXPO_PUBLIC_CLIENT_BASE_URL || 'https://tichisuraksha.veaglespace.com';

const trimTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');
const stripApiSuffix = (value) => String(value || '').replace(/\/api$/i, '');

export const getHostAddress = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  }

  // If running via Expo Go on a mobile device or simulator
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android Emulator
  }

  return FALLBACK_LAN_IP || 'localhost';
};

export const getLocalApiUrl = () => {
  const host = getHostAddress();
  return `http://${host}:${DEFAULT_PORT}/api`;
};

const resolveBaseUrl = () => {
  const explicitUrl =
    process.env.EXPO_PUBLIC_API_URL_PROD ||
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_LIVE_API_URL;

  // On Web: if running from localhost/127.0.0.1 during local development
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location?.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // If explicit URL targets local backend (e.g. http://localhost:5001/api), use it directly
      if (explicitUrl && (explicitUrl.includes('localhost') || explicitUrl.includes('127.0.0.1'))) {
        return trimTrailingSlash(explicitUrl);
      }
      // If user explicitly forced direct API calls to remote server
      if (process.env.EXPO_PUBLIC_FORCE_DIRECT_API === 'true' && explicitUrl) {
        return trimTrailingSlash(explicitUrl);
      }
      // Use Metro dev proxy (/api) to transparently proxy requests to live API without CORS errors
      return `${window.location.origin}/api`;
    }
  }

  if (explicitUrl) {
    return trimTrailingSlash(explicitUrl);
  }

  // On Mobile (Expo Go / simulator) with no env var: use dynamic host detection
  if (__DEV__ && Platform.OS !== 'web') {
    return getLocalApiUrl();
  }

  // Default to live backend URL in Production
  return LIVE_API_URL;
};

export const API_BASE_URL = resolveBaseUrl();

export const CLIENT_BASE_URL =
  trimTrailingSlash(process.env.EXPO_PUBLIC_CLIENT_BASE_URL) ||
  stripApiSuffix(API_BASE_URL) ||
  LIVE_CLIENT_URL;
