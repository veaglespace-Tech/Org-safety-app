import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Users,
  User,
  Trash2,
  Edit2,
  Plus,
  Phone,
  Mail,
  Search,
  MapPin,
  Heart,
  Shield,
  CheckCircle2,
  X,
  AlertTriangle,
  RefreshCw,
  Crown,
  ChevronRight,
} from 'lucide-react-native';

import { useGetMembersQuery } from '@/services/api/authApi';
import {
  useDeleteOrgUserMutation,
  useCreateOrgUserMutation,
  usePatchOrgUserMutation,
} from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { CountryPhoneField } from '@/components/ui/CountryPhoneField';
import { ROLES } from '@/utils/roles';
import {
  PERSON_NAME_REGEX,
  normalizeEmailInput,
  normalizeTextInput,
  toDigitsOnly,
} from '@/utils/formValidation';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ROLE_OPTIONS = [
  { label: 'Member', value: ROLES.MEMBER },
  { label: 'Team Leader', value: ROLES.TEAM_LEADER },
  { label: 'Org Admin', value: ROLES.ORG_ADMIN },
];

export default function MembersScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);
  const { data, isLoading, refetch, isFetching } = useGetMembersQuery(undefined);

  const [deleteOrgUser, { isLoading: isDeleting }] = useDeleteOrgUserMutation();
  const [createOrgUser, { isLoading: isCreating }] = useCreateOrgUserMutation();
  const [patchOrgUser, { isLoading: isPatching }] = usePatchOrgUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | string>('ALL');

  // Modal States
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    email: '',
    phoneCountryCode: '+91',
    phone: '',
    emergency_contact: '',
    role: ROLES.MEMBER,
    city: '',
    gender: 'MALE',
    blood_group: 'O+',
    current_address: '',
    permanent_address: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const members = useMemo(() => {
    return Array.isArray(data?.members) ? data.members : [];
  }, [data]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member: any) => {
      const name = (member?.name || '').toLowerCase();
      const email = (member?.email || '').toLowerCase();
      const phone = (member?.phone || '').toLowerCase();
      const city = (member?.city || '').toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm.toLowerCase()) ||
        city.includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === 'ALL' ||
        (member?.role || '').toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  const openAddModal = () => {
    setFormData({
      id: null,
      name: '',
      email: '',
      phoneCountryCode: '+91',
      phone: '',
      emergency_contact: '',
      role: ROLES.MEMBER,
      city: authUser?.organization?.city || '',
      gender: 'MALE',
      blood_group: 'O+',
      current_address: '',
      permanent_address: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setFormData({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phoneCountryCode: '+91',
      phone: member.phone || '',
      emergency_contact: member.emergency_contact || '',
      role: member.role || ROLES.MEMBER,
      city: member.city || '',
      gender: member.gender || 'MALE',
      blood_group: member.blood_group || 'O+',
      current_address: member.current_address || '',
      permanent_address: member.permanent_address || '',
    });
    setFormErrors({});
    setSelectedMember(null);
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        name: normalizeTextInput(formData.name),
        email: normalizeEmailInput(formData.email),
        phone: toDigitsOnly(formData.phone),
        emergency_contact: toDigitsOnly(formData.emergency_contact),
        role: formData.role,
        city: normalizeTextInput(formData.city),
        gender: formData.gender,
        blood_group: formData.blood_group,
        current_address: normalizeTextInput(formData.current_address),
        permanent_address: normalizeTextInput(formData.permanent_address),
      };

      if (isEditModalOpen && formData.id) {
        await patchOrgUser({ userId: formData.id, ...payload }).unwrap();
        Alert.alert('Success', 'Member profile updated.');
        setIsEditModalOpen(false);
      } else {
        await createOrgUser(payload).unwrap();
        Alert.alert('Success', 'New member registered into organization.');
        setIsAddModalOpen(false);
      }
      refetch();
    } catch (err: any) {
      Alert.alert('Failed', err?.data?.error || err?.data?.message || 'Could not save member.');
    }
  };

  const handleDeleteMember = (member: any) => {
    if (!authUser || member?.id === authUser?.id) {
      Alert.alert('Action Denied', 'You cannot remove your own administrative account.');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member?.name} from your organization?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrgUser(member.id).unwrap();
              Alert.alert('Success', 'Member removed.');
              setSelectedMember(null);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.data?.error || 'Failed to remove member.');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (emailAddress: string) => {
    if (emailAddress) Linking.openURL(`mailto:${emailAddress}`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Search and Filter Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Members</Text>
            <Text className="text-slate-400 font-medium text-xs">
              {filteredMembers.length} of {members.length} members
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => refetch()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openAddModal}
              className="flex-row items-center gap-1.5 bg-blue-600 px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 active:bg-blue-700"
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search by name, email, phone, city..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={<Search size={16} color="#94a3b8" />}
          className="mb-2"
        />

        {/* Role Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
          <View className="flex-row gap-2">
            {['ALL', ROLES.ORG_ADMIN, ROLES.TEAM_LEADER, ROLES.MEMBER].map((role) => {
              const isSelected = roleFilter === role;
              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-extrabold ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Members List */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading || isFetching ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-slate-400 font-semibold text-xs mt-3">Loading directory...</Text>
          </View>
        ) : filteredMembers.length === 0 ? (
          <View className="py-16 items-center">
            <Users size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">No members found</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Try adjusting your search query or role filter.
            </Text>
          </View>
        ) : (
          filteredMembers.map((member: any) => (
            <SurfaceCard
              key={member?.id}
              className="mb-3 p-4 flex-row items-center justify-between"
            >
              <TouchableOpacity
                onPress={() => setSelectedMember(member)}
                className="flex-1 flex-row items-center pr-2"
              >
                <View className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center mr-3 overflow-hidden">
                  {member?.profile_photo ? (
                    <Image
                      source={{ uri: member.profile_photo }}
                      style={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <User color="#4f46e5" size={22} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="font-black text-slate-900 text-sm">
                      {member?.name || 'Unknown'}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-xs font-medium">
                    {member?.phone || member?.email || 'No contact'}
                  </Text>
                  {member?.city ? (
                    <View className="flex-row items-center gap-1 mt-1">
                      <MapPin size={10} color="#94a3b8" />
                      <Text className="text-[10px] font-bold text-slate-400">{member.city}</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>

              <View className="items-end gap-2">
                <BadgePill
                  label={member?.role || 'MEMBER'}
                  variant={member?.role === 'admin' ? 'admin' : 'member'}
                  size="sm"
                />
                <TouchableOpacity
                  onPress={() => setSelectedMember(member)}
                  className="flex-row items-center gap-0.5 px-2 py-1 bg-slate-100 rounded-lg active:bg-slate-200"
                >
                  <Text className="text-[10px] font-bold text-slate-600">Details</Text>
                  <ChevronRight size={10} color="#64748b" />
                </TouchableOpacity>
              </View>
            </SurfaceCard>
          ))
        )}
      </ScrollView>

      {/* Member Details Modal */}
      {selectedMember && (
        <ActionModal
          visible={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
          title={selectedMember?.name || 'Member Details'}
          subtitle={selectedMember?.email || 'Organization Member'}
        >
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-100 items-center justify-center overflow-hidden mb-2">
              {selectedMember?.profile_photo ? (
                <Image
                  source={{ uri: selectedMember.profile_photo }}
                  style={{ width: 80, height: 80 }}
                />
              ) : (
                <User color="#4f46e5" size={36} />
              )}
            </View>
            <Text className="text-xl font-black text-slate-900">{selectedMember?.name}</Text>
            <BadgePill
              label={selectedMember?.role || 'MEMBER'}
              variant={selectedMember?.role === 'admin' ? 'admin' : 'member'}
              className="mt-1"
            />
          </View>

          <SurfaceCard variant="flat" className="p-4 mb-4">
            <View className="space-y-2.5">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Email:</Text>
                <Text className="text-xs font-bold text-slate-900">{selectedMember?.email || '-'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Phone:</Text>
                <Text className="text-xs font-bold text-slate-900">{selectedMember?.phone || '-'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Emergency Contact:</Text>
                <Text className="text-xs font-bold text-rose-600">
                  {selectedMember?.emergency_contact || '-'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Blood Group:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedMember?.blood_group || '-'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">City / Address:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedMember?.current_address || selectedMember?.city || '-'}
                </Text>
              </View>
            </View>
          </SurfaceCard>

          {/* Action Buttons */}
          <View className="space-y-2">
            <View className="flex-row gap-2">
              {selectedMember?.phone && (
                <TouchableOpacity
                  onPress={() => handleCall(selectedMember.phone)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 bg-emerald-600 py-3 rounded-xl shadow-sm active:bg-emerald-700"
                >
                  <Phone size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs">Call</Text>
                </TouchableOpacity>
              )}
              {selectedMember?.email && (
                <TouchableOpacity
                  onPress={() => handleEmail(selectedMember.email)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 bg-blue-600 py-3 rounded-xl shadow-sm active:bg-blue-700"
                >
                  <Mail size={14} color="#fff" />
                  <Text className="text-white font-bold text-xs">Email</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => openEditModal(selectedMember)}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-slate-900 py-3 rounded-xl active:bg-slate-800"
              >
                <Edit2 size={14} color="#fff" />
                <Text className="text-white font-bold text-xs">Edit Role & Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteMember(selectedMember)}
                className="p-3 bg-red-50 border border-red-200 rounded-xl active:bg-red-100"
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        </ActionModal>
      )}

      {/* Add / Edit Member Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <ActionModal
          visible={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? 'Edit Member Profile' : 'Add Organization Member'}
          subtitle="Manage membership details, role, and safety contacts"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            <TextInput
              label="Full Name"
              required
              placeholder="e.g. Anand Deshmukh"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              error={formErrors.name}
              leftIcon={<User size={16} color="#64748b" />}
            />

            <TextInput
              label="Email Address"
              required
              placeholder="anand@example.com"
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              error={formErrors.email}
              leftIcon={<Mail size={16} color="#64748b" />}
            />

            <CountryPhoneField
              label="Phone Number"
              required
              countryCode={formData.phoneCountryCode}
              phone={formData.phone}
              onCountryCodeChange={(code) =>
                setFormData((prev) => ({ ...prev, phoneCountryCode: code }))
              }
              onPhoneChange={(p) => setFormData((prev) => ({ ...prev, phone: p }))}
              phoneError={formErrors.phone}
            />

            <TextInput
              label="Emergency Contact Number"
              placeholder="Family / Guardian contact"
              value={formData.emergency_contact}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, emergency_contact: text }))
              }
              keyboardType="phone-pad"
              leftIcon={<Heart size={16} color="#ef4444" />}
            />

            {/* Role Selection */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">
                Assign Role <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = formData.role === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setFormData((prev) => ({ ...prev, role: opt.value }))}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Blood Group */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Blood Group</Text>
              <View className="flex-row flex-wrap gap-2">
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = formData.blood_group === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      onPress={() => setFormData((prev) => ({ ...prev, blood_group: bg }))}
                      className={`px-3 py-1.5 rounded-lg border ${
                        isSelected
                          ? 'bg-red-600 border-red-600 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TextInput
              label="City"
              placeholder="Pune"
              value={formData.city}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
              leftIcon={<MapPin size={16} color="#64748b" />}
            />

            <Button
              onPress={handleSaveMember}
              isLoading={isCreating || isPatching}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-md shadow-blue-500/20 mt-2 mb-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-sm">
                  {isEditModalOpen ? 'Save Changes' : 'Create Member'}
                </Text>
              </View>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
