import { useEffect, useRef, useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { setLocation, setTrackingState, setLocationError, clearLocation } from '../store/slices/locationSlice';
import { API_BASE_URL } from '../config';
import { BACKGROUND_LOCATION_TASK } from '@/tasks/backgroundLocationTask';
import { validateAndSendLocation, clearLocationMemory } from '../utils/locationSender';

const SOCKET_SERVER_URL = API_BASE_URL || 'https://tichisuraksha.veaglespace.com';
const HEARTBEAT_INTERVAL = 30000;

export const useGeoLocationTracker = (token: string | null) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [disclosureConfig, setDisclosureConfig] = useState<{
    visible: boolean;
    type: 'foreground_location' | 'background_location';
    onAccept: () => void;
    onDecline: () => void;
  } | null>(null);

  const requestPermissions = useCallback(async (opts?: { requestBackground?: boolean }) => {
    try {
      // 1. Check existing foreground permissions
      const { status: existingFgStatus } = await Location.getForegroundPermissionsAsync();
      let fgStatus = existingFgStatus;

      // 2. Show Foreground Prominent Disclosure BEFORE foreground system prompt if needed
      if (fgStatus !== 'granted') {
        const proceedFg = await new Promise<boolean>((resolve) => {
          setDisclosureConfig({
            visible: true,
            type: 'foreground_location',
            onAccept: () => {
              setDisclosureConfig(null);
              setTimeout(() => resolve(true), 350);
            },
            onDecline: () => {
              setDisclosureConfig(null);
              setTimeout(() => resolve(false), 350);
            },
          });
        });

        if (!proceedFg) {
          dispatch(setLocationError('Foreground location tracking consent was declined.'));
          return false;
        }

        // Request Foreground Permissions (OS Prompt 1)
        const { status } = await Location.requestForegroundPermissionsAsync();
        fgStatus = status;
        if (fgStatus !== 'granted') {
          dispatch(setLocationError('Foreground permission to access location was denied.'));
          return false;
        }
      }

      // 3. Request Background Permissions ONLY if explicitly needed (e.g. during active SOS)
      // Must be immediately preceded by a dedicated Background Prominent Disclosure
      if (opts?.requestBackground && Platform.OS !== 'web' && typeof Location.getBackgroundPermissionsAsync === 'function') {
        const { status: existingBgStatus } = await Location.getBackgroundPermissionsAsync();
        let bgStatus = existingBgStatus;

        if (bgStatus !== 'granted') {
          const proceedBg = await new Promise<boolean>((resolve) => {
            setDisclosureConfig({
              visible: true,
              type: 'background_location',
              onAccept: () => {
                setDisclosureConfig(null);
                setTimeout(() => resolve(true), 350);
              },
              onDecline: () => {
                setDisclosureConfig(null);
                setTimeout(() => resolve(false), 350);
              },
            });
          });

          if (proceedBg && typeof Location.requestBackgroundPermissionsAsync === 'function') {
            // Request Background Permissions (OS Prompt 2)
            const { status } = await Location.requestBackgroundPermissionsAsync();
            bgStatus = status;
          }
        }
      }

      return fgStatus === 'granted';
    } catch (err) {
      console.warn('Error in requestPermissions flow:', err);
      return false;
    }
  }, [dispatch]);

  const startTracking = useCallback(async () => {
    if (!token) return;

    // Active SOS tracking: request permissions with background disclosure
    const hasPermission = await requestPermissions({ requestBackground: true });
    if (!hasPermission) return;

    // Permissions acquired, proceed with tracking

    const authToken = await SecureStore.getItemAsync('token') || '';

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

    // 6. Start Background Geolocation Task if on native platform and background permission is granted
    if (Platform.OS !== 'web' && typeof Location.getBackgroundPermissionsAsync === 'function') {
      try {
        const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
        if (bgStatus === 'granted' && typeof Location.startLocationUpdatesAsync === 'function') {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'तिची सुरक्षा SOS Active',
              notificationBody: 'Your live location is being shared with emergency contacts.',
              notificationColor: '#ef4444',
            },
          });
        }
      } catch (err) {
        console.warn('Background tracking not supported or denied. Foreground tracking will continue.', err);
      }
    }

  }, [token, dispatch]);

  const stopTracking = useCallback(() => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }

    if (Platform.OS !== 'web' && typeof Location.hasStartedLocationUpdatesAsync === 'function') {
      Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        .then((isTracking) => {
          if (isTracking && typeof Location.stopLocationUpdatesAsync === 'function') {
            Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch((err) =>
              console.log('Task stop error:', err)
            );
          }
        })
        .catch(() => {});
    }

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

  return { startTracking, stopTracking, disclosureConfig, requestPermissions };
};
