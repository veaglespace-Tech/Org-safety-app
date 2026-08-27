import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useAppTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'pill';
  containerClass?: string;
}

export function ThemeToggle({ variant = 'button', containerClass = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme, setTheme } = useAppTheme();

  if (variant === 'pill') {
    return (
      <View 
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.8)',
          padding: 4,
          borderRadius: 16,
          borderColor: '#334155',
          borderWidth: 1,
        }}
      >
        <Pressable onPress={() => setTheme('light')}>
          <View 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              gap: 6,
              backgroundColor: !isDark ? '#ffffff' : 'transparent',
              opacity: !isDark ? 1 : 0.6,
              shadowColor: !isDark ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: !isDark ? 2 : 0,
            }}
          >
            <Sun size={14} color={!isDark ? '#eab308' : '#94a3b8'} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: !isDark ? '#0f172a' : '#94a3b8' }}>
              Light
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => setTheme('dark')}>
          <View 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              gap: 6,
              backgroundColor: isDark ? '#0f172a' : 'transparent',
              opacity: isDark ? 1 : 0.6,
              borderColor: isDark ? '#334155' : 'transparent',
              borderWidth: isDark ? 1 : 0,
              shadowColor: isDark ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: isDark ? 2 : 0,
            }}
          >
            <Moon size={14} color={isDark ? '#60a5fa' : '#94a3b8'} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDark ? '#ffffff' : '#94a3b8' }}>
              Dark
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <View 
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
          borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#cbd5e1',
        }}
      >
        {isDark ? (
          <Sun size={17} color="#facc15" />
        ) : (
          <Moon size={17} color="#0f172a" />
        )}
      </View>
    </Pressable>
  );
}
