import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Package,
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react-native';
import { useGetOrgInstrumentsQuery } from '@/services/api/orgApi';

export default function MemberInstrumentsScreen() {
  const { user: authUser } = useSelector((state) => state.auth);

  const {
    data: instData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrgInstrumentsQuery(undefined, { skip: !authUser });

  const assignedToMe = useMemo(() => {
    const list = Array.isArray(instData?.items)
      ? instData.items
      : Array.isArray(instData?.data)
      ? instData.data
      : [];

    const myItems = [];
    list.forEach((inst) => {
      const assigned = Array.isArray(inst.assignedMembers) ? inst.assignedMembers : [];
      assigned.forEach((member) => {
        const memberId = member.userId || member?.user?.id;
        if (String(memberId) === String(authUser?.id)) {
          myItems.push({
            instrumentName: inst.name,
            instrumentId: inst.id,
            condition: inst.condition || 'GOOD',
            instrumentNumber: member.instrumentNumber,
            conditionNotes: member.conditionNotes,
            assignedAt: member.assignedAt,
          });
        }
      });
    });
    return myItems;
  }, [instData, authUser]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-slate-900">My Assigned Instruments</Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            Equipment currently in your custody
          </Text>
        </View>
        <Pressable
          onPress={() => refetch()}
          className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
        >
          <RefreshCw color="#64748b" size={18} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Checking assignments...</Text>
          </View>
        ) : assignedToMe.length === 0 ? (
          <View className="py-16 items-center">
            <Package color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">
              No instruments currently assigned to you
            </Text>
          </View>
        ) : (
          assignedToMe.map((item, idx) => (
            <View
              key={idx}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-900 font-extrabold text-lg flex-1 mr-2" numberOfLines={1}>
                  {item.instrumentName}
                </Text>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Text className="text-emerald-700 text-xs font-bold">
                    Unit #{item.instrumentNumber || '1'}
                  </Text>
                </View>
              </View>

              {item.conditionNotes ? (
                <Text className="text-slate-500 text-xs mb-3 italic">
                  Note: "{item.conditionNotes}"
                </Text>
              ) : null}

              <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                <View className="flex-row items-center gap-1.5">
                  <ShieldCheck color="#059669" size={16} />
                  <Text className="text-slate-700 text-xs font-bold">Assigned to You</Text>
                </View>
                {item.assignedAt && (
                  <Text className="text-slate-400 text-[10px]">
                    {new Date(item.assignedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
