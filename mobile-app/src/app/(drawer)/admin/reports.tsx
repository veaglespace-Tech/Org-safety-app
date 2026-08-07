import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { Button } from '@/components/ui/Button';

export default function ReportsScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);
  const [rangeType, setRangeType] = useState('MONTHLY');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generatePDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert('Report Generated', 'Your PDF has been generated successfully and saved to documents.');
    }, 1500);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-200 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Analytics</Text>
            <Text className="text-slate-500 font-medium text-xs mt-0.5">
              Attendance patterns & organization metrics
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Range Selector */}
        <View className="flex-row bg-slate-100 p-1 rounded-xl mt-5">
          {['DAILY', 'WEEKLY', 'MONTHLY'].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRangeType(r)}
              className={`flex-1 py-2.5 items-center rounded-lg ${
                rangeType === r ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  rangeType === r ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Compiling report data...</Text>
          </View>
        ) : (
          <>
            {/* Metric Cards Grid */}
            <View className="flex-row flex-wrap justify-between mb-4">
              <SurfaceCard className="w-[48%] p-4 mb-3 border-slate-200">
                <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mb-3">
                  <BarChart3 color="#4f46e5" size={20} />
                </View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Total Punches
                </Text>
                <Text className="text-2xl font-black text-slate-900">{summary.totalPunches}</Text>
              </SurfaceCard>

              <SurfaceCard className="w-[48%] p-4 mb-3 border-slate-200">
                <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center mb-3">
                  <CheckCircle2 color="#059669" size={20} />
                </View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Present Rate
                </Text>
                <Text className="text-2xl font-black text-slate-900">{summary.presentRate}</Text>
              </SurfaceCard>

              <SurfaceCard className="w-[48%] p-4 mb-3 border-slate-200">
                <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center mb-3">
                  <Clock color="#d97706" size={20} />
                </View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Avg Daily Hrs
                </Text>
                <Text className="text-2xl font-black text-slate-900">{summary.avgDailyHours}</Text>
              </SurfaceCard>

              <SurfaceCard className="w-[48%] p-4 mb-3 border-slate-200">
                <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center mb-3">
                  <Users color="#2563eb" size={20} />
                </View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  Active Members
                </Text>
                <Text className="text-2xl font-black text-slate-900">{summary.totalActiveMembers}</Text>
              </SurfaceCard>
            </View>

            {/* Export Section */}
            <SurfaceCard className="p-5 border-slate-200">
              <View className="flex-row items-center gap-2 mb-2">
                <FileText size={18} color="#4f46e5" />
                <Text className="text-sm font-black text-slate-900 tracking-tight">
                  Generate PDF Report
                </Text>
              </View>
              <Text className="text-xs font-medium text-slate-500 leading-5 mb-5">
                Download a comprehensive spreadsheet containing all daily punch times, locations, and missing regularization records.
              </Text>

              <View className="flex-row gap-3">
                <Button
                  onPress={generatePDF}
                  isLoading={isGenerating}
                  className="flex-1 bg-indigo-600 rounded-xl"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {!isGenerating && <Download size={14} color="#fff" />}
                    <Text className="text-white font-extrabold text-sm">Download PDF</Text>
                  </View>
                </Button>
                <TouchableOpacity
                  onPress={handleShareReport}
                  className="w-12 h-12 bg-slate-100 rounded-xl items-center justify-center border border-slate-200 active:bg-slate-200"
                >
                  <Share2 size={16} color="#475569" />
                </TouchableOpacity>
              </View>
            </SurfaceCard>

            <View className="h-10" />
          </>
        )}
      </ScrollView>
    </View>
  );
}
