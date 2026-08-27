import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  User,
  Phone,
  Mail,
  Lock,
  Save,
  MapPin,
  Building2,
  Camera,
  HeartPulse,
  Palette,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react-native';

import { authApi } from '@/services/api/authApi';
import { orgApi } from '@/services/api/orgApi';
import { setCurrentUser } from '@/store/slices/authSlice';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TextInput } from '@/components/ui/TextInput';
import { CountryPhoneField } from '@/components/ui/CountryPhoneField';
import { ActionModal } from '@/components/ui/ActionModal';
import { AppFooter } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/utils/roles';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();

  const { data: meData, refetch } = authApi.useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  const [updateMe, { isLoading: isUpdatingProfile }] = authApi.useUpdateMeMutation();
  const [updateOrgDetails, { isLoading: isUpdatingOrg }] = orgApi.useUpdateOrgDetailsMutation();

  const currentUser = meData?.user || user;
  const currentOrg = currentUser?.organization;
  const isAdmin =
    currentUser?.role === ROLES.ORG_ADMIN ||
    currentUser?.role === ROLES.SUPER_ADMIN ||
    currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'profile' | 'org'>('profile');
  const [showBloodGroupModal, setShowBloodGroupModal] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCountryCode: '+91',
    phone: '',
    emergencyContact: '',
    password: '',
    profilePhoto: '',
    city: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    currentAddress: '',
    permanentAddress: '',
  });

  // Organization Form State
  const [orgData, setOrgData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    logo: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneCountryCode: '+91',
        phone: currentUser.phone || '',
        emergencyContact: currentUser.emergencyContact || '',
        password: '',
        profilePhoto: currentUser.profilePhoto || '',
        city: currentUser.city || '',
        gender: currentUser.gender || 'MALE',
        bloodGroup: currentUser.bloodGroup || 'O+',
        currentAddress: currentUser.currentAddress || '',
        permanentAddress: currentUser.permanentAddress || '',
      });
      if (currentOrg) {
        setOrgData({
          name: currentOrg.name || '',
          email: currentOrg.email || '',
          phone: currentOrg.phone || '',
          address: currentOrg.address || '',
          city: currentOrg.city || '',
          state: currentOrg.state || '',
          country: currentOrg.country || '',
          logo: currentOrg.logo || '',
        });
      }
    }
  }, [currentUser, currentOrg]);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is needed to update your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4, // compress on device
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const base64Str = result.assets[0].base64;
      const estimatedBytes = Math.ceil((base64Str.length * 3) / 4);
      const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(1);

      if (estimatedBytes > 4 * 1024 * 1024) {
        Alert.alert(
          'Image Too Large',
          `Your image is ~${estimatedMB}MB after compression. Please choose a smaller image (under 4MB).`,
          [{ text: 'OK' }]
        );
        return;
      }

      const base64Image = `data:image/jpeg;base64,${base64Str}`;
      setFormData((prev) => ({ ...prev, profilePhoto: base64Image }));
    }
  };

  const pickOrgImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is needed to update the organization logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4, // compress on device
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const base64Str = result.assets[0].base64;
      const estimatedBytes = Math.ceil((base64Str.length * 3) / 4);
      const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(1);

      if (estimatedBytes > 4 * 1024 * 1024) {
        Alert.alert(
          'Logo Too Large',
          `Your image is ~${estimatedMB}MB after compression. Please choose a smaller image (under 4MB).`,
          [{ text: 'OK' }]
        );
        return;
      }

      const base64Image = `data:image/jpeg;base64,${base64Str}`;
      setOrgData((prev) => ({ ...prev, logo: base64Image }));
    }
  };

  const handleProfileSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Validation Error', 'Name and email are required fields.');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        profilePhoto: formData.profilePhoto,
        city: formData.city,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
      };

      if (formData.password) {
        if (formData.password.length < 8) {
          Alert.alert('Validation Error', 'Password must be at least 8 characters.');
          return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_-])[A-Za-z\d@$!%*?&#^~_-]{8,}$/.test(formData.password)) {
          Alert.alert(
            'Weak Password',
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
          );
          return;
        }
        payload.password = formData.password;
      }

      const res = await updateMe(payload).unwrap();
      if (res?.user) {
        dispatch(setCurrentUser({ ...currentUser, ...res.user }));
      }
      Alert.alert('Success', 'Your profile settings have been updated.');
      setFormData((prev) => ({ ...prev, password: '' })); // Clear password
      refetch();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.data?.error || 'Failed to update profile settings.');
    }
  };

  const handleOrgSubmit = async () => {
    if (!orgData.name) {
      Alert.alert('Validation Error', 'Organization name is required.');
      return;
    }

    try {
      const res = await updateOrgDetails(orgData).unwrap();
      if (res?.organization) {
        dispatch(
          setCurrentUser({
            ...currentUser,
            organization: { ...currentOrg, ...res.organization },
          })
        );
      }
      Alert.alert('Success', 'Organization settings have been updated.');
      refetch();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.data?.message || 'Failed to update organization details.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        {/* Tabs Header */}
      {isAdmin && (
        <View className="flex-row px-5 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'profile'
                ? 'border-blue-600 dark:border-blue-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`font-extrabold text-sm ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Personal Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('org')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'org'
                ? 'border-blue-600 dark:border-blue-500'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`font-extrabold text-sm ${
                activeTab === 'org'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Organization Data
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Card */}
        <SurfaceCard className="p-5 mb-4">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 items-center justify-center shrink-0">
                <Palette size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-slate-900 dark:text-white" numberOfLines={1}>
                  Theme & Appearance
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium" numberOfLines={1}>
                  {isDark ? 'Dark mode is active' : 'Light mode is active'}
                </Text>
              </View>
            </View>
            <ThemeToggle variant="pill" containerClass="shrink-0" />
          </View>
        </SurfaceCard>

        {activeTab === 'profile' ? (
          <SurfaceCard className="p-5">
            {/* Profile Avatar Selection */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={pickProfileImage}
                activeOpacity={0.8}
                className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 items-center justify-center overflow-hidden relative"
              >
                {formData.profilePhoto ? (
                  <Image
                    source={{ uri: formData.profilePhoto }}
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                ) : (
                  <User size={40} color={isDark ? '#94a3b8' : '#64748b'} />
                )}
                <View className="absolute bottom-0 w-full bg-black/50 py-1 items-center">
                  <Camera size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">Tap to change photo</Text>
            </View>

            <TextInput
              label="Full Name"
              required
              value={formData.name}
              onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
              leftIcon={<User size={16} color={isDark ? '#94a3b8' : '#64748b'} />}
            />

            <TextInput
              label="Email Address"
              required
              value={formData.email}
              editable={false} // Prevent changing email freely
              leftIcon={<Mail size={16} color={isDark ? '#94a3b8' : '#64748b'} />}
              helpText="Contact admin to change your registered email address."
            />

            <CountryPhoneField
              label="Phone Number"
              countryCode={formData.phoneCountryCode}
              phone={formData.phone}
              onCountryCodeChange={(code) => setFormData((p) => ({ ...p, phoneCountryCode: code }))}
              onPhoneChange={(phone) => setFormData((p) => ({ ...p, phone }))}
            />

            <TextInput
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChangeText={(t) => setFormData((p) => ({ ...p, emergencyContact: t.replace(/\D/g, '') }))}
              keyboardType="phone-pad"
              leftIcon={<HeartPulse size={16} color="#ef4444" />}
              helpText="This number is automatically alerted when you trigger SOS."
            />

            {/* Gender Selection */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">Gender</Text>
              <View className="flex-row gap-2">
                {GENDERS.map((g) => {
                  const isSelected = formData.gender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => setFormData((p) => ({ ...p, gender: g.value }))}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Blood Group */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">Blood Group</Text>
              <TouchableOpacity
                onPress={() => setShowBloodGroupModal(true)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.bloodGroup || 'Select Blood Group'}
                </Text>
                <ChevronDown size={18} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(t) => setFormData((p) => ({ ...p, city: t }))}
              leftIcon={<MapPin size={16} color={isDark ? '#94a3b8' : '#64748b'} />}
            />

            <TextInput
              label="Update Password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChangeText={(t) => setFormData((p) => ({ ...p, password: t }))}
              isPassword
              leftIcon={<Lock size={16} color={isDark ? '#94a3b8' : '#64748b'} />}
            />

            <Button
              onPress={handleProfileSubmit}
              isLoading={isUpdatingProfile}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-md shadow-blue-500/20 mt-2"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Save size={16} color="#fff" />
                <Text className="text-white font-extrabold text-sm">Save Profile Changes</Text>
              </View>
            </Button>
          </SurfaceCard>
        ) : (
          <SurfaceCard className="p-5">
            {/* Org Logo Selection */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={pickOrgImage}
                activeOpacity={0.8}
                className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-100 dark:border-indigo-900/40 items-center justify-center overflow-hidden relative"
              >
                {orgData.logo ? (
                  <Image source={{ uri: orgData.logo }} style={{ width: 96, height: 96 }} />
                ) : (
                  <Building2 size={40} color="#6366f1" />
                )}
                <View className="absolute bottom-0 w-full bg-black/50 py-1 items-center">
                  <Camera size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2">Tap to change logo</Text>
            </View>

            <View className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Text className="text-lg font-black text-slate-900 dark:text-white text-center">Organization Settings</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 text-center">
                Update primary registration details
              </Text>
            </View>

            <TextInput
              label="Organization Name"
              required
              value={orgData.name}
              onChangeText={(t) => setOrgData((p) => ({ ...p, name: t }))}
            />
            <TextInput
              label="Contact Email"
              value={orgData.email}
              onChangeText={(t) => setOrgData((p) => ({ ...p, email: t }))}
            />
            <TextInput
              label="Contact Phone"
              value={orgData.phone}
              onChangeText={(t) => setOrgData((p) => ({ ...p, phone: t }))}
            />
            <TextInput
              label="City"
              value={orgData.city}
              onChangeText={(t) => setOrgData((p) => ({ ...p, city: t }))}
            />
            <TextInput
              label="State / Province"
              value={orgData.state}
              onChangeText={(t) => setOrgData((p) => ({ ...p, state: t }))}
            />
            <TextInput
              label="Physical Address"
              value={orgData.address}
              onChangeText={(t) => setOrgData((p) => ({ ...p, address: t }))}
            />

            <Button
              onPress={handleOrgSubmit}
              isLoading={isUpdatingOrg}
              size="lg"
              className="bg-indigo-600 rounded-2xl shadow-md shadow-indigo-500/20 mt-2"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Save size={16} color="#fff" />
                <Text className="text-white font-extrabold text-sm">Save Organization Data</Text>
              </View>
            </Button>
          </SurfaceCard>
        )}
        
        <DeleteAccountSection type={activeTab === 'profile' ? 'user' : 'org'} />
        
        <View className="mt-auto pt-6">
          <AppFooter />
        </View>
      </ScrollView>

      {/* Blood Group Modal */}
      <ActionModal
        visible={showBloodGroupModal}
        onClose={() => setShowBloodGroupModal(false)}
        title="Select Blood Group"
        subtitle="Choose your blood group from the list below"
      >
        <View className="flex-row flex-wrap gap-2">
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = formData.bloodGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                onPress={() => {
                  setFormData((p) => ({ ...p, bloodGroup: bg }));
                  setShowBloodGroupModal(false);
                }}
                className={`w-[31%] py-3 rounded-xl border items-center ${
                  isSelected
                    ? 'bg-red-600 border-red-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ActionModal>
    </View>
    </KeyboardAvoidingView>
  );
}
