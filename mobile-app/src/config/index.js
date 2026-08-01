import { Platform } from 'react-native';

const DEFAULT_CLIENT_BASE_URL = "https://atty.veaglespace.com";

const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    return "http://10.0.2.2:5001/api"; // Default for Android Emulator
  }
  return "http://localhost:5001/api"; // Default for Web and iOS Simulator
};

const DEFAULT_API_BASE_URL = getLocalApiUrl();

const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");
const stripApiSuffix = (value) => value.replace(/\/api$/i, "");

// We check if there's an explicit URL provided, otherwise fallback to our robust local URL
const configuredApiBaseUrl = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_URL_PROD || process.env.EXPO_PUBLIC_API_URL
);

export const API_BASE_URL = configuredApiBaseUrl || DEFAULT_API_BASE_URL;

export const CLIENT_BASE_URL = trimTrailingSlash(process.env.EXPO_PUBLIC_CLIENT_BASE_URL)
  || stripApiSuffix(API_BASE_URL)
  || DEFAULT_CLIENT_BASE_URL;
