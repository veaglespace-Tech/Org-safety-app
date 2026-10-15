import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { validateAndSendLocation } from '@/utils/locationSender';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Task Error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations || locations.length === 0) return;

    try {
      const trackingToken = await SecureStore.getItemAsync('tracking_token');
      const authToken = (await SecureStore.getItemAsync('token')) || '';

      if (!trackingToken) {
        return;
      }

      // Process the most recent location update
      const latest = locations[locations.length - 1];
      const { latitude, longitude, accuracy, speed, heading } = latest.coords;
      const timestamp = latest.timestamp;

      await validateAndSendLocation(
        {
          latitude,
          longitude,
          accuracy: accuracy || 0,
          speed,
          heading,
          timestamp,
        },
        trackingToken,
        authToken,
        null, // Socket not available in background worker headless task; falls back to REST API
        true  // isBackground
      );
    } catch (taskErr) {
      console.warn('Background Location processing error:', taskErr);
    }
  }
});

