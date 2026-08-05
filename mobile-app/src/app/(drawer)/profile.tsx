import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, Mail, Lock, Save, Loader2, CheckCircle2, MapPin, Building2, Camera, Shield } from 'lucide-react-native';
import { authApi } from '@/services/api/authApi';
import { orgApi } from '@/services/api/orgApi';
import { setCurrentUser } from '@/store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [updateMe, { isLoading }] = authApi.useUpdateMeMutation();
  const [updateOrgDetails, { isLoading: isOrgLoading }] = orgApi.useUpdateOrgDetailsMutation();

  const [activeTab, setActiveTab] = useState('profile');
  const [status, setStatus] = useState('idle');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', emergencyContact: '', password: '',
    profilePhoto: '', city: '', gender: '', bloodGroup: '',
    currentAddress: '', permanentAddress: '',
  });

  const [orgData, setOrgData] = useState({
    name: '', email: '', phone: '', address: '',
    city: '', state: '', country: '', logo: '',
  });

  const { data: meData } = authApi.useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const currentUser = meData?.user || user;
  const currentOrg = currentUser?.organization;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        emergencyContact: currentUser.emergencyContact || '',
        password: '',
        profilePhoto: currentUser.profilePhoto || '',
        city: currentUser.city || '',
        gender: currentUser.gender || '',
        bloodGroup: currentUser.bloodGroup || '',
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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgChange = (name, value) => {
    setOrgData(prev => ({ ...prev, [name]: value }));
  };

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is needed.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFormData(prev => ({ ...prev, profilePhoto: base64 }));
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'org') {
      try {
        setStatus('idle');
        const response = await updateOrgDetails(orgData).unwrap();
        if (response?.organization) {
          dispatch(setCurrentUser({
            ...currentUser,
            organization: { ...currentUser.organization, ...response.organization },
          }));
        }
        setStatus('success');
        Alert.alert('Success', 'Organization updated successfully!');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (err) {
        setStatus('error');
        Alert.alert('Error', err?.data?.error || 'Failed to update organization.');
        setTimeout(() => setStatus('idle'), 3000);
      }
      return;
    }

    try {
      setStatus('idle');
      const response = await updateMe(formData).unwrap();
      dispatch(setCurrentUser(response.user));
      setStatus('success');
      Alert.alert('Success', 'Profile updated successfully!');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      Alert.alert('Error', err?.data?.error || err?.message || 'Failed to update profile.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const isSaving = isLoading || isOrgLoading;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-extrabold text-slate-900">Account Settings</Text>
        <Text className="text-slate-500 text-sm mt-1">Update your personal details</Text>
      </View>

      {/* Tab Switcher */}
      {isAdmin && (
        <View className="flex-row mx-5 mt-3 bg-slate-200/60 rounded-xl p-1 gap-1">
          <Pressable
            onPress={() => setActiveTab('profile')}
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'profile' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold text-xs tracking-wider ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500'}`}>
              PROFILE
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('org')}
            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'org' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold text-xs tracking-wider ${activeTab === 'org' ? 'text-indigo-600' : 'text-slate-500'}`}>
              ORGANIZATION
            </Text>
          </Pressable>
        </View>
      )}

      <View className="mx-5 mt-4 mb-8">
        {activeTab === 'profile' && (
          <View>
            {/* Profile Photo */}
            <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-4 items-center">
              <Pressable onPress={pickProfileImage}>
                <View className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 items-center justify-center overflow-hidden">
                  {formData.profilePhoto ? (
                    <Image source={{ uri: formData.profilePhoto }} style={{ width: 96, height: 96 }} />
                  ) : (
                    <User color="#94a3b8" size={36} />
                  )}
                </View>
                <View className="absolute bottom-0 right-0 bg-indigo-600 rounded-lg p-1.5">
                  <Camera color="#fff" size={14} />
                </View>
              </Pressable>
              <Text className="text-slate-500 text-xs mt-3">Tap to change photo</Text>
            </View>

            {/* Profile Fields */}
            <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
              <InputField label="Full Name" value={formData.name} onChangeText={(v) => handleChange('name', v)} icon={<User color="#94a3b8" size={18} />} />
              <InputField label="Email Address" value={formData.email} onChangeText={(v) => handleChange('email', v)} icon={<Mail color="#94a3b8" size={18} />} keyboardType="email-address" />
              <InputField label="New Password" value={formData.password} onChangeText={(v) => handleChange('password', v)} icon={<Lock color="#94a3b8" size={18} />} secureTextEntry placeholder="Leave blank to keep current" />
              <InputField label="Phone Number" value={formData.phone} onChangeText={(v) => handleChange('phone', v)} icon={<Phone color="#94a3b8" size={18} />} keyboardType="phone-pad" />
              <InputField label="City" value={formData.city} onChangeText={(v) => handleChange('city', v)} icon={<MapPin color="#94a3b8" size={18} />} />
              <InputField label="Current Address" value={formData.currentAddress} onChangeText={(v) => handleChange('currentAddress', v)} icon={<MapPin color="#94a3b8" size={18} />} multiline />
              <InputField label="Permanent Address" value={formData.permanentAddress} onChangeText={(v) => handleChange('permanentAddress', v)} icon={<MapPin color="#94a3b8" size={18} />} multiline />
            </View>

            {/* Emergency Contact */}
            <View className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Shield color="#ef4444" size={18} />
                <Text className="text-red-700 font-bold text-sm">Emergency SOS Contact</Text>
              </View>
              <InputField label="Emergency Contact Number" value={formData.emergencyContact} onChangeText={(v) => handleChange('emergencyContact', v)} icon={<Phone color="#ef4444" size={18} />} keyboardType="phone-pad" borderColor="border-red-200" />
              <Text className="text-red-500 text-xs mt-1">This number receives the WhatsApp message & Phone Call when you press SOS.</Text>
            </View>
          </View>
        )}

        {activeTab === 'org' && isAdmin && (
          <View>
            {/* Org Logo */}
            <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-4 items-center">
              <View className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 items-center justify-center overflow-hidden">
                {orgData.logo ? (
                  <Image source={{ uri: orgData.logo }} style={{ width: 80, height: 80 }} />
                ) : (
                  <Building2 color="#94a3b8" size={32} />
                )}
              </View>
              <Text className="text-slate-900 font-bold text-lg mt-3">{orgData.name || 'Organization'}</Text>
            </View>

            {/* Org Fields */}
            <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
              <InputField label="Organization Name" value={orgData.name} onChangeText={(v) => handleOrgChange('name', v)} icon={<Building2 color="#94a3b8" size={18} />} />
              <InputField label="Organization Email" value={orgData.email} onChangeText={(v) => handleOrgChange('email', v)} icon={<Mail color="#94a3b8" size={18} />} keyboardType="email-address" />
              <InputField label="Organization Phone" value={orgData.phone} onChangeText={(v) => handleOrgChange('phone', v)} icon={<Phone color="#94a3b8" size={18} />} keyboardType="phone-pad" />
              <InputField label="City" value={orgData.city} onChangeText={(v) => handleOrgChange('city', v)} icon={<MapPin color="#94a3b8" size={18} />} />
              <InputField label="State" value={orgData.state} onChangeText={(v) => handleOrgChange('state', v)} icon={<MapPin color="#94a3b8" size={18} />} />
              <InputField label="Country" value={orgData.country} onChangeText={(v) => handleOrgChange('country', v)} icon={<MapPin color="#94a3b8" size={18} />} />
              <InputField label="Address" value={orgData.address} onChangeText={(v) => handleOrgChange('address', v)} icon={<MapPin color="#94a3b8" size={18} />} multiline />
            </View>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl mt-2 ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
        >
          {isSaving ? (
            <>
              <Loader2 color="#fff" size={20} />
              <Text className="text-white font-bold text-base">Saving...</Text>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 color="#fff" size={20} />
              <Text className="text-white font-bold text-base">Saved!</Text>
            </>
          ) : (
            <>
              <Save color="#fff" size={20} />
              <Text className="text-white font-bold text-base">Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  icon = null,
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder = '',
  multiline = false,
  borderColor = 'border-slate-200',
}: any) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</Text>
      <View className={`flex-row items-center bg-slate-50 rounded-xl border ${borderColor} px-3`}>
        {icon && <View className="mr-2">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder || label}
          placeholderTextColor="#94a3b8"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          className="flex-1 py-3 text-slate-900 text-sm font-medium"
          style={multiline ? { textAlignVertical: 'top', minHeight: 60 } : {}}
        />
      </View>
    </View>
  );
}
