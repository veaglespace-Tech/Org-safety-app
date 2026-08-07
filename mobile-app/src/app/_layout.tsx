import '../global.css';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import React, { useEffect } from 'react';
import { loadSession } from '@/store/slices/authSlice';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

function AppNavigation() {
  const { isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    store.dispatch(loadSession());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </Provider>
  );
}
