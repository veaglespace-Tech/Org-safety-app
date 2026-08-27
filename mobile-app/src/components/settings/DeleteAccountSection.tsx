import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { authApi } from '@/services/api/authApi';
import { orgApi } from '@/services/api/orgApi';
import { logout } from '@/store/slices/authSlice';
import { useAppTheme } from '@/context/ThemeContext';

interface DeleteAccountSectionProps {
  type?: 'user' | 'org';
}

export default function DeleteAccountSection({ type = 'user' }: DeleteAccountSectionProps) {
  const [deleteMe, { isLoading: isDeletingUser }] = authApi.useDeleteMeMutation();
  const [deleteOrg, { isLoading: isDeletingOrg }] = orgApi.useDeleteOrganizationMutation();
  const dispatch = useDispatch();
  const { isDark } = useAppTheme();
  
  const [showConfirm, setShowConfirm] = useState(false);
  
  const isDeleting = isDeletingUser || isDeletingOrg;
  
  const handleDelete = async () => {
    try {
      if (type === 'org') {
        await deleteOrg().unwrap();
        Alert.alert("Success", "Organization deleted successfully");
      } else {
        await deleteMe().unwrap();
        Alert.alert("Success", "Account deleted successfully");
      }
      
      dispatch(logout());
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert("Error", error?.data?.error || error?.message || "Failed to delete account");
      setShowConfirm(false);
    }
  };
  
  return (
    <View className="mt-8 border-t border-rose-200 dark:border-rose-900/30 pt-6">
      <View className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/50">
        <View className="flex-col gap-4">
          <View>
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={20} color={isDark ? '#fb7185' : '#be123c'} />
              <Text className="text-lg font-bold text-rose-700 dark:text-rose-400">
                Danger Zone
              </Text>
            </View>
            <Text className="text-rose-600/80 dark:text-rose-300/70 text-sm mt-2 leading-5">
              {type === 'org' 
                ? "Permanently delete this organization and all associated data, including users." 
                : "Permanently delete your account and all associated data."}
            </Text>
          </View>
          
          {!showConfirm ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowConfirm(true)}
              className="px-6 py-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl border border-rose-200 dark:border-rose-800 flex-row items-center justify-center gap-2 mt-2"
            >
              <Trash2 size={16} color={isDark ? '#fda4af' : '#be123c'} />
              <Text className="text-rose-700 dark:text-rose-300 font-bold text-sm">
                {type === 'org' ? "Delete Organization" : "Delete Account"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center gap-3 mt-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center"
              >
                <Text className="text-slate-600 dark:text-slate-400 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-rose-600 rounded-xl items-center justify-center flex-row gap-2 opacity-100 disabled:opacity-70"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Trash2 size={16} color="#ffffff" />
                )}
                <Text className="text-white font-bold text-sm">Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
