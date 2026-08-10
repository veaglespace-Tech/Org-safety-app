import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAppTheme } from '@/context/ThemeContext';

export default function RegisterIndex() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useAppTheme();

  // If there's an org query parameter, convert it to the REF format and redirect
  if (params?.org) {
    const formattedRef = `REF-${String(params.org).padStart(8, '0')}`;
    router.replace({ pathname: '/(auth)/register/user', params: { ref: formattedRef } });
    return null;
  }

  if (params?.ref) {
    router.replace({ pathname: '/(auth)/register/user', params: { ref: params.ref as string } });
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pt-8 pb-8"
        showsVerticalScrollIndicator={false}
      >
      {/* Top Header Actions */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.push('/' as any)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} color={isDark ? '#cbd5e1' : '#475569'} />
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      <View className="mb-10 items-center">
        <Text className="text-blue-600 dark:text-blue-400 font-bold mb-3 uppercase tracking-wider text-xs bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-3 py-1 rounded-full">
          Get Started
        </Text>
        <Text className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 text-center leading-tight">
          ढोल - ताशा <Text className="text-blue-600 dark:text-sky-400">महासंघ</Text>
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium text-sm max-w-sm">
          Pick the setup that matches you, whether you are creating an organization or joining an existing team.
        </Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register/organisation')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm active:bg-slate-100 dark:active:bg-slate-800/80 mb-4"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="h-14 w-14 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/50 rounded-2xl items-center justify-center">
              <Text className="text-blue-600 font-bold text-2xl">🏢</Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                Owner / Admin
              </Text>
            </View>
          </View>
          <Text className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1.5">Create Organization</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm leading-relaxed mb-4">
            Set up your organization, invite your team, and start managing safety & attendance from one place.
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase">
            Continue →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register/user')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm active:bg-slate-100 dark:active:bg-slate-800/80"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="h-14 w-14 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/50 rounded-2xl items-center justify-center">
              <Text className="text-blue-600 font-bold text-2xl">👤</Text>
            </View>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                Staff / Team
              </Text>
            </View>
          </View>
          <Text className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1.5">Join as Member</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm leading-relaxed mb-4">
            Join an existing organization as a member, player, or team leader with a referral code.
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs tracking-widest uppercase">
            Continue →
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-10 items-center flex-row justify-center">
        <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
            Sign in here
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
