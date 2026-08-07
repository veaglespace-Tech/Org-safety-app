import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  Layers,
  Crown,
  Search,
} from 'lucide-react-native';

import {
  useGetOrgTeamsQuery,
  useGetOrgUsersQuery,
  useCreateOrgTeamMutation,
  useDeleteOrgTeamMutation,
} from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';

export default function TeamsListScreen() {
  const router = useRouter();
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attendanceRadius, setAttendanceRadius] = useState('100');
  const [leaderId, setLeaderId] = useState<number | string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: teamsData,
    isLoading: teamsLoading,
    refetch: refetchTeams,
    isFetching,
  } = useGetOrgTeamsQuery(100, { skip: !authUser });

  const { data: usersData } = useGetOrgUsersQuery(200, { skip: !authUser });
  const [createTeam] = useCreateOrgTeamMutation();
  const [deleteTeam] = useDeleteOrgTeamMutation();

  const teams = useMemo(() => {
    return Array.isArray(teamsData?.items) ? teamsData.items : [];
  }, [teamsData]);

  const allUsers = useMemo(() => {
    return Array.isArray(usersData?.items) ? usersData.items : [];
  }, [usersData]);

  const toggleMemberSelection = (id: number) => {
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
        leaderId: leaderId ? Number(leaderId) : undefined,
        memberIds: selectedMemberIds,
        attendanceRadius: attendanceRadius ? Number(attendanceRadius) : 100,
      }).unwrap();

      Alert.alert('Success', `Team "${name}" created successfully.`);
      setCreateModalOpen(false);
      setName('');
      setDescription('');
      setAttendanceRadius('100');
      setLeaderId('');
      setSelectedMemberIds([]);
      await refetchTeams();
    } catch (err: any) {
      Alert.alert('Creation Failed', err?.data?.message || 'Could not create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = (team: any) => {
    Alert.alert('Delete Team', `Are you sure you want to delete team "${team.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTeam(team.id).unwrap();
            Alert.alert('Success', 'Team deleted successfully.');
            setSelectedTeam(null);
            refetchTeams();
          } catch (err: any) {
            Alert.alert('Error', err?.data?.error || 'Failed to delete team.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Teams</Text>
            <Text className="text-slate-400 font-medium text-xs">
              {teams.length} Squads & Performance Units
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => refetchTeams()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCreateModalOpen(true)}
              className="flex-row items-center gap-1.5 bg-blue-600 px-3.5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 active:bg-blue-700"
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Create Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Teams List */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {teamsLoading || isFetching ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-slate-400 font-semibold text-xs mt-3">Loading teams...</Text>
          </View>
        ) : teams.length === 0 ? (
          <View className="py-16 items-center">
            <Layers size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">No teams created yet</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Group your members into Dhol, Tasha, Dhwaj, or Safety units.
            </Text>
          </View>
        ) : (
          teams.map((team: any) => (
            <SurfaceCard key={team.id} className="mb-3.5 p-4">
              <TouchableOpacity
                onPress={() => setSelectedTeam(team)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                      <Layers color="#4f46e5" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-black text-slate-900">{team.name}</Text>
                      {team.description ? (
                        <Text className="text-xs text-slate-400 font-medium" numberOfLines={1}>
                          {team.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </View>

                <View className="flex-row items-center gap-2 pt-3 border-t border-slate-100">
                  <View className="flex-row items-center gap-1">
                    <Crown size={12} color="#f59e0b" />
                    <Text className="text-xs font-bold text-slate-700">
                      Leader: {team.leader?.name || team.leaderName || 'Unassigned'}
                    </Text>
                  </View>
                  <View className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                  <View className="flex-row items-center gap-1">
                    <UsersRound size={12} color="#2563eb" />
                    <Text className="text-xs font-bold text-blue-600">
                      {team.memberCount || team.members?.length || 0} Members
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </SurfaceCard>
          ))
        )}
      </ScrollView>

      {/* Team Details / Delete Action Sheet */}
      {selectedTeam && (
        <ActionModal
          visible={Boolean(selectedTeam)}
          onClose={() => setSelectedTeam(null)}
          title={selectedTeam?.name || 'Team Details'}
          subtitle={selectedTeam?.description || 'Performance Unit'}
        >
          <SurfaceCard variant="flat" className="p-4 mb-4">
            <View className="space-y-2.5">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Team Leader:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedTeam?.leader?.name || 'Unassigned'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Total Members:</Text>
                <Text className="text-xs font-bold text-blue-600">
                  {selectedTeam?.memberCount || selectedTeam?.members?.length || 0}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Geofence Radius:</Text>
                <Text className="text-xs font-bold text-emerald-600">
                  {selectedTeam?.attendanceRadius || 100} meters
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <TouchableOpacity
            onPress={() => handleDeleteTeam(selectedTeam)}
            className="flex-row items-center justify-center gap-2 bg-red-600 py-3.5 rounded-2xl active:bg-red-700 shadow-md shadow-red-500/20"
          >
            <Trash2 size={16} color="#fff" />
            <Text className="text-white font-bold text-xs">Delete Team</Text>
          </TouchableOpacity>
        </ActionModal>
      )}

      {/* Create Team Modal */}
      {createModalOpen && (
        <ActionModal
          visible={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Team"
          subtitle="Assemble squad units and assign leadership"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            <TextInput
              label="Team Name"
              required
              placeholder="e.g. ढोल पथक (Dhol Section A)"
              value={name}
              onChangeText={setName}
              leftIcon={<Layers size={16} color="#64748b" />}
            />

            <TextInput
              label="Description (Optional)"
              placeholder="Frontline rhythm performers"
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              label="Attendance Geofence Radius (Meters)"
              placeholder="100"
              value={attendanceRadius}
              onChangeText={setAttendanceRadius}
              keyboardType="number-pad"
              leftIcon={<MapPin size={16} color="#64748b" />}
            />

            {/* Select Team Leader */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Select Team Leader</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setLeaderId('')}
                    className={`px-3 py-2 rounded-xl border ${
                      !leaderId ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${!leaderId ? 'text-white' : 'text-slate-700'}`}
                    >
                      None
                    </Text>
                  </TouchableOpacity>

                  {allUsers.map((u: any) => {
                    const isSelected = leaderId === u.id;
                    return (
                      <TouchableOpacity
                        key={u.id}
                        onPress={() => setLeaderId(u.id)}
                        className={`px-3 py-2 rounded-xl border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white' : 'text-slate-700'
                          }`}
                        >
                          {u.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Select Members */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">
                Assign Members ({selectedMemberIds.length} selected)
              </Text>
              <ScrollView className="max-h-40 border border-slate-200 rounded-2xl p-2 bg-slate-50">
                {allUsers.map((u: any) => {
                  const isSelected = selectedMemberIds.includes(u.id);
                  return (
                    <TouchableOpacity
                      key={u.id}
                      onPress={() => toggleMemberSelection(u.id)}
                      className={`flex-row items-center justify-between p-2.5 mb-1 rounded-xl ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-white'
                      }`}
                    >
                      <Text className="text-xs font-bold text-slate-800">{u.name}</Text>
                      {isSelected ? (
                        <CheckCircle2 size={16} color="#2563eb" />
                      ) : (
                        <View className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Button
              onPress={handleCreateTeam}
              isLoading={submitting}
              size="lg"
              className="bg-blue-600 rounded-2xl shadow-md shadow-blue-500/20 mt-2 mb-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-sm">Create Team</Text>
              </View>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
