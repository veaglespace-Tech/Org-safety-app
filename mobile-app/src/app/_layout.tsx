import '../ignoreWarnings';
import '../global.css';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';
import { loadSession } from '@/store/slices/authSlice';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/tasks/backgroundLocationTask';


LogBox.ignoreLogs([
  '[Reanimated] Writing to `value` during component render',
  '[Reanimated] Reading from `value` during component render',
]);

function ThemeAwareStatusBar() {
  const { isDark } = useAppTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function AppNavigation() {
  return (
    <>
      <ThemeAwareStatusBar />
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
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
