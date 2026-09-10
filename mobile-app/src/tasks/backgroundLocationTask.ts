import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateAndSendLocation } from '../utils/locationSender';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    if (locations && locations.length > 0) {
      const location = locations[0];
      const { latitude, longitude, accuracy, heading, speed } = location.coords;
      const timestamp = location.timestamp || Date.now();
      
      try {
        const tokenString = await AsyncStorage.getItem('auth_token');
        const trackingToken = await AsyncStorage.getItem('tracking_token');
        
        if (!tokenString || !trackingToken) return;

        await validateAndSendLocation(
          { latitude, longitude, accuracy: accuracy || 0, heading, speed, timestamp },
          trackingToken,
          tokenString,
          null, // No socket in background task
          true  // isBackground = true
        );

      } catch (err) {
        console.error('Failed to send background location:', err);
      }
    }
  }
});
