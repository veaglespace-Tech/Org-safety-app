import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';

export function AppFooter() {
  const { isDark } = useAppTheme();

  const handleOpenShivmudra = () => {
    Linking.openURL('https://www.shivmudrapathakpune.com/');
  };

  const handleOpenVeagleSpace = () => {
    Linking.openURL('https://veaglespace.com/');
  };

  return (
    <View className="w-full mt-6 pb-4 shrink-0">
      {/* Powered By Banner */}
      <TouchableOpacity
        onPress={handleOpenShivmudra}
        activeOpacity={0.7}
        className="w-full flex-row items-center justify-center px-4 py-3 mb-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm"
      >
        <Text className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 tracking-wide text-center">
          Powered By –{' '}
          <Text className="text-blue-600 dark:text-blue-400 underline">
            "शिवमुद्रा ढोल ताशा पथक,पुणे"
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Copyright & Dev Credit */}
      <View className="pt-3 pb-2 border-t border-slate-200/80 dark:border-slate-800 items-center justify-center">
        <TouchableOpacity
          onPress={handleOpenVeagleSpace}
          activeOpacity={0.7}
          className="px-2 py-1 items-center"
        >
          <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold text-center leading-relaxed">
            Designed & Developed by{' '}
            <Text className="text-blue-600 dark:text-blue-400 font-bold underline">
              Veagle Space Technology Pvt. Ltd.
            </Text>
          </Text>
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 text-center">
            © 2026 All Rights Reserved.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
