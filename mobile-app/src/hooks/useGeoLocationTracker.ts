import { useEffect, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { setLocation, setTrackingState, setLocationError, clearLocation } from '../store/slices/locationSlice';
import { API_BASE_URL } from '../config';
import { BACKGROUND_LOCATION_TASK } from '@/tasks/backgroundLocationTask';

const SOCKET_SERVER_URL = API_BASE_URL || 'http://localhost:5001';

// Maximum acceptable accuracy in meters — readings worse than this are discarded
const MAX_ACCURACY_THRESHOLD = 100;
// Minimum distance in meters the user must move before we emit a new location update
const MIN_DISTANCE_THRESHOLD = 5;
// Heartbeat interval in ms — tells viewers the tracker is still alive even when stationary
const HEARTBEAT_INTERVAL = 30000;

/**
 * Haversine distance between two lat/lng points in meters.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useGeoLocationTracker = (token: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedRef = useRef({ latitude: null as number | null, longitude: null as number | null, timestamp: 0 });

  const emitLocation = useCallback((locationData: { latitude: number; longitude: number; accuracy: number; speed: number | null; heading: number | null; timestamp: number }) => {
    // Dispatch to Redux global store
    dispatch(setLocation(locationData));

    // Emit to Socket.io server
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('location-updated', {
        token,
        ...locationData,
      });
    }

    // Update last emitted reference
    lastEmittedRef.current = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: Date.now(),
    };
  }, [token, dispatch]);

  const startTracking = useCallback(async () => {
    if (!token) return;

    // 1. Request Permissions
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      dispatch(setLocationError('Foreground permission to access location was denied'));
      return;
    }

    // Prominent Disclosure for Android (Google Play Policy)
    let bgStatus = 'undetermined';
    
    if (Platform.OS === 'android') {
      const { status: existingBgStatus } = await Location.getBackgroundPermissionsAsync();
      
      if (existingBgStatus !== 'granted') {
        // Must wait for user to acknowledge the prominent disclosure
        await new Promise((resolve) => {
          Alert.alert(
            "Background Location Required",
            "तिची सुरक्षा collects location data to enable live tracking with your emergency contacts even when the app is closed or not in use during an active SOS.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false)
              },
              {
                text: "I Understand",
                onPress: () => resolve(true)
              }
            ],
            { cancelable: false }
          );
        }).then(async (proceed) => {
          if (proceed) {
            const { status } = await Location.requestBackgroundPermissionsAsync();
            bgStatus = status;
          }
        });
      } else {
        bgStatus = 'granted';
      }
    } else {
      // iOS handles prominent disclosure via info.plist and OS prompts natively
      const { status } = await Location.requestBackgroundPermissionsAsync();
      bgStatus = status;
    }

    if (bgStatus !== 'granted') {
      console.warn('Background location permission denied. Tracking will only work in foreground.');
    }

    // 2. Initialize Socket.io connection
    if (!socketRef.current) {
      // Create a URL object robustly
      let url = SOCKET_SERVER_URL;
      if (url.includes('/api')) {
        url = url.split('/api')[0]; // socket is usually at root
      }
      socketRef.current = io(url, {
        path: '/api/socket.io',
        transports: ['polling', 'websocket'], // Use default transports to allow Nginx polling fallback
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to location tracking socket server');
        socketRef.current?.emit('join-track', { token });

        // Re-emit last known position on reconnect so viewers get it immediately
        const last = lastEmittedRef.current;
        if (last.latitude != null && last.longitude != null) {
          socketRef.current?.emit('location-updated', {
            token,
            latitude: last.latitude,
            longitude: last.longitude,
            accuracy: null,
            speed: null,
            heading: null,
            timestamp: last.timestamp,
          });
        }
      });

      socketRef.current.on('reconnect', () => {
        console.log('Reconnected to location tracking socket server');
        socketRef.current?.emit('join-track', { token });
      });
    }

    // 3. Start Heartbeat — sends a pulse every 30s to keep viewers aware tracker is alive
    if (!heartbeatRef.current) {
      heartbeatRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('tracker-heartbeat', { token });
        }
      }, HEARTBEAT_INTERVAL);
    }

    // 4. Send Initial Location Immediately
    try {
      const initialLocation = await Location.getLastKnownPositionAsync() || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (initialLocation) {
        emitLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          accuracy: initialLocation.coords.accuracy || 0,
          speed: initialLocation.coords.speed !== null ? initialLocation.coords.speed : null,
          heading: initialLocation.coords.heading !== null ? initialLocation.coords.heading : null,
          timestamp: initialLocation.timestamp,
        });
      }
    } catch (e) {
      console.warn('Could not fetch initial location for tracking', e);
    }

    // 5. Start Geolocation Watch
    dispatch(setTrackingState(true));

    watchSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 1, // Get updates frequently, throttle in JS
      },
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        const timestamp = position.timestamp;

        // ACCURACY FILTER: Discard readings with accuracy worse than threshold
        if (accuracy && accuracy > MAX_ACCURACY_THRESHOLD) {
          console.log(`Discarding inaccurate GPS reading: ${Math.round(accuracy)}m accuracy`);
          return;
        }

        // 1. ALWAYS dispatch to Redux so the local UI map moves smoothly
        dispatch(setLocation({
          latitude,
          longitude,
          accuracy: accuracy || 0,
          speed: speed !== null ? speed : null,
          heading: heading !== null ? heading : null,
          timestamp,
        }));

        // 2. Emit the accurate, distance-filtered location to the Socket server immediately
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('location-updated', {
            token,
            latitude,
            longitude,
            accuracy: accuracy || 0,
            speed: speed !== null ? speed : null,
            heading: heading !== null ? heading : null,
            timestamp,
          });
        }

        // 3. Update last emitted reference
        lastEmittedRef.current = {
          latitude,
          longitude,
          timestamp: Date.now(),
        };
      }
    );

    // 6. Start Background Geolocation Task
    if (bgStatus === 'granted') {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'तिची सुरक्षा SOS Active',
          notificationBody: 'Your live location is being shared with emergency contacts.',
          notificationColor: '#ef4444',
        },
      });
    }

  }, [token, dispatch]);

  const stopTracking = useCallback(() => {
    // 1. Stop Geolocation Watch & Background Task
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }
    
    Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(err => console.log('Task stop error:', err));

    // 2. Stop Heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    // 3. Disconnect Socket
    if (socketRef.current) {
      socketRef.current.emit('leave-track', { token });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // 4. Reset refs
    lastEmittedRef.current = { latitude: null, longitude: null, timestamp: 0 };

    dispatch(setTrackingState(false));
    dispatch(clearLocation());
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [token, startTracking, stopTracking]);

  return { startTracking, stopTracking };
};
