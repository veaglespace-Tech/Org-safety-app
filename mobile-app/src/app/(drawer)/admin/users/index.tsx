import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  Search,
  Plus,
  User,
  Users,
  Shield,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import {
  useGetOrgUsersQuery,
  useCreateOrgUserMutation,
} from '@/services/api/orgApi';
import { useGetRolesQuery } from '@/services/api/roleApi';
import {
  ROLES,
  PERMISSION_GROUPS,
  getDefaultPermissionsForRole,
  formatRoleLabel,
} from '@/utils/roles';

export default function UsersDirectoryScreen() {
  const router = useRouter();
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState(ROLES.MEMBER);
  const [formPermissions, setFormPermissions] = useState(
    getDefaultPermissionsForRole(ROLES.MEMBER)
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useGetOrgUsersQuery(100, { skip: !authUser });

  const { data: rolesData } = useGetRolesQuery(undefined);
  const [createUser] = useCreateOrgUserMutation();

  const users = useMemo(() => {
    const list = Array.isArray(usersData?.items)
      ? usersData.items
      : Array.isArray(usersData?.data)
      ? usersData.data
      : [];

    return list.filter((u) => {
      const matchQuery =
        !searchTerm.trim() ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && u.phone.includes(searchTerm));

      const matchStatus =
        statusFilter === 'ALL' ||
        String(u.status || '').toUpperCase() === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [usersData, searchTerm, statusFilter]);

  const handleRoleSelect = (roleCode) => {
    setFormRole(roleCode);
    setFormPermissions(getDefaultPermissionsForRole(roleCode));
  };

  const togglePermission = (permCode) => {
    setFormPermissions((prev) =>
      prev.includes(permCode)
        ? prev.filter((p) => p !== permCode)
        : [...prev, permCode]
    );
  };

  const handleCreateUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      Alert.alert('Required Fields', 'Please fill in name, email, and password.');
      return;
    }

    try {
      setSubmitting(true);
      await createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        mobileCountryCode: '+91',
        mobile: formMobile.trim(),
        role: formRole,
        password: formPassword,
        permissions: formPermissions,
        status: 'APPROVED',
      }).unwrap();

      Alert.alert('User Created', `User ${formName} added successfully.`);
      setCreateModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormMobile('');
      setFormPassword('');
      setFormRole(ROLES.MEMBER);
      await refetch();
    } catch (err) {
      Alert.alert('Creation Failed', err?.data?.message || 'Could not create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900">Members Directory</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {users.length} registered members
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setCreateModalOpen(true)}
              className="p-2.5 bg-indigo-600 rounded-xl active:bg-indigo-700 flex-row items-center gap-1"
            >
              <Plus color="#ffffff" size={16} />
              <Text className="text-white font-bold text-xs">Add User</Text>
            </Pressable>
            <Pressable
              onPress={() => refetch()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-slate-100 rounded-2xl px-3.5 py-2 mt-3">
          <Search color="#94a3b8" size={18} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search by name, email, or mobile..."
            className="flex-1 ml-2 text-sm text-slate-900 font-medium"
          />
        </View>

        {/* Status Filters */}
        <View className="flex-row gap-2 mt-3">
          {['ALL', 'APPROVED', 'PENDING'].map((status) => (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl border ${
                statusFilter === status
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  statusFilter === status ? 'text-indigo-600' : 'text-slate-600'
                }`}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Users List */}
      <ScrollView className="flex-1 px-4 pt-3">
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading users...</Text>
          </View>
        ) : users.length === 0 ? (
          <View className="py-16 items-center">
            <Users color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No users found</Text>
          </View>
        ) : (
          users.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(drawer)/admin/users/${item.id}`)}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-xs flex-row items-center justify-between active:bg-slate-50"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center overflow-hidden">
                  {item.profilePhoto ? (
                    <Image source={{ uri: item.profilePhoto }} style={{ width: 48, height: 48 }} />
                  ) : (
                    <User color="#4f46e5" size={24} />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                    {item.email}
                  </Text>
                  {item.phone && (
                    <Text className="text-slate-500 text-[11px] mt-0.5">{item.phone}</Text>
                  )}
                </View>
              </View>

              <View className="items-end ml-2">
                <View
                  className={`px-2 py-0.5 rounded-lg mb-1 ${
                    item.role === 'admin' || item.role === 'ORG_ADMIN'
                      ? 'bg-purple-100'
                      : item.role === 'TEAM_LEADER'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-extrabold uppercase ${
                      item.role === 'admin' || item.role === 'ORG_ADMIN'
                        ? 'text-purple-700'
                        : item.role === 'TEAM_LEADER'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {formatRoleLabel(item.role)}
                  </Text>
                </View>
                <ChevronRight color="#94a3b8" size={16} />
              </View>
            </Pressable>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={createModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Add New User</Text>
              <Pressable onPress={() => setCreateModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Full Name</Text>
              <TextInput
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g. Ramesh Patil"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Email Address</Text>
              <TextInput
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="ramesh@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Mobile Number</Text>
              <TextInput
                value={formMobile}
                onChangeText={setFormMobile}
                placeholder="9876543210"
                keyboardType="phone-pad"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Temporary Password</Text>
              <TextInput
                value={formPassword}
                onChangeText={setFormPassword}
                placeholder="••••••••"
                secureTextEntry
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-4"
              />

              {/* Role Selection */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">Assign Role</Text>
              <View className="flex-row gap-2 mb-4">
                {[
                  { label: 'Member', code: ROLES.MEMBER },
                  { label: 'Team Leader', code: ROLES.TEAM_LEADER },
                  { label: 'Sub Admin', code: ROLES.SUB_ADMIN },
                ].map((r) => (
                  <Pressable
                    key={r.code}
                    onPress={() => handleRoleSelect(r.code)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      formRole === r.code
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        formRole === r.code ? 'text-indigo-600' : 'text-slate-600'
                      }`}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Permissions Checklist */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">
                Granular Permissions ({formPermissions.length} selected)
              </Text>
              <View className="bg-slate-50 p-4 rounded-2xl mb-6">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                  <View key={groupKey} className="mb-3">
                    <Text className="text-slate-900 font-bold text-xs mb-1.5">{group.title}</Text>
                    {group.permissions.map((perm) => {
                      const isChecked = formPermissions.includes(perm.key);
                      return (
                        <Pressable
                          key={perm.key}
                          onPress={() => togglePermission(perm.key)}
                          className="flex-row items-center py-1.5 gap-2"
                        >
                          <View
                            className={`w-4 h-4 rounded border items-center justify-center ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <CheckCircle2 color="#fff" size={12} />}
                          </View>
                          <Text className="text-slate-700 text-xs font-medium">{perm.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleCreateUser}
                disabled={submitting}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Create User</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
