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
  // If production URL is explicitly requested
  if (process.env.EXPO_PUBLIC_API_URL_PROD) {
    return trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL_PROD);
  }

  const rawEnvUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL || process.env.EXPO_PUBLIC_API_URL;
  let configuredUrl = trimTrailingSlash(rawEnvUrl);

  // If on web, always connect to current web host or localhost
  if (Platform.OS === 'web') {
    if (configuredUrl && configuredUrl.includes('10.0.2.2')) {
      const webHost = (typeof window !== 'undefined' && window.location?.hostname) || 'localhost';
      return configuredUrl.replace('10.0.2.2', webHost);
    }
    return configuredUrl || getLocalApiUrl();
  }

  // If running on a physical phone via Expo Go, ensure we use the actual LAN IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const lanHost = hostUri.split(':')[0];
    if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
      if (
        configuredUrl &&
        (configuredUrl.includes('10.0.2.2') ||
          configuredUrl.includes('localhost') ||
          configuredUrl.includes('127.0.0.1'))
      ) {
        return configuredUrl
          .replace('10.0.2.2', lanHost)
          .replace('localhost', lanHost)
          .replace('127.0.0.1', lanHost);
      }
      return configuredUrl || `http://${lanHost}:${DEFAULT_PORT}/api`;
    }
  }

  return configuredUrl || getLocalApiUrl();
};

export const API_BASE_URL = resolveBaseUrl();

export const CLIENT_BASE_URL =
  trimTrailingSlash(process.env.EXPO_PUBLIC_CLIENT_BASE_URL) ||
  stripApiSuffix(API_BASE_URL) ||
  LIVE_CLIENT_URL;
