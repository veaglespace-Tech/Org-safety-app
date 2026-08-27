import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setLocation, setTrackingState, setLocationError, clearLocation } from '@/store/slices/locationSlice';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : 'http://localhost:5001';
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || apiBaseUrl;

export const useGeoLocationTracker = (token) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  const startTracking = useCallback(() => {
    if (!token) return;

    // 1. Initialize Socket.io connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        path: '/api/socket.io',
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to location tracking socket server');
        socketRef.current.emit('join-track', { token });
      });
    }

    // 2. Start Geolocation Watch
    if ('geolocation' in navigator) {
      dispatch(setTrackingState(true));

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const timestamp = position.timestamp;

          // Dispatch to Redux global store
          dispatch(setLocation({ latitude, longitude, accuracy, timestamp }));

          // Emit to Socket.io server
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('location-updated', {
              token,
              latitude,
              longitude,
              accuracy,
              timestamp,
            });
          }
        },
        (error) => {
          console.error('Geolocation Error:', error);
          dispatch(setLocationError(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } else {
      dispatch(setLocationError('Geolocation is not supported by your browser.'));
    }
  }, [token, dispatch]);

  const stopTracking = useCallback(() => {
    // 1. Stop Geolocation Watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // 2. Disconnect Socket
    if (socketRef.current) {
      socketRef.current.emit('leave-track', { token });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    dispatch(setTrackingState(false));
    dispatch(clearLocation());
  }, [token, dispatch]);

  useEffect(() => {
    // Optional: Auto-start if token is provided on mount
    // You could also return `startTracking` and let the component call it.
    // For this hook, we'll auto-start if token exists.
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
