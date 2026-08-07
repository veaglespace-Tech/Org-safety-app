import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react-native';
import {
  useGetOrgUsersQuery,
  usePatchOrgUserMutation,
  useDeleteOrgUserMutation,
} from '@/services/api/orgApi';
import {
  ROLES,
  PERMISSION_GROUPS,
  formatRoleLabel,
} from '@/utils/roles';

export default function UserDetailScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user: authUser } = useSelector((state: any) => state.auth);

  const { data: usersData, refetch } = useGetOrgUsersQuery(100, { skip: !authUser });
  const [patchUser, { isLoading: isSaving }] = usePatchOrgUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteOrgUserMutation();

  const user = (usersData?.items || usersData?.data || []).find(
    (u) => String(u.id) === String(userId)
  );

  const [role, setRole] = useState(user?.role || ROLES.MEMBER);
  const [permissions, setPermissions] = useState(user?.permissions || []);

  useEffect(() => {
    if (user) {
      setRole(user.role || ROLES.MEMBER);
      setPermissions(user.permissions || []);
    }
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <ActivityIndicator color="#4f46e5" size="large" />
        <Text className="text-slate-500 font-bold text-sm mt-3">Loading member details...</Text>
      </View>
    );
  }

  const togglePermission = (permKey) => {
    setPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSave = async () => {
    try {
      await patchUser({
        id: user.id,
        role,
        permissions,
      }).unwrap();
      Alert.alert('Saved', 'Member roles and permissions updated.');
      await refetch();
    } catch (e) {
      Alert.alert('Save Failed', e?.data?.message || 'Could not update user.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${user.name} from the organization?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id).unwrap();
              Alert.alert('Removed', `${user.name} was removed.`);
              await refetch();
              router.back();
            } catch (err) {
              Alert.alert('Failed', err?.data?.message || 'Could not remove member.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Top Banner */}
      <View className="bg-indigo-600 px-6 pt-6 pb-8 rounded-b-3xl">
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center border-2 border-white/30 overflow-hidden">
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={{ width: 64, height: 64 }} />
            ) : (
              <User color="#fff" size={32} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white font-black text-xl" numberOfLines={1}>
              {user.name}
            </Text>
            <Text className="text-indigo-200 text-xs mt-0.5">{user.email}</Text>
            <View className="mt-1.5 bg-white/20 px-2.5 py-0.5 rounded-md self-start">
              <Text className="text-white text-[10px] font-bold uppercase">
                {formatRoleLabel(user.role)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View className="bg-white mx-4 -mt-4 rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2.5">
        <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">
          Contact Info
        </Text>
        <View className="flex-row items-center gap-2.5">
          <Mail color="#94a3b8" size={16} />
          <Text className="text-slate-700 text-sm font-medium">{user.email}</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Phone color="#94a3b8" size={16} />
          <Text className="text-slate-700 text-sm font-medium">{user.phone || 'No phone'}</Text>
        </View>
        {user.city && (
          <View className="flex-row items-center gap-2.5">
            <MapPin color="#94a3b8" size={16} />
            <Text className="text-slate-700 text-sm font-medium">{user.city}</Text>
          </View>
        )}
      </View>

      {/* Role Selection */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-slate-900 font-extrabold text-base mb-3">System Role</Text>
        <View className="flex-row gap-2">
          {[
            { label: 'Member', code: ROLES.MEMBER },
            { label: 'Team Leader', code: ROLES.TEAM_LEADER },
            { label: 'Sub Admin', code: ROLES.SUB_ADMIN },
          ].map((r) => (
            <Pressable
              key={r.code}
              onPress={() => setRole(r.code)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${
                role === r.code
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  role === r.code ? 'text-indigo-600' : 'text-slate-600'
                }`}
              >
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Permissions Editor */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-slate-900 font-extrabold text-base mb-1">Custom Permissions</Text>
        <Text className="text-slate-400 text-xs mb-4">
          Override granular access rights for this user
        </Text>

        {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
          <View key={groupKey} className="mb-4">
            <Text className="text-slate-800 font-bold text-xs mb-2 uppercase tracking-wide">
              {group.title}
            </Text>
            {group.permissions.map((perm) => {
              const isChecked = permissions.includes(perm.key);
              return (
                <Pressable
                  key={perm.key}
                  onPress={() => togglePermission(perm.key)}
                  className="flex-row items-center py-2 gap-2.5"
                >
                  <View
                    className={`w-5 h-5 rounded-lg border items-center justify-center ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 color="#fff" size={14} />}
                  </View>
                  <Text className="text-slate-700 text-xs font-semibold">{perm.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="mx-4 mt-6 mb-12 flex-row gap-3">
        <Pressable
          onPress={handleDelete}
          disabled={isDeleting}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-rose-50 border border-rose-200 active:bg-rose-100 flex-row gap-2"
        >
          <Trash2 color="#e11d48" size={18} />
          <Text className="text-rose-600 font-bold text-sm">Remove</Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-indigo-600 active:bg-indigo-700 flex-row gap-2"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Save color="#fff" size={18} />
              <Text className="text-white font-extrabold text-sm">Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
