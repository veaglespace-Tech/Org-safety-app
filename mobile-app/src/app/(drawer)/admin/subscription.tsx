import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Crown,
  CheckCircle2,
  Users,
  Shield,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';
import { useGetOrgSubscriptionQuery } from '@/services/api/orgApi';

export default function SubscriptionScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const {
    data: subData,
    isLoading,
    refetch,
  } = useGetOrgSubscriptionQuery(undefined, { skip: !authUser });

  const plan = subData?.plan || {
    name: 'Pro Organization Plan',
    status: 'ACTIVE',
    daysRemaining: 180,
    memberLimit: 150,
    currentMembers: 42,
    features: [
      'Unlimited Attendance & Geofencing',
      'Instant "तिची सुरक्षा" SOS Emergency System',
      'Interactive Feeds & Real-time Polls',
      'Instruments & Inventory Management',
      'ERP Funds, Expenses & Claims',
      'Granular Role-based Permissions',
    ],
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header Banner */}
      <View className="bg-slate-900 mx-4 mt-4 rounded-3xl p-6 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-amber-400/20 items-center justify-center">
              <Crown color="#f59e0b" size={24} />
            </View>
            <View>
              <Text className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Current Plan
              </Text>
              <Text className="text-white text-xl font-black">{plan.name}</Text>
            </View>
          </View>

          <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
            <Text className="text-emerald-400 font-extrabold text-xs">
              {plan.status || 'ACTIVE'}
            </Text>
          </View>
        </View>

        {/* Expiry countdown */}
        <View className="flex-row items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <Clock color="#94a3b8" size={16} />
          <Text className="text-slate-300 text-xs font-semibold">
            {plan.daysRemaining ? `${plan.daysRemaining} days remaining in subscription` : 'Active'}
          </Text>
        </View>
      </View>

      {/* Usage Limits Card */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-slate-100 shadow-xs">
        <Text className="text-slate-900 font-extrabold text-base mb-3">Resource Usage</Text>

        <View className="mb-2">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-slate-600 text-xs font-semibold">Organization Members</Text>
            <Text className="text-slate-900 text-xs font-bold">
              {plan.currentMembers || 0} / {plan.memberLimit || 100}
            </Text>
          </View>
          <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-600 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  ((plan.currentMembers || 0) / (plan.memberLimit || 100)) * 100
                )}%`,
              }}
            />
          </View>
        </View>
      </View>

      {/* Plan Features Included */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-5 border border-slate-100 shadow-xs">
        <Text className="text-slate-900 font-extrabold text-base mb-4">Included Plan Features</Text>

        <View className="space-y-3">
          {(plan.features || []).map((feat, idx) => (
            <View key={idx} className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center">
                <CheckCircle2 color="#059669" size={14} />
              </View>
              <Text className="text-slate-700 text-xs font-semibold flex-1">{feat}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upgrade CTA */}
      <View className="mx-4 mt-6 mb-12">
        <Pressable
          onPress={() =>
            Alert.alert('Upgrade Plan', 'To upgrade your organization plan, contact support or visit the web portal.')
          }
          className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 flex-row gap-2"
        >
          <Sparkles color="#fff" size={18} />
          <Text className="text-white font-extrabold text-base">Upgrade / Renew Plan</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
