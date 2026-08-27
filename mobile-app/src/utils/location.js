import * as Location from 'expo-location';

export const getGeolocationPermissionState = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (e) {
    return 'unknown';
  }
};

export const getCurrentCoordinates = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied. Please enable location permissions in settings.');
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return [
      Number(position.coords.longitude.toFixed(6)),
      Number(position.coords.latitude.toFixed(6)),
    ];
  } catch (error) {
    throw new Error(error?.message || 'Could not fetch current GPS location. Ensure location is enabled.');
  }
};
