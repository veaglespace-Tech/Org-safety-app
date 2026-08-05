import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RegisterIndex() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // If there's an org query parameter, convert it to the REF format and redirect
  // React Native Expo Router allows navigating with params
  if (params?.org) {
    const formattedRef = `REF-${String(params.org).padStart(8, '0')}`;
    router.replace({ pathname: '/(auth)/register/user', params: { ref: formattedRef } });
    return null; // Return null while redirecting
  }

  if (params?.ref) {
    router.replace({ pathname: '/(auth)/register/user', params: { ref: params.ref as string } });
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 pt-16 pb-8">
      <View className="mb-14 items-center mt-10">
        <Text className="text-blue-600 font-bold mb-4 uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full">
          Get Started
        </Text>
        <Text className="text-4xl font-black text-slate-900 mb-4 text-center leading-tight">
          ढोल - ताशा महासंघ
        </Text>
        <Text className="text-slate-500 text-center font-medium">
          Pick the setup that matches you, whether you are creating an organization or joining an existing team.
        </Text>
      </View>

      <View className="space-y-6">
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register/organisation')}
          className="bg-slate-50 border border-slate-100 p-6 rounded-3xl"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="h-16 w-16 bg-blue-100 rounded-2xl items-center justify-center">
              <Text className="text-blue-600 font-bold text-xl">🏢</Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                Owner / Admin
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-black text-slate-900 mb-2">Create Organization</Text>
          <Text className="text-slate-500 font-medium leading-relaxed mb-6">
            Set up your organization, invite your team, and start managing attendance from one place.
          </Text>
          <Text className="text-blue-600 font-bold text-xs tracking-widest uppercase">
            Continue →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register/user')}
          className="bg-slate-50 border border-slate-100 p-6 rounded-3xl mt-4"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="h-16 w-16 bg-blue-100 rounded-2xl items-center justify-center">
              <Text className="text-blue-600 font-bold text-xl">👤</Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                Staff / Team
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-black text-slate-900 mb-2">Join as Member</Text>
          <Text className="text-slate-500 font-medium leading-relaxed mb-6">
            Join an existing organization as an employee, team leader, or sub-admin and start checking in.
          </Text>
          <Text className="text-blue-600 font-bold text-xs tracking-widest uppercase">
            Continue →
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-14 items-center flex-row justify-center">
        <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text className="text-blue-600 font-bold text-[11px] uppercase tracking-widest">
            Sign in here
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
