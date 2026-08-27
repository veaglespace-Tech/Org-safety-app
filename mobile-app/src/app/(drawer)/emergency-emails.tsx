import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  MailWarning,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import {
  useGetEmergencyEmailsQuery,
  useAddEmergencyEmailMutation,
  useDeleteEmergencyEmailMutation,
} from '@/services/api/orgApi';
import { useAppTheme } from '@/context/ThemeContext';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { AppFooter } from '@/components/layout/Footer';

export default function EmergencyEmailsScreen() {
  const { isDark } = useAppTheme();
  
  const { data, isLoading } = useGetEmergencyEmailsQuery(undefined);
  const [addEmail, { isLoading: isAdding }] = useAddEmergencyEmailMutation();
  const [deleteEmail, { isLoading: isDeleting }] = useDeleteEmergencyEmailMutation();
  
  const [newEmail, setNewEmail] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const emails = data?.emails || [];

  const handleAddEmail = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    try {
      await addEmail({ email: newEmail }).unwrap();
      setNewEmail('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error?.data?.error || error?.message || 'Failed to add email');
    }
  };

  const handleDelete = (id: number) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this emergency email?');
      if (confirmed) {
        proceedDelete(id);
      }
    } else {
      Alert.alert(
        'Remove Email',
        'Are you sure you want to delete this emergency email?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => proceedDelete(id),
          },
        ]
      );
    }
  };

  const proceedDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteEmail(id).unwrap();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error?.data?.error || error?.message || 'Failed to delete email');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 10 }}
      keyboardShouldPersistTaps="handled"
    >
      <SurfaceCard className="p-5 mb-6">
        <View className="flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 items-center justify-center shrink-0">
              <MailWarning color="#f43f5e" size={20} />
            </View>
            <View className="flex-1">
              <Text 
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight"
                numberOfLines={2}
              >
                Emergency Emails
              </Text>
            </View>
          </View>
          <View className="bg-rose-50 dark:bg-rose-500/10 px-2 sm:px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-500/20 mt-1 sm:mt-0 shrink-0">
            <Text className="text-rose-600 dark:text-rose-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
              Max 10 emails
            </Text>
          </View>
        </View>

        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Add email addresses that should automatically receive your SOS alert with your live location.
        </Text>

        <View className="flex-row gap-3 mb-6">
          <TextInput
            placeholder="Enter email address..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isAdding && emails.length < 10}
            className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium"
          />
          <TouchableOpacity
            onPress={handleAddEmail}
            disabled={isAdding || !newEmail || emails.length >= 10}
            className={`px-5 rounded-xl justify-center items-center flex-row gap-2 ${
              isAdding || !newEmail || emails.length >= 10
                ? 'bg-blue-400 dark:bg-blue-800'
                : 'bg-blue-600 active:bg-blue-700'
            }`}
          >
            {isAdding ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Plus color="#ffffff" size={20} />
            )}
            <Text className="text-white font-bold hidden sm:flex">Add</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#3b82f6" size="large" />
          </View>
        ) : emails.length === 0 ? (
          <View className="py-10 items-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle color={isDark ? '#475569' : '#94a3b8'} size={48} className="mb-3" />
            <Text className="text-lg font-bold text-slate-900 dark:text-white">No Emergency Emails</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
              You haven't added any emergency emails yet.
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {emails.map((email: any) => (
              <View
                key={email.id}
                className="flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 items-center justify-center">
                    <MailWarning color="#f43f5e" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 dark:text-white text-base" numberOfLines={1}>
                      {email.email}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      Added on {new Date(email.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDelete(email.id)}
                  disabled={deletingId === email.id || isDeleting}
                  className="p-2 ml-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 active:bg-rose-100 dark:active:bg-rose-500/20"
                >
                  {deletingId === email.id ? (
                    <ActivityIndicator color="#f43f5e" size="small" />
                  ) : (
                    <Trash2 color="#f43f5e" size={18} />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </SurfaceCard>
      
      <View className="px-4 mt-auto">
        <AppFooter />
      </View>
    </ScrollView>
  );
}
