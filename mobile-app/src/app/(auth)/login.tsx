import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useUserSignInMutation } from '../../services/api/authApi';
import { setSession } from '../../store/slices/authSlice';
import { resolveDashboardPath } from '../../utils/roles';
import { normalizeEmailInput } from '../../utils/formValidation';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user, hydrated, redirectPath } = useAuthSession();
  const [userSignIn, { isLoading }] = useUserSignInMutation();

  const { control, handleSubmit, setValue } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // In React Native, we typically use AsyncStorage instead of localStorage.
    // For now, we'll skip the 'rememberMe' auto-fill until AsyncStorage is fully ported.
  }, []);

  useEffect(() => {
    if (!hydrated || !token) return;
    const nextPath = resolveDashboardPath(user?.currentRole, user?.dashboardPath || redirectPath) || '/(drawer)/member/dashboard';
    
    // Convert web path to Expo Router path if necessary
    let expoPath = nextPath;
    if (expoPath.startsWith('/member/dashboard')) expoPath = '/(drawer)/member/dashboard';
    
    router.replace(expoPath as any);
  }, [hydrated, token, user, redirectPath, router]);

  const onSubmit = async (values: LoginFormData) => {
    try {
      const payload = {
        ...values,
        email: normalizeEmailInput(values.email),
      };

      const result = await userSignIn(payload).unwrap();
      dispatch(setSession(result));

      const nextPath = resolveDashboardPath(
        result.user?.role || result.user?.currentRole,
        result.redirectPath || result.user?.dashboardPath
      ) || '/(drawer)/member/dashboard';
      
      let expoPath = nextPath;
      if (expoPath.startsWith('/member/dashboard')) expoPath = '/(drawer)/member/dashboard';

      router.replace(expoPath as any);
    } catch (err: any) {
      const errorMsg = err?.data?.message || 'Invalid credentials or unable to sign in.';
      Alert.alert('Login Failed', errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 pt-16 pb-8">
      <View className="mb-10 items-center">
        <Text className="text-blue-600 font-bold mb-4 uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full">
          Team Login
        </Text>
        <Text className="text-3xl font-extrabold text-slate-900 mb-2 text-center">
          Welcome to ढोल - ताशा महासंघ
        </Text>
        <Text className="text-slate-500 text-center font-medium">
          Sign in to manage attendance, check-ins, and your daily work in one place.
        </Text>
      </View>

      <View className="space-y-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextInput
              label="Email Address"
              placeholder="name@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <TextInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
            />
          )}
        />

        <View className="flex-row items-center justify-between mb-4 mt-2">
          <TouchableOpacity onPress={() => setValue('rememberMe', true)}>
            <Text className="text-slate-700 text-sm font-medium">Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/forgot-password' as any)}>
            <Text className="text-blue-600 font-bold text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="mt-4 py-4 rounded-full bg-blue-600 shadow-sm"
        />

        <View className="mt-8 items-center flex-row justify-center">
          <Text className="text-slate-500 font-medium">New here? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-blue-600 font-bold underline">Create your organization</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
