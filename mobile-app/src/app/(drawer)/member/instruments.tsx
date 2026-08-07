import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Package,
  ShieldCheck,
  RefreshCw,
  Clock,
  Settings2,
} from 'lucide-react-native';
import { useGetOrgInstrumentsQuery } from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';

const formatDateTime = (value: any) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function MemberInstrumentsScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const {
    data: instData,
    isLoading,
    refetch,
  } = useGetOrgInstrumentsQuery(undefined, { skip: !authUser });

  const assignedToMe = useMemo(() => {
    const list = Array.isArray(instData?.items)
      ? instData.items
      : Array.isArray(instData?.data)
      ? instData.data
      : [];

    const myItems: any[] = [];
    list.forEach((inst: any) => {
      const assigned = Array.isArray(inst.assignedMembers) ? inst.assignedMembers : [];
      assigned.forEach((member: any) => {
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
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-200 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">My Equipment</Text>
            <Text className="text-slate-500 font-medium text-xs mt-0.5">
              Instruments currently in your custody
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Checking assignments...</Text>
          </View>
        ) : assignedToMe.length === 0 ? (
          <SurfaceCard className="py-16 items-center">
            <Package color="#cbd5e1" size={48} />
            <Text className="text-slate-700 font-bold text-base mt-3">No active assignments</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 px-4">
              You haven't been assigned any instruments by the admins yet.
            </Text>
          </SurfaceCard>
        ) : (
          assignedToMe.map((item: any, idx: number) => (
            <SurfaceCard key={idx} className="mb-4 overflow-hidden border border-slate-200">
              <View className="p-4 border-b border-slate-100">
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                      <Package size={24} color="#4f46e5" />
                    </View>
                    <View>
                      <Text className="text-base font-black text-slate-900">
                        {item.instrumentName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <BadgePill
                          label={`#${item.instrumentNumber || '1'}`}
                          variant="primary"
                          size="sm"
                        />
                        <BadgePill
                          label="ASSIGNED"
                          variant="active"
                          size="sm"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View className="bg-slate-50 p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Settings2 size={14} color="#64748b" />
                    <Text className="text-xs font-bold text-slate-500">Global Condition:</Text>
                  </View>
                  <Text className={`text-xs font-extrabold ${item.condition === 'NEEDS_REPAIR' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {item.condition}
                  </Text>
                </View>

                {item.conditionNotes ? (
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <ShieldCheck size={14} color="#64748b" />
                      <Text className="text-xs font-bold text-slate-500">Assignment Note:</Text>
                    </View>
                    <Text className="text-xs font-extrabold text-slate-900">{item.conditionNotes}</Text>
                  </View>
                ) : null}

                {item.assignedAt && (
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-200">
                    <View className="flex-row items-center gap-2">
                      <Clock size={14} color="#64748b" />
                      <Text className="text-xs font-bold text-slate-500">Date Issued:</Text>
                    </View>
                    <Text className="text-xs font-extrabold text-slate-900">
                      {formatDateTime(item.assignedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </SurfaceCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
