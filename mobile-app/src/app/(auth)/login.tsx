import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { AppFooter } from '../../components/layout/Footer';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isDark } = useAppTheme();
  const { token, user, hydrated, redirectPath } = useAuthSession();
  const [userSignIn, { isLoading }] = useUserSignInMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, setValue } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const getDashboardRoute = (role?: string | null, customPath?: string | null) => {
    const normalized = (role || '').toLowerCase();
    if (normalized === 'admin' || normalized === 'org_admin') {
      return '/(drawer)/admin/dashboard';
    }
    if (normalized === 'member') {
      return '/(drawer)/member/dashboard';
    }
    const resolved = resolveDashboardPath(role, customPath) || '/(drawer)/member/dashboard';
    if (resolved.startsWith('/member/dashboard')) return '/(drawer)/member/dashboard';
    if (resolved.startsWith('/admin/dashboard') || resolved.startsWith('/org/dashboard')) return '/(drawer)/admin/dashboard';
    return '/(drawer)/member/dashboard';
  };

  useEffect(() => {
    if (!hydrated || !token || !user) return;
    const target = getDashboardRoute(user?.role || user?.currentRole, user?.dashboardPath || redirectPath);
    // Add a slight delay to ensure React commits state before unmounting current navigator
    setTimeout(() => {
      router.replace(target as any);
    }, 100);
  }, [hydrated, token, user, redirectPath, router]);

  const onSubmit = async (values: LoginFormData) => {
    setErrorMessage(null);
    try {
      const payload = {
        ...values,
        email: normalizeEmailInput(values.email),
      };

      const result = await userSignIn(payload).unwrap();
      dispatch(setSession(result));
      // Routing is handled by the useEffect watching auth state
    } catch (err: any) {
      const errorMsg =
        err?.data?.error ||
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Invalid credentials or unable to connect to server.';
      setErrorMessage(errorMsg);
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', errorMsg);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 pt-10 pb-2"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      {/* Top Header Controls */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => router.push('/' as any)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} color={isDark ? '#cbd5e1' : '#475569'} />
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      <View className="mb-8 items-center">
        <Text className="text-blue-600 dark:text-blue-400 font-bold mb-3 uppercase tracking-wider text-xs bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-3 py-1 rounded-full">
          Team Login
        </Text>
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
          Welcome to ढोल - ताशा महासंघ
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium text-sm">
          Sign in to access your dashboard, emergency SOS, and safety tools.
        </Text>
      </View>

      {errorMessage ? (
        <View className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <Text className="text-red-700 dark:text-red-400 font-semibold text-center text-sm">
            {errorMessage}
          </Text>
        </View>
      ) : null}

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
              onChangeText={(text) => {
                setErrorMessage(null);
                onChange(text);
              }}
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
              onChangeText={(text) => {
                setErrorMessage(null);
                onChange(text);
              }}
              value={value}
              error={error?.message}
            />
          )}
        />

        <View className="flex-row items-center justify-between mb-4 mt-2">
          <TouchableOpacity onPress={() => setValue('rememberMe', true)}>
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium">Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/forgot-password' as any)}>
            <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          isLoading={isLoading}
          className="mt-4 py-4 rounded-full bg-blue-600 shadow-sm"
        />

        <View className="mt-8 items-center flex-row justify-center">
          <Text className="text-slate-500 dark:text-slate-400 font-medium">New here? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text className="text-blue-600 dark:text-blue-400 font-bold underline">Create your organization</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <AppFooter />
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
