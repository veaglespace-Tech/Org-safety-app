import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  Settings2,
  Wrench,
  PackageOpen,
} from 'lucide-react-native';

import {
  useGetOrgInstrumentsQuery,
  useCreateOrgInstrumentMutation,
  useAssignOrgInstrumentMutation,
  useUnassignOrgInstrumentMutation,
  useDeleteOrgInstrumentMutation,
  useGetOrgUsersQuery,
} from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';

const CONDITIONS = [
  { label: 'Good', value: 'GOOD' },
  { label: 'Fair', value: 'FAIR' },
  { label: 'Needs Repair', value: 'NEEDS_REPAIR' },
];

export default function AdminInstrumentsScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalInstrument, setAssignModalInstrument] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [totalCount, setTotalCount] = useState('1');
  const [condition, setCondition] = useState('GOOD');

  // Assign form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [instrumentNumber, setInstrumentNumber] = useState('1');
  const [assignNotes, setAssignNotes] = useState('');

  const {
    data: instData,
    isLoading,
    refetch,
  } = useGetOrgInstrumentsQuery(undefined, { skip: !authUser });

  const { data: usersData } = useGetOrgUsersQuery(200, { skip: !authUser });

  const [createInstrument, { isLoading: isSubmitting }] = useCreateOrgInstrumentMutation();
  const [assignInstrument, { isLoading: isAssigning }] = useAssignOrgInstrumentMutation();
  const [unassignInstrument] = useUnassignOrgInstrumentMutation();
  const [deleteInstrument] = useDeleteOrgInstrumentMutation();

  const instruments = useMemo(() => {
    const list = Array.isArray(instData?.items)
      ? instData.items
      : Array.isArray(instData?.data)
      ? instData.data
      : [];
    if (!searchTerm.trim()) return list;
    return list.filter((i: any) => i.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [instData, searchTerm]);

  const allUsers = usersData?.items || [];

  const stats = useMemo(() => {
    let total = 0;
    let assigned = 0;
    instruments.forEach((item: any) => {
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
      await createInstrument({
        name: name.trim(),
        totalCount: parseInt(totalCount, 10) || 1,
        condition,
      }).unwrap();

      Alert.alert('Created', `Instrument "${name}" added.`);
      setCreateModalOpen(false);
      setName('');
      setTotalCount('1');
      setCondition('GOOD');
      refetch();
    } catch (e: any) {
      Alert.alert('Failed', e?.data?.message || 'Could not create instrument.');
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Alert.alert('Required', 'Please select a member to assign to.');
      return;
    }

    try {
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
      setInstrumentNumber('1');
      refetch();
    } catch (e: any) {
      Alert.alert('Assign Failed', e?.data?.message || 'Could not assign instrument.');
    }
  };

  const handleUnassign = (instrumentId: string, userId: string, memberName: string) => {
    Alert.alert('Unassign Instrument', `Unassign this instrument from ${memberName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unassign',
        style: 'destructive',
        onPress: async () => {
          try {
            await unassignInstrument({ instrumentId, userId }).unwrap();
            refetch();
          } catch (e: any) {
            Alert.alert('Error', e?.data?.message || 'Could not unassign instrument.');
          }
        },
      },
    ]);
  };

  const handleDelete = (id: string, instName: string) => {
    Alert.alert('Delete Instrument', `Permanently delete "${instName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInstrument(id).unwrap();
            refetch();
          } catch (e: any) {
            Alert.alert('Error', e?.data?.message || 'Could not delete instrument.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-200 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Inventory</Text>
            <Text className="text-slate-500 font-medium text-xs mt-0.5">
              Manage Dhol, Tasha & Equipment
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setCreateModalOpen(true)}
              className="w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center shadow-md shadow-indigo-500/20 active:bg-indigo-700"
            >
              <Plus color="#ffffff" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => refetch()}
              className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">
          <Search color="#94a3b8" size={16} />
          <TextInput
            placeholder="Search equipment..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 ml-2 text-sm text-slate-800 p-0"
            style={{ paddingVertical: 0 }}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Stat Cards */}
        <View className="flex-row gap-3 mb-5">
          <SurfaceCard className="flex-1 p-3 items-center">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Package size={14} color="#64748b" />
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total
              </Text>
            </View>
            <Text className="text-2xl font-black text-slate-900">{stats.total}</Text>
          </SurfaceCard>
          
          <SurfaceCard className="flex-1 p-3 items-center border-emerald-100">
            <View className="flex-row items-center gap-1.5 mb-1">
              <PackageOpen size={14} color="#059669" />
              <Text className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                Available
              </Text>
            </View>
            <Text className="text-2xl font-black text-emerald-600">{stats.available}</Text>
          </SurfaceCard>

          <SurfaceCard className="flex-1 p-3 items-center border-indigo-100">
            <View className="flex-row items-center gap-1.5 mb-1">
              <UserCheck size={14} color="#4f46e5" />
              <Text className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                Assigned
              </Text>
            </View>
            <Text className="text-2xl font-black text-indigo-600">{stats.assigned}</Text>
          </SurfaceCard>
        </View>

        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading inventory...</Text>
          </View>
        ) : instruments.length === 0 ? (
          <SurfaceCard className="py-16 items-center">
            <Package size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">Inventory Empty</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 px-4">
              Click the plus icon to add instruments.
            </Text>
          </SurfaceCard>
        ) : (
          instruments.map((item: any) => {
            const tot = item.totalCount || item.quantity || 0;
            const assignedList = Array.isArray(item.assignedMembers) ? item.assignedMembers : [];
            const assCount = assignedList.length;
            const avail = Math.max(0, tot - assCount);

            return (
              <SurfaceCard key={item.id} className="mb-4 overflow-hidden border border-slate-200">
                <View className="p-4 border-b border-slate-100">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                        <Package size={24} color="#4f46e5" />
                      </View>
                      <View>
                        <Text className="text-base font-black text-slate-900">{item.name}</Text>
                        <View className="flex-row gap-2 mt-1">
                          <BadgePill
                            label={item.condition || 'GOOD'}
                            variant={item.condition === 'NEEDS_REPAIR' ? 'error' : 'active'}
                            size="sm"
                          />
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.name)}
                      className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100 active:bg-red-100"
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <View className="flex-1 items-center border-r border-slate-200">
                      <Text className="text-xs font-bold text-slate-500 mb-0.5">Total</Text>
                      <Text className="font-black text-slate-900">{tot}</Text>
                    </View>
                    <View className="flex-1 items-center border-r border-slate-200">
                      <Text className="text-xs font-bold text-emerald-600 mb-0.5">Available</Text>
                      <Text className="font-black text-emerald-700">{avail}</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-xs font-bold text-indigo-600 mb-0.5">Assigned</Text>
                      <Text className="font-black text-indigo-700">{assCount}</Text>
                    </View>
                  </View>
                </View>

                {/* Assignments List */}
                {assignedList.length > 0 && (
                  <View className="bg-slate-50 p-4">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Active Assignments
                    </Text>
                    {assignedList.map((am: any, idx: number) => (
                      <View
                        key={idx}
                        className="flex-row items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 mb-2"
                      >
                        <View className="flex-row items-center gap-2 flex-1">
                          <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                            <Text className="text-[10px] font-bold text-blue-700">
                              #{am.instrumentNumber || idx + 1}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-xs font-bold text-slate-800">
                              {am.user?.name || 'Member'}
                            </Text>
                            {am.conditionNotes ? (
                              <Text className="text-[10px] text-slate-500" numberOfLines={1}>
                                Note: {am.conditionNotes}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleUnassign(item.id, am.user?.id, am.user?.name)}
                          className="bg-red-50 p-1.5 rounded-lg active:bg-red-100"
                        >
                          <UserX size={14} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {avail > 0 && (
                  <TouchableOpacity
                    onPress={() => setAssignModalInstrument(item)}
                    className="flex-row items-center justify-center gap-2 bg-indigo-50 py-3 rounded-b-2xl border-t border-indigo-100 active:bg-indigo-100"
                  >
                    <UserCheck size={14} color="#4f46e5" />
                    <Text className="text-indigo-700 font-extrabold text-xs">Assign to Member</Text>
                  </TouchableOpacity>
                )}
              </SurfaceCard>
            );
          })
        )}
      </ScrollView>

      {/* Create Modal */}
      {createModalOpen && (
        <ActionModal
          visible={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Add Instrument"
          subtitle="Register new equipment in inventory"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            <TextInput
              label="Instrument Name"
              required
              placeholder="e.g. Dhol, Tasha"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              label="Total Quantity"
              required
              placeholder="e.g. 5"
              value={totalCount}
              onChangeText={setTotalCount}
              keyboardType="numeric"
            />

            <View className="mb-5">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Condition</Text>
              <View className="flex-row flex-wrap gap-2">
                {CONDITIONS.map((c) => {
                  const isSelected = condition === c.value;
                  return (
                    <TouchableOpacity
                      key={c.value}
                      onPress={() => setCondition(c.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Button
              onPress={handleCreate}
              isLoading={isSubmitting}
              size="lg"
              className="bg-indigo-600 rounded-2xl shadow-md shadow-indigo-500/20 mb-4"
            >
              <Text className="text-white font-extrabold text-sm text-center">Add to Inventory</Text>
            </Button>
          </ScrollView>
        </ActionModal>
      )}

      {/* Assign Modal */}
      {assignModalInstrument && (
        <ActionModal
          visible={Boolean(assignModalInstrument)}
          onClose={() => setAssignModalInstrument(null)}
          title="Assign Instrument"
          subtitle={`Assigning ${assignModalInstrument.name}`}
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Select Member</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {allUsers.map((u: any) => {
                  const isSelected = selectedUserId === u.id;
                  return (
                    <TouchableOpacity
                      key={u.id}
                      onPress={() => setSelectedUserId(u.id)}
                      className={`mr-2 px-4 py-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {u.name}
                      </Text>
                      <Text
                        className={`text-[10px] ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {u.role || 'MEMBER'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TextInput
              label="Instrument Number / Asset ID (Optional)"
              placeholder="e.g. 1"
              value={instrumentNumber}
              onChangeText={setInstrumentNumber}
              keyboardType="numeric"
            />

            <TextInput
              label="Condition Notes (Optional)"
              placeholder="e.g. Scratched rim"
              value={assignNotes}
              onChangeText={setAssignNotes}
              multiline
            />

            <Button
              onPress={handleAssign}
              isLoading={isAssigning}
              size="lg"
              className="bg-indigo-600 rounded-2xl shadow-md shadow-indigo-500/20 mb-4 mt-2"
            >
              <Text className="text-white font-extrabold text-sm text-center">Assign to Member</Text>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
