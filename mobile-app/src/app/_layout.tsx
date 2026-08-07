import '../global.css';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import React, { useEffect } from 'react';
import { loadSession } from '@/store/slices/authSlice';

export default function RootLayout() {
  
  useEffect(() => {
    store.dispatch(loadSession());
  }, []);

  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
