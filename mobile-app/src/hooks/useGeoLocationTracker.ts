import { useEffect, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocation, setTrackingState, setLocationError, clearLocation } from '../store/slices/locationSlice';
import { API_BASE_URL } from '../config';
import { BACKGROUND_LOCATION_TASK } from '@/tasks/backgroundLocationTask';
import { validateAndSendLocation, clearLocationMemory } from '../utils/locationSender';

const SOCKET_SERVER_URL = API_BASE_URL || 'http://localhost:5001';
const HEARTBEAT_INTERVAL = 30000;

export const useGeoLocationTracker = (token: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = useCallback(async () => {
    if (!token) return;

    // 1. Request Permissions
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      dispatch(setLocationError('Foreground permission to access location was denied'));
      return;
    }

    let bgStatus = 'undetermined';
    if (Platform.OS === 'android') {
      const { status: existingBgStatus } = await Location.getBackgroundPermissionsAsync();
      if (existingBgStatus !== 'granted') {
        await new Promise((resolve) => {
          Alert.alert(
            "Background Location Required",
            "तिची सुरक्षा collects location data to enable live tracking with your emergency contacts even when the app is closed or not in use during an active SOS.",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "I Understand", onPress: () => resolve(true) }
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
      const { status } = await Location.requestBackgroundPermissionsAsync();
      bgStatus = status;
    }

    if (bgStatus !== 'granted') {
      console.warn('Background location permission denied. Tracking will only work in foreground.');
    }

    const authToken = await AsyncStorage.getItem('auth_token') || '';

    // 2. Initialize Socket.io connection
    if (!socketRef.current) {
      let url = SOCKET_SERVER_URL;
      if (url.includes('/api')) {
        url = url.split('/api')[0];
      }
      socketRef.current = io(url, {
        path: '/api/socket.io',
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to location tracking socket server');
        socketRef.current?.emit('join-track', { token });
      });

      socketRef.current.on('reconnect', () => {
        console.log('Reconnected to location tracking socket server');
        socketRef.current?.emit('join-track', { token });
      });
    }

    // 3. Start Heartbeat — tells viewers tracker is alive without resending stale GPS
    if (!heartbeatRef.current) {
      heartbeatRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('tracker-heartbeat', { token });
        }
      }, HEARTBEAT_INTERVAL);
    }

    // 4. Send Initial Location Immediately
    (async () => {
      try {
        let initialLocation = await Location.getLastKnownPositionAsync();
        if (!initialLocation) {
          initialLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }
        if (initialLocation) {
          const { latitude, longitude, accuracy, speed, heading } = initialLocation.coords;
          const timestamp = initialLocation.timestamp;

          dispatch(setLocation({ latitude, longitude, accuracy: accuracy || 0, speed, heading, timestamp }));

          await validateAndSendLocation(
            { latitude, longitude, accuracy: accuracy || 0, speed, heading, timestamp },
            token,
            authToken,
            socketRef.current,
            false
          );
        }
      } catch (e) {
        console.warn('Could not fetch initial location for tracking', e);
      }
    })();

    // 5. Start Geolocation Watch
    dispatch(setTrackingState(true));

    watchSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced, // CRITICAL FIX: 'High' requires direct satellite line-of-sight. 'Balanced' works indoors.
        timeInterval: 3000,
        distanceInterval: 0, // CRITICAL FIX: Must be 0 so it fires even if stationary
      },
      async (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        const timestamp = position.timestamp;

        console.log(`\n\n🟢 [GPS WATCHER] Captured Coordinates! Lat: ${latitude}, Lng: ${longitude}, Acc: ${accuracy}m`);

        // Dispatch locally for UI map
        dispatch(setLocation({ latitude, longitude, accuracy: accuracy || 0, speed, heading, timestamp }));

        // Send via unified sender
        const success = await validateAndSendLocation(
          { latitude, longitude, accuracy: accuracy || 0, speed, heading, timestamp },
          token,
          authToken,
          socketRef.current,
          false
        );

        console.log(`🟢 [SOCKET EMIT] Payload sent successfully? ${success ? 'YES' : 'NO (Check distance/accuracy filters)'}\n\n`);
      }
    );

    // 6. Start Background Geolocation Task
    if (bgStatus === 'granted') {
      try {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'तिची सुरक्षा SOS Active',
            notificationBody: 'Your live location is being shared with emergency contacts.',
            notificationColor: '#ef4444',
          },
        });
      } catch (err) {
        console.warn('Background tracking not supported in this environment (likely Expo Go). Foreground tracking will continue to work.', err);
      }
    }

  }, [token, dispatch]);

  const stopTracking = useCallback(() => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }

    Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).then((isTracking) => {
      if (isTracking) {
        Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(err => console.log('Task stop error:', err));
      }
    });

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.emit('leave-track', { token });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    clearLocationMemory();
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
