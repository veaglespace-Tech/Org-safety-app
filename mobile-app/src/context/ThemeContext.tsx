import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'veagle-theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeState(stored);
          const resolved = stored === 'system' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : stored;
          setColorScheme(resolved);
        } else {
          // Default to dark theme matching web default
          setThemeState('dark');
          setColorScheme('dark');
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
        setThemeState('dark');
        setColorScheme('dark');
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    const resolved = newTheme === 'system' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : newTheme;
    setColorScheme(resolved);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isDark = useMemo(() => {
    if (theme === 'system') {
      return deviceColorScheme === 'dark';
    }
    return theme === 'dark';
  }, [theme, deviceColorScheme]);

  useEffect(() => {
    if (hydrated) {
      const resolved = theme === 'system' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : theme;
      setColorScheme(resolved);

      if (typeof document !== 'undefined' && document.documentElement) {
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.style.colorScheme = 'light';
        }
      }
    }
  }, [deviceColorScheme, theme, hydrated]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
