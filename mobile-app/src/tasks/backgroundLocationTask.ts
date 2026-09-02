import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { API_BASE_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      
      try {
        // Retrieve the token from AsyncStorage (Redux store is not reliably available in background)
        const tokenString = await AsyncStorage.getItem('auth_token');
        const trackingToken = await AsyncStorage.getItem('tracking_token');
        
        if (!tokenString || !trackingToken) return;

        let token = tokenString;
        try {
          // Sometimes it's JSON stringified, sometimes it's raw
          token = JSON.parse(tokenString);
        } catch(e) {}

        // Send location via REST API since Socket.IO is unstable in background tasks
        await fetch(`${API_BASE_URL}/sos/background-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            token: trackingToken,
            latitude,
            longitude,
            accuracy,
            heading,
            speed
          })
        });

      } catch (err) {
        console.error('Failed to send background location:', err);
      }
    }
  }
});
