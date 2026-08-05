import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  Plus,
  UsersRound,
  User,
  Shield,
  MapPin,
  ChevronRight,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import {
  useGetOrgTeamsQuery,
  useGetOrgUsersQuery,
  useCreateOrgTeamMutation,
} from '@/services/api/orgApi';

export default function TeamsListScreen() {
  const router = useRouter();
  const { user: authUser } = useSelector((state) => state.auth);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attendanceRadius, setAttendanceRadius] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: teamsData,
    isLoading: teamsLoading,
    refetch: refetchTeams,
  } = useGetOrgTeamsQuery(100, { skip: !authUser });

  const { data: usersData } = useGetOrgUsersQuery(200, { skip: !authUser });
  const [createTeam] = useCreateOrgTeamMutation();

  const teams = useMemo(() => {
    return Array.isArray(teamsData?.items) ? teamsData.items : [];
  }, [teamsData]);

  const allUsers = useMemo(() => {
    return Array.isArray(usersData?.items) ? usersData.items : [];
  }, [usersData]);

  const toggleMemberSelection = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreateTeam = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a team name.');
      return;
    }

    try {
      setSubmitting(true);
      await createTeam({
        name: name.trim(),
        description: description.trim(),
        leaderId: leaderId || undefined,
        memberIds: selectedMemberIds,
        attendanceRadius: attendanceRadius ? Number(attendanceRadius) : undefined,
      }).unwrap();

      Alert.alert('Success', `Team "${name}" created successfully.`);
      setCreateModalOpen(false);
      setName('');
      setDescription('');
      setAttendanceRadius('');
      setLeaderId('');
      setSelectedMemberIds([]);
      await refetchTeams();
    } catch (err) {
      Alert.alert('Creation Failed', err?.data?.message || 'Could not create team.');
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
            <Text className="text-xl font-black text-slate-900">Teams & Pods</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {teams.length} organizational teams
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setCreateModalOpen(true)}
              className="p-2.5 bg-indigo-600 rounded-xl active:bg-indigo-700 flex-row items-center gap-1"
            >
              <Plus color="#ffffff" size={16} />
              <Text className="text-white font-bold text-xs">New Team</Text>
            </Pressable>
            <Pressable
              onPress={() => refetchTeams()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Team Cards */}
      <ScrollView className="flex-1 px-4 pt-3">
        {teamsLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading teams...</Text>
          </View>
        ) : teams.length === 0 ? (
          <View className="py-16 items-center">
            <UsersRound color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No teams created yet</Text>
          </View>
        ) : (
          teams.map((team) => {
            const leaderName = team?.leader?.name || team?.leaderName || 'Unassigned';
            const memberCount = team?.membersCount ?? (team?.members?.length || 0);

            return (
              <Pressable
                key={team.id}
                onPress={() => router.push(`/(drawer)/admin/teams/${team.id}`)}
                className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs active:bg-slate-50"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-slate-900 font-extrabold text-lg flex-1 mr-2" numberOfLines={1}>
                    {team.name}
                  </Text>
                  <ChevronRight color="#94a3b8" size={18} />
                </View>

                {team.description ? (
                  <Text className="text-slate-500 text-xs mb-3" numberOfLines={2}>
                    {team.description}
                  </Text>
                ) : null}

                <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                  <View className="flex-row items-center gap-2">
                    <Shield color="#4f46e5" size={14} />
                    <Text className="text-slate-700 text-xs font-semibold">
                      Leader: {leaderName}
                    </Text>
                  </View>

                  <View className="bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <Text className="text-indigo-700 text-xs font-bold">
                      {memberCount} Members
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Create Team Modal */}
      <Modal visible={createModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Create New Team</Text>
              <Pressable onPress={() => setCreateModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Team Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Dhol Tasha Pathak A"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Description (Optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the team..."
                multiline
                numberOfLines={2}
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Custom Attendance Radius (Meters)</Text>
              <TextInput
                value={attendanceRadius}
                onChangeText={setAttendanceRadius}
                placeholder="Leave blank to use org default"
                keyboardType="numeric"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-4"
              />

              {/* Leader Selection */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">Select Team Leader</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {allUsers.map((u) => (
                    <Pressable
                      key={u.id}
                      onPress={() => setLeaderId(leaderId === u.id ? '' : u.id)}
                      className={`px-3.5 py-2 rounded-xl border ${
                        leaderId === u.id
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          leaderId === u.id ? 'text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        {u.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Multi-member Selection */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">
                Assign Members ({selectedMemberIds.length} selected)
              </Text>
              <View className="bg-slate-50 p-3 rounded-2xl mb-6 max-h-48">
                <ScrollView nestedScrollEnabled>
                  {allUsers.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.id);
                    return (
                      <Pressable
                        key={u.id}
                        onPress={() => toggleMemberSelection(u.id)}
                        className="flex-row items-center justify-between py-2 border-b border-slate-100"
                      >
                        <Text className="text-slate-800 text-xs font-medium">{u.name}</Text>
                        <View
                          className={`w-5 h-5 rounded-md border items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 color="#fff" size={12} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <Pressable
                onPress={handleCreateTeam}
                disabled={submitting}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Create Team</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
