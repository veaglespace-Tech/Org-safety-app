import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Modal, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { useGetMembersQuery } from '@/services/api/authApi';
import { useDeleteOrgUserMutation, useCreateOrgUserMutation, usePatchOrgUserMutation } from '@/services/api/orgApi';
import { Users, User, Trash2, Edit2, Plus, Phone, Mail, X, Save, RefreshCcw } from 'lucide-react-native';

export default function MembersScreen() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetMembersQuery();
  const [deleteOrgUser] = useDeleteOrgUserMutation();
  const [createOrgUser, { isLoading: isCreating }] = useCreateOrgUserMutation();
  const [updateOrgUser, { isLoading: isUpdating }] = usePatchOrgUserMutation();
  
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: '', email: '', phone: '', emergency_contact: '',
    role: 'member', city: '', gender: '', blood_group: '',
    current_address: '', permanent_address: ''
  });

  const members = data?.members || [];

  const openAddModal = () => {
    setFormData({
      id: null, name: '', email: '', phone: '', emergency_contact: '',
      role: 'member', city: '', gender: '', blood_group: '',
      current_address: '', permanent_address: ''
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditModal = (member) => {
    setFormData({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      emergency_contact: member.emergency_contact || '',
      role: member.role === 'admin' ? 'admin' : 'member',
      city: member.city || '',
      gender: member.gender || '',
      blood_group: member.blood_group || '',
      current_address: member.current_address || '',
      permanent_address: member.permanent_address || ''
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!formData.name || !formData.email) {
        Alert.alert("Error", "Name and email are required");
        return;
      }
      if (isEditing) {
        await updateOrgUser({ userId: formData.id, ...formData }).unwrap();
        Alert.alert("Success", "User updated successfully");
      } else {
        await createOrgUser(formData).unwrap();
        Alert.alert("Success", "User created successfully");
      }
      setModalVisible(false);
      refetch();
    } catch (err) {
      Alert.alert("Error", err?.data?.error || "Failed to save user");
    }
  };

  const handleDelete = (member) => {
    if (!user || member?.id === user?.id) {
      Alert.alert("Error", "You cannot delete yourself.");
      return;
    }
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${member?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOrgUser(member.id).unwrap();
              Alert.alert("Success", "User deleted successfully");
              refetch();
            } catch (err) {
              Alert.alert("Error", err?.data?.error || "Failed to delete user");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-end">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900">Members</Text>
            <Text className="text-slate-500 text-sm mt-1">Manage your team</Text>
          </View>
          <Pressable 
            onPress={openAddModal}
            className="bg-indigo-600 flex-row items-center px-3 py-2 rounded-xl active:bg-indigo-700"
          >
            <Plus color="#fff" size={16} />
            <Text className="text-white font-bold ml-1 text-xs">Add Member</Text>
          </Pressable>
        </View>

        {/* Members List */}
        {isLoading ? (
          <View className="py-16 items-center">
            <Text className="text-slate-400 font-medium">Loading members...</Text>
          </View>
        ) : members.length === 0 ? (
          <View className="py-16 items-center mx-5 bg-white rounded-2xl border border-slate-100">
            <Users color="#94a3b8" size={40} />
            <Text className="text-slate-500 font-medium mt-3">No members found</Text>
          </View>
        ) : (
          <View className="mx-4 mt-2 mb-8">
            {members.map((member, idx) => (
              <Pressable
                key={member?.id || idx}
                onPress={() => setSelectedMember(selectedMember?.id === member?.id ? null : member)}
                className="bg-white mb-2 rounded-2xl border border-slate-100 overflow-hidden active:bg-slate-50"
              >
                <View className="flex-row items-center px-4 py-4">
                  <View className="w-12 h-12 rounded-xl bg-slate-100 items-center justify-center mr-4 overflow-hidden">
                    {member?.profile_photo ? (
                      <Image source={{ uri: member.profile_photo }} style={{ width: 48, height: 48 }} />
                    ) : (
                      <User color="#94a3b8" size={22} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 text-base">{member?.name || 'Unknown'}</Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Mail color="#94a3b8" size={12} />
                      <Text className="text-slate-500 text-xs">{member?.email}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className={`px-2.5 py-1 rounded-lg ${member?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${member?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                        {member?.role}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Expanded Details */}
                {selectedMember?.id === member?.id && (
                  <View className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <View className="flex-row flex-wrap gap-3 mb-3">
                      <DetailPill label="Phone" value={member?.phone} />
                      <DetailPill label="Gender" value={member?.gender} />
                      <DetailPill label="Blood" value={member?.blood_group} valueColor="text-red-600" />
                      <DetailPill label="Emergency" value={member?.emergency_contact} valueColor="text-rose-600" />
                      <DetailPill label="City" value={member?.city} />
                    </View>
                    
                    {/* Actions */}
                    <View className="flex-row gap-2 mt-2">
                      <Pressable
                        onPress={() => openEditModal(member)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 rounded-xl active:bg-blue-100"
                      >
                        <Edit2 color="#3b82f6" size={16} />
                        <Text className="text-blue-600 font-bold text-xs">Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(member)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 rounded-xl active:bg-red-100"
                      >
                        <Trash2 color="#ef4444" size={16} />
                        <Text className="text-red-600 font-bold text-xs">Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Member' : 'Add New Member'}
            </Text>
            <Pressable onPress={() => setModalVisible(false)} className="p-2">
              <X color="#64748b" size={24} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-4">
            <InputField label="Full Name *" value={formData.name} onChangeText={(v) => setFormData({...formData, name: v})} />
            <InputField label="Email Address *" value={formData.email} onChangeText={(v) => setFormData({...formData, email: v})} keyboardType="email-address" editable={!isEditing} />
            <InputField label="Phone Number" value={formData.phone} onChangeText={(v) => setFormData({...formData, phone: v})} keyboardType="phone-pad" />
            <InputField label="Emergency Contact" value={formData.emergency_contact} onChangeText={(v) => setFormData({...formData, emergency_contact: v})} keyboardType="phone-pad" />
            
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</Text>
            <View className="flex-row gap-3 mb-4">
              <Pressable 
                onPress={() => setFormData({...formData, role: 'member'})}
                className={`flex-1 py-3 rounded-xl border ${formData.role === 'member' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <Text className={`text-center font-bold ${formData.role === 'member' ? 'text-indigo-600' : 'text-slate-500'}`}>Member</Text>
              </Pressable>
              <Pressable 
                onPress={() => setFormData({...formData, role: 'admin'})}
                className={`flex-1 py-3 rounded-xl border ${formData.role === 'admin' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <Text className={`text-center font-bold ${formData.role === 'admin' ? 'text-indigo-600' : 'text-slate-500'}`}>Admin</Text>
              </Pressable>
            </View>

            <InputField label="City" value={formData.city} onChangeText={(v) => setFormData({...formData, city: v})} />
            <InputField label="Gender" value={formData.gender} onChangeText={(v) => setFormData({...formData, gender: v})} placeholder="MALE / FEMALE / OTHER" />
            <InputField label="Blood Group" value={formData.blood_group} onChangeText={(v) => setFormData({...formData, blood_group: v})} placeholder="e.g. O+, A-" />
            
            {!isEditing && (
              <View className="bg-blue-50 p-4 rounded-xl mt-2 mb-6">
                <Text className="text-blue-800 text-xs font-medium leading-relaxed">
                  Note: Default password will be <Text className="font-bold">Password@123</Text>. They should change it after logging in.
                </Text>
              </View>
            )}

            <View className="h-20" />
          </ScrollView>

          <View className="p-5 border-t border-slate-100">
            <Pressable
              onPress={handleSaveUser}
              disabled={isCreating || isUpdating}
              className={`flex-row justify-center items-center gap-2 py-4 rounded-2xl ${isCreating || isUpdating ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'}`}
            >
              {(isCreating || isUpdating) ? <RefreshCcw color="#fff" size={20} /> : <Save color="#fff" size={20} />}
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Save Changes' : 'Create Member'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailPill({ label, value, valueColor = "text-slate-900" }) {
  if (!value) return null;
  return (
    <View className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
      <Text className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</Text>
      <Text className={`font-medium text-xs ${valueColor}`}>{value}</Text>
    </View>
  );
}

function InputField({ label, value, onChangeText, keyboardType, editable = true, placeholder = "" }) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</Text>
      <View className={`bg-slate-50 rounded-xl border border-slate-200 px-4 ${!editable ? 'opacity-60' : ''}`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
          placeholder={placeholder || label}
          placeholderTextColor="#94a3b8"
          className="py-3.5 text-slate-900 text-sm font-medium"
        />
      </View>
    </View>
  );
}
