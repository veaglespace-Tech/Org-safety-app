import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OrganisationRegister() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 pt-16 pb-8">
      <TouchableOpacity onPress={() => router.back()} className="mb-8">
        <Text className="text-blue-600 font-bold">← Back to Options</Text>
      </TouchableOpacity>
      
      <View className="mb-10">
        <Text className="text-blue-600 font-bold mb-4 uppercase tracking-wider text-xs bg-blue-50 px-3 py-1 rounded-full self-start">
          Step 1 of 2
        </Text>
        <Text className="text-3xl font-extrabold text-slate-900 mb-2">
          Register Organization
        </Text>
        <Text className="text-slate-500 font-medium">
          Company profile setup
        </Text>
      </View>
      
      <View className="bg-slate-50 border border-slate-100 p-6 rounded-3xl items-center justify-center py-20">
        <Text className="text-slate-500 text-center font-medium">
          The full organization registration form is being ported in the next phase.
        </Text>
      </View>
    </ScrollView>
  );
}
