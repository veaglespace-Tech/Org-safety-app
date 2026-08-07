import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthSession } from '@/hooks/useAuthSession';
import { HomeHeroSection } from '@/components/marketing/HomeHeroSection';

export default function IndexScreen() {
  const { hydrated } = useAuthSession();

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#070e1e',
        }}
      >
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return <HomeHeroSection />;
}

