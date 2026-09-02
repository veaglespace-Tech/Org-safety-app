import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setLocation, setTrackingState, setLocationError, clearLocation } from '@/store/slices/locationSlice';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : 'http://localhost:5001';
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || apiBaseUrl;

// Maximum acceptable accuracy in meters — readings worse than this are discarded
const MAX_ACCURACY_THRESHOLD = 100;
// Minimum distance in meters the user must move before we emit a new location update
const MIN_DISTANCE_THRESHOLD = 5;
// Heartbeat interval in ms — tells viewers the tracker is still alive even when stationary
const HEARTBEAT_INTERVAL = 30000;

/**
 * Haversine distance between two lat/lng points in meters.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useGeoLocationTracker = (token) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastEmittedRef = useRef({ latitude: null, longitude: null, timestamp: 0 });

  const emitLocation = useCallback((locationData) => {
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

  const startTracking = useCallback(() => {
    if (!token) return;

    // 1. Initialize Socket.io connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        path: '/api/socket.io',
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to location tracking socket server');
        socketRef.current.emit('join-track', { token });

        // Re-emit last known position on reconnect so viewers get it immediately
        const last = lastEmittedRef.current;
        if (last.latitude != null && last.longitude != null) {
          socketRef.current.emit('location-updated', {
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
        socketRef.current.emit('join-track', { token });
      });
    }

    // 2. Start Heartbeat — sends a pulse every 30s to keep viewers aware tracker is alive
    if (!heartbeatRef.current) {
      heartbeatRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('tracker-heartbeat', { token });
        }
      }, HEARTBEAT_INTERVAL);
    }

    // 3. Send Initial Location Immediately
    if ('geolocation' in navigator) {
      dispatch(setTrackingState(true));
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          emitLocation({
            latitude,
            longitude,
            accuracy,
            speed: speed != null ? speed : null,
            heading: heading != null ? heading : null,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.warn('Could not fetch initial location for tracking', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          const timestamp = position.timestamp;

          // ACCURACY FILTER: Discard readings with accuracy worse than threshold
          if (accuracy > MAX_ACCURACY_THRESHOLD) {
            console.log(`Discarding inaccurate GPS reading: ${Math.round(accuracy)}m accuracy`);
            return;
          }

          // DISTANCE THROTTLE: Only emit if user moved at least MIN_DISTANCE_THRESHOLD meters
          const last = lastEmittedRef.current;
          if (last.latitude != null && last.longitude != null) {
            const distance = haversineDistance(last.latitude, last.longitude, latitude, longitude);
            const timeSinceLastEmit = Date.now() - last.timestamp;

            // Skip if moved less than threshold AND less than 30s since last emit
            if (distance < MIN_DISTANCE_THRESHOLD && timeSinceLastEmit < HEARTBEAT_INTERVAL) {
              return;
            }
          }

          // Emit the accurate, distance-filtered location
          emitLocation({
            latitude,
            longitude,
            accuracy,
            speed: speed != null ? speed : null,
            heading: heading != null ? heading : null,
            timestamp,
          });
        },
        (error) => {
          console.error('Geolocation Error:', error);
          dispatch(setLocationError(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000, // Allow slightly cached readings to reduce battery drain
        }
      );
    } else {
      dispatch(setLocationError('Geolocation is not supported by your browser.'));
    }
  }, [token, dispatch, emitLocation]);

  const stopTracking = useCallback(() => {
    // 1. Stop Geolocation Watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

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

export default useGeoLocationTracker;
