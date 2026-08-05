import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  UsersRound,
  User,
  Shield,
  Trash2,
  Edit3,
  UserMinus,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react-native';
import {
  useGetOrgTeamsQuery,
  useGetOrgUsersQuery,
  usePatchOrgTeamMutation,
  useDeleteOrgTeamMutation,
} from '@/services/api/orgApi';

export default function TeamDetailScreen() {
  const { teamId } = useLocalSearchParams();
  const router = useRouter();
  const { user: authUser } = useSelector((state) => state.auth);

  const { data: teamsData, refetch } = useGetOrgTeamsQuery(100, { skip: !authUser });
  const { data: usersData } = useGetOrgUsersQuery(200, { skip: !authUser });

  const [patchTeam, { isLoading: isPatching }] = usePatchOrgTeamMutation();
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteOrgTeamMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);

  const team = (teamsData?.items || []).find((t) => String(t.id) === String(teamId));
  const allUsers = usersData?.items || [];

  const [editName, setEditName] = useState(team?.name || '');
  const [editDesc, setEditDesc] = useState(team?.description || '');
  const [editRadius, setEditRadius] = useState(String(team?.attendanceRadius || ''));

  if (!team) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <ActivityIndicator color="#4f46e5" size="large" />
        <Text className="text-slate-500 font-bold text-sm mt-3">Loading team details...</Text>
      </View>
    );
  }

  const members = team?.members || [];
  const leader = team?.leader;

  const handleRemoveMember = (memberId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from this team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMemberIds = members.map((m) => m.id).filter((id) => id !== memberId);
              await patchTeam({
                id: team.id,
                memberIds: updatedMemberIds,
              }).unwrap();
              Alert.alert('Removed', `${memberName} removed from team.`);
              await refetch();
            } catch (err) {
              Alert.alert('Error', err?.data?.message || 'Could not remove member.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to permanently delete team "${team.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeam(team.id).unwrap();
              Alert.alert('Deleted', 'Team deleted successfully.');
              await refetch();
              router.back();
            } catch (err) {
              Alert.alert('Error', err?.data?.message || 'Could not delete team.');
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    try {
      await patchTeam({
        id: team.id,
        name: editName.trim(),
        description: editDesc.trim(),
        attendanceRadius: editRadius ? Number(editRadius) : undefined,
      }).unwrap();
      Alert.alert('Saved', 'Team details updated.');
      setEditModalOpen(false);
      await refetch();
    } catch (e) {
      Alert.alert('Save Failed', e?.data?.message || 'Could not update team.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Top Banner */}
      <View className="bg-indigo-600 px-6 pt-6 pb-8 rounded-b-3xl">
        <Text className="text-white font-black text-2xl" numberOfLines={1}>
          {team.name}
        </Text>
        {team.description ? (
          <Text className="text-indigo-100 text-xs mt-1 leading-5">{team.description}</Text>
        ) : null}

        <View className="flex-row gap-3 mt-4">
          <View className="bg-white/20 px-3 py-1 rounded-xl">
            <Text className="text-white text-xs font-bold">{members.length} Members</Text>
          </View>
          {team.attendanceRadius && (
            <View className="bg-white/20 px-3 py-1 rounded-xl">
              <Text className="text-white text-xs font-bold">Radius: {team.attendanceRadius}m</Text>
            </View>
          )}
        </View>
      </View>

      {/* Team Leader Card */}
      <View className="bg-white mx-4 -mt-4 rounded-3xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">
          Team Leader
        </Text>
        {leader ? (
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
              <Shield color="#4f46e5" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-base">{leader.name}</Text>
              <Text className="text-slate-400 text-xs">{leader.email}</Text>
            </View>
          </View>
        ) : (
          <Text className="text-slate-400 text-sm italic">No leader assigned to this team.</Text>
        )}
      </View>

      {/* Members List */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 font-extrabold text-base">Assigned Members</Text>
          <Text className="text-slate-400 text-xs font-bold">{members.length} members</Text>
        </View>

        {members.length === 0 ? (
          <Text className="text-slate-400 text-xs italic py-4 text-center">
            No members assigned yet.
          </Text>
        ) : (
          members.map((m) => (
            <View
              key={m.id}
              className="flex-row items-center justify-between py-3 border-b border-slate-100"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center">
                  <User color="#64748b" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-sm">{m.name}</Text>
                  <Text className="text-slate-400 text-xs">{m.email}</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleRemoveMember(m.id, m.name)}
                className="p-2 bg-rose-50 rounded-xl active:bg-rose-100"
              >
                <UserMinus color="#e11d48" size={16} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View className="mx-4 mt-6 mb-12 flex-row gap-3">
        <Pressable
          onPress={() => {
            setEditName(team.name || '');
            setEditDesc(team.description || '');
            setEditRadius(String(team.attendanceRadius || ''));
            setEditModalOpen(true);
          }}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-indigo-50 border border-indigo-200 active:bg-indigo-100 flex-row gap-2"
        >
          <Edit3 color="#4f46e5" size={18} />
          <Text className="text-indigo-600 font-bold text-sm">Edit Team</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteTeam}
          disabled={isDeleting}
          className="flex-1 py-4 rounded-2xl items-center justify-center bg-rose-50 border border-rose-200 active:bg-rose-100 flex-row gap-2"
        >
          <Trash2 color="#e11d48" size={18} />
          <Text className="text-rose-600 font-bold text-sm">Delete Team</Text>
        </Pressable>
      </View>

      {/* Edit Modal */}
      <Modal visible={editModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Edit Team Details</Text>
              <Pressable onPress={() => setEditModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Team Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
            />

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Description</Text>
            <TextInput
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
              numberOfLines={2}
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
            />

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Attendance Radius (Meters)</Text>
            <TextInput
              value={editRadius}
              onChangeText={setEditRadius}
              keyboardType="numeric"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-6"
            />

            <Pressable
              onPress={handleSaveEdit}
              disabled={isPatching}
              className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
            >
              {isPatching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-extrabold text-base">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
