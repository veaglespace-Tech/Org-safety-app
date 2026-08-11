import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';

export function AppFooter() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleOpenShivmudra = () => {
    Linking.openURL('https://www.shivmudrapathakpune.com/');
  };

  const handleOpenVeagleSpace = () => {
    Linking.openURL('https://veaglespace.com/');
  };

  return (
    <View 
      className="w-full mt-2 shrink-0" 
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {/* Powered By Banner */}
      <TouchableOpacity
        onPress={handleOpenShivmudra}
        activeOpacity={0.7}
        className="w-full flex-row items-center justify-center px-4 py-2 mb-2 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-sm"
      >
        <Text className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide text-center">
          Powered By –{' '}
          <Text className="text-[#38BDF8] underline font-bold">
            "शिवमुद्रा ढोल ताशा पथक,पुणे"
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Copyright & Dev Credit */}
      <View className="pt-1.5 items-center justify-center border-t border-slate-200/50 dark:border-slate-800/80">
        <TouchableOpacity
          onPress={handleOpenVeagleSpace}
          activeOpacity={0.7}
          className="px-2 items-center"
        >
          <Text className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed">
            Designed & Developed by{' '}
            <Text className="text-blue-500 dark:text-[#38BDF8] underline">
              Veagle Space Technology Pvt. Ltd.
            </Text>
          </Text>
          <Text className="text-[10px] sm:text-[11px] text-slate-400/80 dark:text-slate-500 font-medium mt-0.5 text-center">
            © 2026 All Rights Reserved.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
