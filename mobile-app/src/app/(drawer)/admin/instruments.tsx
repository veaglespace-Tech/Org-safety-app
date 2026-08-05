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
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react-native';
import {
  useGetOrgInstrumentsQuery,
  useCreateOrgInstrumentMutation,
  useAssignOrgInstrumentMutation,
  useUnassignOrgInstrumentMutation,
  useDeleteOrgInstrumentMutation,
  useGetOrgUsersQuery,
} from '@/services/api/orgApi';

export default function AdminInstrumentsScreen() {
  const { user: authUser } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalInstrument, setAssignModalInstrument] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [totalCount, setTotalCount] = useState('1');
  const [condition, setCondition] = useState('GOOD');
  const [submitting, setSubmitting] = useState(false);

  // Assign form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [instrumentNumber, setInstrumentNumber] = useState('1');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const {
    data: instData,
    isLoading,
    refetch,
  } = useGetOrgInstrumentsQuery(undefined, { skip: !authUser });

  const { data: usersData } = useGetOrgUsersQuery(200, { skip: !authUser });

  const [createInstrument] = useCreateOrgInstrumentMutation();
  const [assignInstrument] = useAssignOrgInstrumentMutation();
  const [unassignInstrument] = useUnassignOrgInstrumentMutation();
  const [deleteInstrument] = useDeleteOrgInstrumentMutation();

  const instruments = useMemo(() => {
    const list = Array.isArray(instData?.items)
      ? instData.items
      : Array.isArray(instData?.data)
      ? instData.data
      : [];
    if (!searchTerm.trim()) return list;
    return list.filter((i) => i.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [instData, searchTerm]);

  const allUsers = usersData?.items || [];

  const stats = useMemo(() => {
    let total = 0;
    let assigned = 0;
    instruments.forEach((item) => {
      const tot = item.totalCount || item.quantity || 0;
      const ass = Array.isArray(item.assignedMembers)
        ? item.assignedMembers.length
        : item.assignedCount || 0;
      total += tot;
      assigned += ass;
    });
    return { total, assigned, available: Math.max(0, total - assigned) };
  }, [instruments]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter instrument name.');
      return;
    }

    try {
      setSubmitting(true);
      await createInstrument({
        name: name.trim(),
        totalCount: parseInt(totalCount, 10) || 1,
        condition,
      }).unwrap();

      Alert.alert('Created', `Instrument "${name}" added.`);
      setCreateModalOpen(false);
      setName('');
      setTotalCount('1');
      await refetch();
    } catch (e) {
      Alert.alert('Failed', e?.data?.message || 'Could not create instrument.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Alert.alert('Required', 'Please select a member to assign to.');
      return;
    }

    try {
      setAssigning(true);
      await assignInstrument({
        instrumentId: assignModalInstrument.id,
        userId: selectedUserId,
        instrumentNumber: parseInt(instrumentNumber, 10) || 1,
        conditionNotes: assignNotes.trim(),
      }).unwrap();

      Alert.alert('Assigned', 'Instrument assigned successfully.');
      setAssignModalInstrument(null);
      setSelectedUserId('');
      setAssignNotes('');
      await refetch();
    } catch (e) {
      Alert.alert('Assign Failed', e?.data?.message || 'Could not assign instrument.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = (instrumentId, userId, memberName) => {
    Alert.alert('Unassign Instrument', `Unassign this instrument from ${memberName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unassign',
        style: 'destructive',
        onPress: async () => {
          try {
            await unassignInstrument({ instrumentId, userId }).unwrap();
            Alert.alert('Unassigned', 'Instrument returned to inventory.');
            await refetch();
          } catch (e) {
            Alert.alert('Error', e?.data?.message || 'Could not unassign instrument.');
          }
        },
      },
    ]);
  };

  const handleDelete = (id, instName) => {
    Alert.alert('Delete Instrument', `Permanently delete "${instName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInstrument(id).unwrap();
            await refetch();
          } catch (e) {
            Alert.alert('Error', e?.data?.message || 'Could not delete instrument.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900">Instruments Inventory</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Dhol, Tasha & Cultural equipment tracking
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setCreateModalOpen(true)}
              className="p-2.5 bg-indigo-600 rounded-xl active:bg-indigo-700 flex-row items-center gap-1"
            >
              <Plus color="#ffffff" size={16} />
              <Text className="text-white font-bold text-xs">Add Item</Text>
            </Pressable>
            <Pressable
              onPress={() => refetch()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </Pressable>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-2 mt-4">
          <View className="flex-1 bg-slate-100 p-3 rounded-2xl items-center">
            <Text className="text-slate-400 text-[10px] uppercase font-bold">Total Items</Text>
            <Text className="text-slate-900 font-extrabold text-base mt-0.5">{stats.total}</Text>
          </View>
          <View className="flex-1 bg-indigo-50 p-3 rounded-2xl items-center">
            <Text className="text-indigo-600 text-[10px] uppercase font-bold">Assigned</Text>
            <Text className="text-indigo-900 font-extrabold text-base mt-0.5">{stats.assigned}</Text>
          </View>
          <View className="flex-1 bg-emerald-50 p-3 rounded-2xl items-center">
            <Text className="text-emerald-600 text-[10px] uppercase font-bold">Available</Text>
            <Text className="text-emerald-900 font-extrabold text-base mt-0.5">{stats.available}</Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-slate-100 rounded-2xl px-3.5 py-2 mt-3">
          <Search color="#94a3b8" size={18} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search instruments..."
            className="flex-1 ml-2 text-sm text-slate-900 font-medium"
          />
        </View>
      </View>

      {/* Inventory List */}
      <ScrollView className="flex-1 px-4 pt-3">
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading inventory...</Text>
          </View>
        ) : instruments.length === 0 ? (
          <View className="py-16 items-center">
            <Package color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No instruments found</Text>
          </View>
        ) : (
          instruments.map((inst) => {
            const assignedMembers = Array.isArray(inst.assignedMembers) ? inst.assignedMembers : [];
            const available = Math.max(0, (inst.totalCount || 1) - assignedMembers.length);

            return (
              <View
                key={inst.id}
                className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-900 font-extrabold text-lg" numberOfLines={1}>
                      {inst.name}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      Total: {inst.totalCount || 1} • Available: {available}
                    </Text>
                  </View>

                  <View className="flex-row gap-2 items-center">
                    <Pressable
                      onPress={() => setAssignModalInstrument(inst)}
                      className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex-row items-center gap-1 active:bg-indigo-100"
                    >
                      <UserCheck color="#4f46e5" size={14} />
                      <Text className="text-indigo-600 font-bold text-xs">Assign</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDelete(inst.id, inst.name)}
                      className="p-2 bg-rose-50 rounded-xl active:bg-rose-100"
                    >
                      <Trash2 color="#e11d48" size={14} />
                    </Pressable>
                  </View>
                </View>

                {/* Assigned Members Chips */}
                {assignedMembers.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-slate-100">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-2">
                      Currently Assigned ({assignedMembers.length})
                    </Text>
                    {assignedMembers.map((member, idx) => {
                      const memberName = member.userName || member?.user?.name || 'Member';
                      const memberId = member.userId || member?.user?.id;
                      return (
                        <View
                          key={idx}
                          className="flex-row items-center justify-between bg-slate-50 p-2.5 rounded-xl mb-1.5"
                        >
                          <View>
                            <Text className="text-slate-800 font-bold text-xs">{memberName}</Text>
                            {member.instrumentNumber && (
                              <Text className="text-slate-400 text-[10px]">
                                Unit #{member.instrumentNumber}
                              </Text>
                            )}
                          </View>
                          <Pressable
                            onPress={() => handleUnassign(inst.id, memberId, memberName)}
                            className="p-1 bg-rose-100 rounded-lg active:bg-rose-200"
                          >
                            <UserX color="#e11d48" size={14} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={createModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Add Instrument</Text>
              <Pressable onPress={() => setCreateModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Instrument Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Puneri Dhol #1"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
            />

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Total Quantity</Text>
            <TextInput
              value={totalCount}
              onChangeText={setTotalCount}
              keyboardType="numeric"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-6"
            />

            <Pressable
              onPress={handleCreate}
              disabled={submitting}
              className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-extrabold text-base">Add to Inventory</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      <Modal visible={Boolean(assignModalInstrument)} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-black text-slate-900">Assign Instrument</Text>
                <Text className="text-slate-500 text-xs">{assignModalInstrument?.name}</Text>
              </View>
              <Pressable onPress={() => setAssignModalInstrument(null)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">Select Member</Text>
              <View className="bg-slate-50 p-2 rounded-2xl mb-4 max-h-48">
                <ScrollView nestedScrollEnabled>
                  {allUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <Pressable
                        key={u.id}
                        onPress={() => setSelectedUserId(u.id)}
                        className={`flex-row items-center justify-between p-2.5 rounded-xl mb-1 ${
                          isSelected ? 'bg-indigo-100' : 'bg-white'
                        }`}
                      >
                        <Text className="text-slate-800 text-xs font-bold">{u.name}</Text>
                        {isSelected && <CheckCircle2 color="#4f46e5" size={16} />}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Unit / Serial Number</Text>
              <TextInput
                value={instrumentNumber}
                onChangeText={setInstrumentNumber}
                placeholder="e.g. 1"
                keyboardType="numeric"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Condition Notes (Optional)</Text>
              <TextInput
                value={assignNotes}
                onChangeText={setAssignNotes}
                placeholder="e.g. Minor scratches, freshly tuned..."
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-6"
              />

              <Pressable
                onPress={handleAssign}
                disabled={assigning}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {assigning ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Confirm Assignment</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
