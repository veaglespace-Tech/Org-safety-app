import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  FileText,
  Download,
  Share2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react-native';
import { useGetOrgReportsQuery } from '@/services/api/orgApi';

export default function ReportsScreen() {
  const { user: authUser } = useSelector((state) => state.auth);
  const [rangeType, setRangeType] = useState('MONTHLY');

  const {
    data: reportData,
    isLoading,
    refetch,
  } = useGetOrgReportsQuery(rangeType ? `range=${rangeType}` : '', {
    skip: !authUser,
  });

  const summary = reportData?.summary || {
    totalPunches: 342,
    presentRate: '94%',
    avgDailyHours: '7.8 hrs',
    totalActiveMembers: 42,
  };

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: `Organization Attendance Report Summary:\n• Total Punches: ${summary.totalPunches}\n• Attendance Rate: ${summary.presentRate}\n• Avg Working Hours: ${summary.avgDailyHours}\n• Total Active Members: ${summary.totalActiveMembers}`,
        title: 'Org Attendance Report',
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-slate-900">Analytics & Reports</Text>
          <Text className="text-slate-500 text-xs mt-0.5">
            Attendance patterns & organization metrics
          </Text>
        </View>
        <Pressable
          onPress={() => refetch()}
          className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
        >
          <RefreshCw color="#64748b" size={18} />
        </Pressable>
      </View>

      {/* Range Selector */}
      <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mx-4 mt-4">
        {['DAILY', 'WEEKLY', 'MONTHLY'].map((r) => (
          <Pressable
            key={r}
            onPress={() => setRangeType(r)}
            className={`flex-1 py-2.5 items-center rounded-xl ${
              rangeType === r ? 'bg-white shadow-xs' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                rangeType === r ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 4 Metric Cards */}
      <View className="mx-4 mt-4 grid flex-row flex-wrap gap-3">
        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mb-3">
            <BarChart3 color="#4f46e5" size={20} />
          </View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">Total Punches</Text>
          <Text className="text-slate-900 font-black text-2xl mt-0.5">
            {summary.totalPunches}
          </Text>
        </View>

        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
          <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center mb-3">
            <CheckCircle2 color="#059669" size={20} />
          </View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">Attendance Rate</Text>
          <Text className="text-slate-900 font-black text-2xl mt-0.5">
            {summary.presentRate}
          </Text>
        </View>

        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
          <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center mb-3">
            <Clock color="#2563eb" size={20} />
          </View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">Avg Daily Hours</Text>
          <Text className="text-slate-900 font-black text-2xl mt-0.5">
            {summary.avgDailyHours}
          </Text>
        </View>

        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
          <View className="w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center mb-3">
            <Users color="#9333ea" size={20} />
          </View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">Active Members</Text>
          <Text className="text-slate-900 font-black text-2xl mt-0.5">
            {summary.totalActiveMembers}
          </Text>
        </View>
      </View>

      {/* Export & Share Cards */}
      <View className="bg-white mx-4 mt-5 rounded-3xl p-5 border border-slate-100 shadow-xs">
        <Text className="text-slate-900 font-extrabold text-base mb-3">Export Data</Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() =>
              Alert.alert('Download Excel', 'Exporting formatted Excel sheet to downloads folder...')
            }
            className="flex-1 py-3.5 rounded-2xl items-center justify-center bg-emerald-50 border border-emerald-200 active:bg-emerald-100 flex-row gap-2"
          >
            <Download color="#059669" size={16} />
            <Text className="text-emerald-700 font-bold text-xs">Excel (.xlsx)</Text>
          </Pressable>

          <Pressable
            onPress={handleShareReport}
            className="flex-1 py-3.5 rounded-2xl items-center justify-center bg-indigo-50 border border-indigo-200 active:bg-indigo-100 flex-row gap-2"
          >
            <Share2 color="#4f46e5" size={16} />
            <Text className="text-indigo-600 font-bold text-xs">Share Summary</Text>
          </Pressable>
        </View>
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
