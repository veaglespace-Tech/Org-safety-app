import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useAppTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'pill';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme, theme, setTheme } = useAppTheme();

  if (variant === 'pill') {
    return (
      <View className={`flex-row bg-slate-800/80 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-700 ${className}`}>
        <TouchableOpacity
          onPress={() => setTheme('light')}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl ${
            !isDark ? 'bg-white shadow-sm' : 'opacity-60'
          }`}
        >
          <Sun size={14} color={!isDark ? '#eab308' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${!isDark ? 'text-slate-900' : 'text-slate-400'}`}>
            Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTheme('dark')}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl ${
            isDark ? 'bg-slate-900 shadow-sm border border-slate-700' : 'opacity-60'
          }`}
        >
          <Moon size={14} color={isDark ? '#60a5fa' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-400'}`}>
            Dark
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.7}
      className={`w-9 h-9 rounded-full items-center justify-center border transition-all ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/80 text-amber-400'
          : 'bg-slate-100 border-slate-300 text-slate-700'
      } ${className}`}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={17} color="#facc15" />
      ) : (
        <Moon size={17} color="#0f172a" />
      )}
    </TouchableOpacity>
  );
}
