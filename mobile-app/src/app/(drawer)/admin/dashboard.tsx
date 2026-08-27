import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import {
  Users,
  Copy,
  CheckCircle2,
  Building2,
  ChevronRight,
  User,
  Shield,
  Settings,
  Phone,
  Mail,
  Share2,
  Edit3,
  Trash2,
  Save,
  X,
  MapPin,
  Heart,
} from 'lucide-react-native';

import { useGetMembersQuery } from '@/services/api/authApi';
import { usePatchOrgUserMutation, useDeleteOrgUserMutation } from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { useAppTheme } from '@/context/ThemeContext';
import { AppFooter } from '@/components/layout/Footer';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();

  const { data: membersData, isLoading: isMembersLoading, refetch: refetchMembers } =
    useGetMembersQuery(undefined);

  const [patchOrgUser, { isLoading: isUpdatingUser }] = usePatchOrgUserMutation();
  const [deleteOrgUser, { isLoading: isDeletingUser }] = useDeleteOrgUserMutation();

  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'member',
    phone: '',
    emergency_contact: '',
    city: '',
    gender: '',
    blood_group: '',
    current_address: '',
  });

  const members = membersData?.members || [];

  const orgId = user?.organization_id || user?.organizationId || user?.organization?.id;
  const referralCode = orgId ? `REF-${String(orgId).padStart(8, '0')}` : '';
  const referralLink = referralCode
    ? `https://tichisuraksha.veaglespace.com/register/user?ref=${referralCode}`
    : '';

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ${user?.organization?.name || user?.organizations?.name || 'our organization'} on तिची सुरक्षा Safety Portal!\nRegister your profile here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (emailAddress: string) => {
    if (emailAddress) {
      Linking.openURL(`mailto:${emailAddress}`);
    }
  };

  const openMemberDetails = (member: any) => {
    setSelectedMember(member);
    setIsEditMode(false);
    setEditForm({
      name: member?.name || '',
      role: member?.role === 'admin' || member?.role === 'ORG_ADMIN' ? 'admin' : 'member',
      phone: member?.phone || '',
      emergency_contact: member?.emergency_contact || member?.emergencyContact || '',
      city: member?.city || '',
      gender: member?.gender || '',
      blood_group: member?.blood_group || member?.bloodGroup || '',
      current_address: member?.current_address || member?.currentAddress || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedMember?.id) return;
    if (!editForm.name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }

    try {
      await patchOrgUser({
        userId: selectedMember.id,
        name: editForm.name.trim(),
        role: editForm.role,
        phone: editForm.phone.trim(),
        emergency_contact: editForm.emergency_contact.trim(),
        city: editForm.city.trim(),
        gender: editForm.gender,
        blood_group: editForm.blood_group,
        current_address: editForm.current_address.trim(),
      }).unwrap();

      Alert.alert('Success', 'Member details updated successfully.');
      setIsEditMode(false);
      setSelectedMember({
        ...selectedMember,
        ...editForm,
      });
      refetchMembers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      Alert.alert('Error', error?.data?.error || 'Failed to update user details.');
    }
  };

  const handleDeleteMember = () => {
    if (!selectedMember?.id) return;

    if (selectedMember.id === user?.id || selectedMember.id === user?.userId) {
      Alert.alert('Action Not Allowed', 'You cannot delete your own account.');
      return;
    }

    if (selectedMember.role === 'super_admin' || selectedMember.role === 'SUPER_ADMIN') {
      Alert.alert('Action Not Allowed', 'You cannot delete a super admin.');
      return;
    }

    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${selectedMember.name || 'this member'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrgUser(selectedMember.id).unwrap();
              Alert.alert('Deleted', 'Member has been removed successfully.');
              setSelectedMember(null);
              setIsEditMode(false);
              refetchMembers();
            } catch (error: any) {
              console.error('Failed to delete member:', error);
              Alert.alert('Error', error?.data?.error || 'Failed to delete member.');
            }
          },
        },
      ]
    );
  };

  const orgName = user?.organization?.name || user?.organizations?.name || 'ढोल - ताशा महासंघ';
  const orgLogo = user?.organization?.logo || user?.organizations?.logo;

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Organization Banner */}
        <View className="px-4 pt-5">
          <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center overflow-hidden shrink-0">
                {orgLogo ? (
                  <Image
                    source={{ uri: orgLogo }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Building2 color="#3b82f6" size={30} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight" numberOfLines={1}>
                  {orgName}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1 leading-relaxed">
                  Check out your organization's updates, view your team members, and manage your attendance securely.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Stat & Referral Box */}
        <View className="px-4 mt-4">
          {/* Total Members Metric */}
          <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm dark:shadow-xl">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 items-center justify-center">
                <Users color="#3b82f6" size={20} />
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Members
                </Text>
                <Text className="text-2xl font-black text-slate-900 dark:text-white">{members.length}</Text>
              </View>
            </View>
            <BadgePill label="Active" variant="primary" size="sm" />
          </View>

          {/* Referral Card */}
          <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl">
            <Text className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              SHARE YOUR REFERRAL CODE OR LINK
            </Text>

            {/* Referral Code Badge */}
            <View className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 self-start mb-3">
              <Text className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                CODE:{' '}
                <Text className="text-blue-600 dark:text-blue-400 font-mono font-black">
                  {referralCode || 'REF-XXXXXXXX'}
                </Text>
              </Text>
            </View>

            {/* Link Input Box */}
            <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 mb-3">
              <TextInput
                editable={false}
                value={referralLink || 'https://tichisuraksha.veaglespace.com/register'}
                className="text-slate-700 dark:text-slate-300 font-mono text-xs"
                numberOfLines={1}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={handleCopyLink}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl shadow-lg shadow-blue-500/20"
              >
                {copied ? (
                  <CheckCircle2 size={16} color="#ffffff" />
                ) : (
                  <Copy size={16} color="#ffffff" />
                )}
                <Text className="text-white font-bold text-xs">
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700"
              >
                <Share2 size={16} color={isDark ? '#ffffff' : '#334155'} />
                <Text className="text-slate-800 dark:text-white font-bold text-xs">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* 4. Organization Members List */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3 ml-1">
            <Text className="text-base font-extrabold text-slate-900 dark:text-white">Organization Members</Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">{members.length} members</Text>
          </View>

          <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
            {isMembersLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color="#3b82f6" />
                <Text className="text-slate-400 font-semibold text-sm mt-2">Loading members...</Text>
              </View>
            ) : members.length === 0 ? (
              <View className="py-12 items-center px-4">
                <Users size={36} color="#94a3b8" />
                <Text className="text-slate-700 dark:text-slate-300 font-bold text-base mt-2">No members registered yet</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs text-center mt-1">
                  Share your referral link above to onboard your team.
                </Text>
              </View>
            ) : (
              members.map((member: any, idx: number) => (
                <TouchableOpacity
                  key={member?.id || idx}
                  onPress={() => openMemberDetails(member)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-3.5 ${
                    idx !== members.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                  } active:bg-slate-50 dark:active:bg-slate-800/60`}
                >
                  <View className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center mr-3 overflow-hidden">
                    {member?.profile_photo ? (
                      <Image
                        source={{ uri: member.profile_photo }}
                        style={{ width: 44, height: 44 }}
                      />
                    ) : (
                      <User color={isDark ? '#94a3b8' : '#64748b'} size={20} />
                    )}
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="font-extrabold text-slate-900 dark:text-white text-sm" numberOfLines={1}>
                      {member?.name || 'Unknown'}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium" numberOfLines={1}>
                      {member?.email || member?.phone || 'No email'}
                    </Text>
                  </View>
                  <BadgePill
                    label={member?.role?.toUpperCase() || 'MEMBER'}
                    variant={member?.role?.toLowerCase() === 'admin' ? 'admin' : 'member'}
                    size="sm"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* 5. Footer Component */}
        <View className="px-4 mt-auto">
          <AppFooter />
        </View>

        {/* Member Details & Edit Action Sheet Modal */}
        {selectedMember && (
          <ActionModal
            visible={Boolean(selectedMember)}
            onClose={() => {
              setSelectedMember(null);
              setIsEditMode(false);
            }}
            title={isEditMode ? 'Edit Member Details' : (selectedMember?.name || 'Member Details')}
            subtitle={isEditMode ? 'Update member information' : (selectedMember?.email || 'Organization Member')}
          >
            {isEditMode ? (
              /* ================= EDIT MODE ================= */
              <View className="space-y-4 pt-1">
                {/* Full Name */}
                <View>
                  <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <Text className="text-rose-500">*</Text>
                  </Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, name: val }))}
                    placeholder="Enter full name"
                    placeholderTextColor="#94a3b8"
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </View>

                {/* Role Selection */}
                <View>
                  <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Organization Role
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setEditForm((prev) => ({ ...prev, role: 'member' }))}
                      activeOpacity={0.8}
                      className={`flex-1 py-3 px-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                        editForm.role === 'member'
                          ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <User size={16} color={editForm.role === 'member' ? '#ffffff' : '#94a3b8'} />
                      <Text
                        className={`font-bold text-xs ${
                          editForm.role === 'member' ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        MEMBER
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setEditForm((prev) => ({ ...prev, role: 'admin' }))}
                      activeOpacity={0.8}
                      className={`flex-1 py-3 px-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                        editForm.role === 'admin'
                          ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Shield size={16} color={editForm.role === 'admin' ? '#ffffff' : '#94a3b8'} />
                      <Text
                        className={`font-bold text-xs ${
                          editForm.role === 'admin' ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        ADMIN
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Phone & Emergency Contact */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </Text>
                    <TextInput
                      value={editForm.phone}
                      onChangeText={(val) => setEditForm((prev) => ({ ...prev, phone: val }))}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Emergency Contact
                    </Text>
                    <TextInput
                      value={editForm.emergency_contact}
                      onChangeText={(val) => setEditForm((prev) => ({ ...prev, emergency_contact: val }))}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </View>
                </View>

                {/* City & Gender */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      City / Location
                    </Text>
                    <TextInput
                      value={editForm.city}
                      onChangeText={(val) => setEditForm((prev) => ({ ...prev, city: val }))}
                      placeholder="e.g. Pune"
                      placeholderTextColor="#94a3b8"
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender
                    </Text>
                    <View className="flex-row gap-1.5">
                      {genderOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => setEditForm((prev) => ({ ...prev, gender: opt }))}
                          className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                            editForm.gender.toLowerCase() === opt.toLowerCase()
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-black ${
                              editForm.gender.toLowerCase() === opt.toLowerCase()
                                ? 'text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Blood Group */}
                <View>
                  <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Blood Group
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {bloodGroupOptions.map((bg) => (
                      <TouchableOpacity
                        key={bg}
                        onPress={() => setEditForm((prev) => ({ ...prev, blood_group: bg }))}
                        className={`px-3.5 py-2 rounded-xl border ${
                          editForm.blood_group === bg
                            ? 'bg-rose-600 border-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            editForm.blood_group === bg
                              ? 'text-white'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {bg}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Address */}
                <View>
                  <Text className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Address
                  </Text>
                  <TextInput
                    value={editForm.current_address}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, current_address: val }))}
                    placeholder="Enter full address"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={2}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </View>

                {/* Form Action Buttons */}
                <View className="flex-row gap-3 pt-3">
                  <TouchableOpacity
                    onPress={() => setIsEditMode(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 items-center justify-center active:bg-slate-300 dark:active:bg-slate-700"
                  >
                    <Text className="text-slate-800 dark:text-white font-bold text-xs">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    disabled={isUpdatingUser}
                    activeOpacity={0.8}
                    className="flex-[1.5] flex-row items-center justify-center gap-2 bg-blue-600 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:bg-blue-700"
                  >
                    {isUpdatingUser ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Save size={16} color="#ffffff" />
                        <Text className="text-white font-bold text-xs">Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ================= VIEW MODE ================= */
              <View>
                {/* Member Card Header */}
                <View className="items-center mb-4">
                  <View className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 items-center justify-center overflow-hidden mb-3">
                    {selectedMember?.profile_photo ? (
                      <Image
                        source={{ uri: selectedMember.profile_photo }}
                        style={{ width: 80, height: 80 }}
                      />
                    ) : (
                      <User color={isDark ? '#94a3b8' : '#64748b'} size={36} />
                    )}
                  </View>
                  <Text className="text-xl font-black text-slate-900 dark:text-white text-center">
                    {selectedMember?.name}
                  </Text>
                  <BadgePill
                    label={selectedMember?.role?.toUpperCase() || 'MEMBER'}
                    variant={selectedMember?.role?.toLowerCase() === 'admin' ? 'admin' : 'member'}
                    className="mt-2"
                  />
                </View>

                {/* Member Details */}
                <SurfaceCard variant="flat" className="p-4 mb-4">
                  <View className="space-y-2.5">
                    <View className="flex-row justify-between py-1">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email:</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                        {selectedMember?.email || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mobile:</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {selectedMember?.phone || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Emergency Contact:</Text>
                      <Text className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {selectedMember?.emergency_contact || selectedMember?.emergencyContact || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Group:</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedMember?.blood_group || selectedMember?.bloodGroup || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">City / Location:</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedMember?.city || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gender:</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedMember?.gender || '-'}
                      </Text>
                    </View>
                    {selectedMember?.current_address && (
                      <View className="flex-row justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                        <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Address:</Text>
                        <Text className="text-xs font-bold text-slate-900 dark:text-white flex-1 text-right">
                          {selectedMember.current_address}
                        </Text>
                      </View>
                    )}
                  </View>
                </SurfaceCard>

                {/* Call & Email Direct Actions */}
                <View className="flex-row gap-3 mb-3">
                  {selectedMember?.phone ? (
                    <TouchableOpacity
                      onPress={() => handleCall(selectedMember.phone)}
                      activeOpacity={0.8}
                      className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-600 py-3 rounded-2xl active:bg-emerald-700 shadow-md shadow-emerald-500/20"
                    >
                      <Phone size={16} color="#fff" />
                      <Text className="text-white font-bold text-xs">Call Member</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedMember?.email ? (
                    <TouchableOpacity
                      onPress={() => handleEmail(selectedMember.email)}
                      activeOpacity={0.8}
                      className="flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3 rounded-2xl active:bg-blue-700 shadow-md shadow-blue-500/20"
                    >
                      <Mail size={16} color="#fff" />
                      <Text className="text-white font-bold text-xs">Email Member</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Edit & Delete Action Buttons */}
                <View className="flex-row gap-3 pt-1">
                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() => setIsEditMode(true)}
                    activeOpacity={0.8}
                    className="flex-1 flex-row items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 py-3.5 rounded-2xl active:bg-slate-900 shadow-sm"
                  >
                    <Edit3 size={16} color="#38bdf8" />
                    <Text className="text-sky-300 font-bold text-xs">Edit Details</Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={handleDeleteMember}
                    disabled={isDeletingUser}
                    activeOpacity={0.8}
                    className="flex-1 flex-row items-center justify-center gap-2 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 py-3.5 rounded-2xl active:bg-rose-500/30"
                  >
                    {isDeletingUser ? (
                      <ActivityIndicator size="small" color="#f43f5e" />
                    ) : (
                      <>
                        <Trash2 size={16} color="#f43f5e" />
                        <Text className="text-rose-600 dark:text-rose-400 font-bold text-xs">Delete User</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ActionModal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
