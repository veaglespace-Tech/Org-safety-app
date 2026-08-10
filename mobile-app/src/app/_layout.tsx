import '../global.css';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';

LogBox.ignoreLogs([
  '[Reanimated] Writing to `value` during component render',
  '[Reanimated] Reading from `value` during component render',
]);
import { loadSession } from '@/store/slices/authSlice';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppNavigation() {
  const { isDark } = useAppTheme();

  return (
    <View className={isDark ? 'dark flex-1' : 'flex-1'} style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </View>
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
          <AppNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
