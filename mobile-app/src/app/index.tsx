import React, { useRef } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { User, Lock } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Basic 3D animation component for the background or header
function SpinningCube() {
  const meshRef = useRef(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4f46e5" wireframe />
    </mesh>
  );
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

import { useUserSignInMutation } from '@/services/api/authApi';
import { useDispatch } from 'react-redux';
import { setSession } from '@/store/slices/authSlice';
import { Alert } from 'react-native';

import { router } from 'expo-router';

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const [signIn, { isLoading }] = useUserSignInMutation();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      console.log("Submitting login...", data);
      
      const result = await signIn(data).unwrap();
      console.log("SignIn resolved!", result);
      
      dispatch(setSession({ user: result.user }));
      
      // Redirect to the role-specific dashboard
      const role = result.user?.role;
      if (role === 'admin') {
        router.replace('/(drawer)/admin/dashboard');
      } else {
        router.replace('/(drawer)/member/dashboard');
      }
      
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed", err?.message || "Something went wrong");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 3D Animation Header Section */}
      <View className="h-48 w-full bg-slate-50 items-center justify-center overflow-hidden">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <SpinningCube />
        </Canvas>
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
        <Text className="text-gray-500 mb-8">Sign in to your organization account</Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="relative">
              <TextInput
                label="Email"
                placeholder="you@company.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                className="pl-10"
              />
              <View className="absolute left-3 top-10">
                <User size={20} color="#9ca3af" />
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="relative mt-2">
              <TextInput
                label="Password"
                placeholder="••••••••"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                secureTextEntry
                className="pl-10"
              />
              <View className="absolute left-3 top-10">
                <Lock size={20} color="#9ca3af" />
              </View>
            </View>
          )}
        />

        <Button 
          variant="primary" 
          className="mt-6"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        >
          Sign In
        </Button>
        
        <Button 
          variant="ghost" 
          className="mt-4"
        >
          Forgot Password?
        </Button>
      </View>
    </SafeAreaView>
  );
}
