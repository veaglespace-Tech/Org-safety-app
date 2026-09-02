import React from 'react';
import { View, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';

export const LiveLocationMap = () => {
  return (
    <View className="flex-1 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 items-center justify-center p-6">
      <MapPin size={48} color="#94a3b8" className="mb-4" />
      <Text className="text-slate-500 dark:text-slate-400 font-bold text-center text-sm">
        Live Map Preview is optimized for Android & iOS.
      </Text>
      <Text className="text-slate-400 dark:text-slate-500 font-medium text-center text-xs mt-2">
        To view live tracking on the web, please use the dedicated Web Admin Dashboard.
      </Text>
    </View>
  );
};
