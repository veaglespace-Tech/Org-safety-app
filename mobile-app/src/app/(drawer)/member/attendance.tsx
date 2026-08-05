import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  MapPin,
  Clock,
  Home,
  FileWarning,
  RefreshCw,
  Camera,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import {
  useGetMemberAttendanceQuery,
  useGetMemberDashboardQuery,
} from '@/services/api/memberApi';
import {
  usePunchInMutation,
  usePunchOutMutation,
  useReachedHomeMutation,
  useRequestRegularizationMutation,
} from '@/services/api/attendanceApi';
import { getCurrentCoordinates } from '@/utils/location';
import { getTodayDateKey, getDateKey } from '@/utils/date';
import { formatHoursValue } from '@/utils/time';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateOnly = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function MemberAttendanceScreen() {
  const { user } = useSelector((state) => state.auth);
  const [filterType, setFilterType] = useState('ALL');
  const [actionLoading, setActionLoading] = useState('');
  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);

  // Regularize Form State
  const [regDate, setRegDate] = useState(getTodayDateKey());
  const [regPunchIn, setRegPunchIn] = useState('09:00');
  const [regPunchOut, setRegPunchOut] = useState('18:00');
  const [regReason, setRegReason] = useState('');
  const [regProofBase64, setRegProofBase64] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  const queryParams = useMemo(() => {
    const today = new Date();
    if (filterType === 'DAILY') {
      const d = getTodayDateKey();
      return { from: d, to: d, limit: 100 };
    }
    if (filterType === 'WEEKLY') {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 6);
      return { from: getDateKey(fromDate), to: getTodayDateKey(), limit: 100 };
    }
    if (filterType === 'MONTHLY') {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 29);
      return { from: getDateKey(fromDate), to: getTodayDateKey(), limit: 100 };
    }
    return { limit: 100 };
  }, [filterType]);

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useGetMemberAttendanceQuery(queryParams, { skip: !user });

  const {
    data: dashboardData,
    refetch: refetchDashboard,
  } = useGetMemberDashboardQuery(undefined, { skip: !user });

  const [punchInMutation] = usePunchInMutation();
  const [punchOutMutation] = usePunchOutMutation();
  const [reachedHomeMutation] = useReachedHomeMutation();
  const [requestRegularizationMutation] = useRequestRegularizationMutation();

  const records = useMemo(() => {
    return Array.isArray(attendanceData?.items) ? attendanceData.items : [];
  }, [attendanceData]);

  const todayKey = getTodayDateKey();
  const todayRecord = useMemo(() => {
    return records.find((r) => String(r.date) === todayKey) || null;
  }, [records, todayKey]);

  const canPunchIn = !todayRecord?.punchInAt;
  const canPunchOut = Boolean(todayRecord?.punchInAt) && !todayRecord?.punchOutAt;
  const canReachedHome = Boolean(todayRecord?.punchOutAt) && !todayRecord?.reachedHomeAt;

  const workedHoursStr = useMemo(() => {
    if (!todayRecord) return '-';
    return formatHoursValue(todayRecord?.workedHours ?? todayRecord?.workedMinutes, {
      fromMinutes: todayRecord?.workedHours == null,
    });
  }, [todayRecord]);

  const handleRefresh = async () => {
    await Promise.all([refetchAttendance(), refetchDashboard()]);
  };

  const takeSelfieProof = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Camera access is required for attendance selfie verification.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    }
    return null;
  };

  const handlePunchAction = async (type) => {
    try {
      setActionLoading(type);

      // 1. Get GPS coordinates
      let coordinates;
      try {
        coordinates = await getCurrentCoordinates();
      } catch (locErr) {
        Alert.alert('Location Error', locErr?.message || 'Could not acquire GPS location.');
        setActionLoading('');
        return;
      }

      const locationPayload = {
        inputFormat: 'NEW2',
        mode: 'AUTO',
        source: 'DEVICE_GPS',
        displayText: `${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}`,
        coordinates,
      };

      // 2. Selfie capture for Punch In and Punch Out
      let selfieImageDataUrl = null;
      if (type === 'in' || type === 'out') {
        selfieImageDataUrl = await takeSelfieProof();
        if (!selfieImageDataUrl) {
          Alert.alert('Action Cancelled', 'Selfie proof is required for attendance verification.');
          setActionLoading('');
          return;
        }
      }

      // 3. Execute Mutation
      if (type === 'in') {
        await punchInMutation({
          userLocation: coordinates,
          location: locationPayload,
          selfieImageDataUrl,
        }).unwrap();
        Alert.alert('Success', 'Punch In successful!');
      } else if (type === 'out') {
        await punchOutMutation({
          userLocation: coordinates,
          location: locationPayload,
          selfieImageDataUrl,
        }).unwrap();
        Alert.alert('Success', 'Punch Out successful!');
      } else if (type === 'home') {
        await reachedHomeMutation({
          userLocation: coordinates,
          location: locationPayload,
        }).unwrap();
        Alert.alert('Success', 'Reached Home marked successfully!');
      }

      await handleRefresh();
    } catch (err) {
      Alert.alert('Attendance Failed', err?.data?.message || err?.message || 'Action could not be completed.');
    } finally {
      setActionLoading('');
    }
  };

  const pickProofForRegularization = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setRegProofBase64(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const submitRegularization = async () => {
    if (!regDate || !regPunchIn || !regPunchOut || !regReason.trim()) {
      Alert.alert('Incomplete Form', 'Please provide date, punch times, and reason.');
      return;
    }
    setSubmittingReg(true);
    try {
      await requestRegularizationMutation({
        date: regDate,
        punchInTime: regPunchIn,
        punchOutTime: regPunchOut,
        reason: regReason,
        proofImageDataUrl: regProofBase64 || undefined,
      }).unwrap();
      Alert.alert('Request Submitted', 'Your regularization request has been submitted to your Admin.');
      setRegularizeModalOpen(false);
      setRegReason('');
      setRegProofBase64('');
      await handleRefresh();
    } catch (err) {
      Alert.alert('Submission Failed', err?.data?.message || 'Could not submit regularization request.');
    } finally {
      setSubmittingReg(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Top Header Card */}
      <View className="bg-indigo-600 mx-4 mt-4 rounded-3xl p-6 shadow-md">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/80 text-xs font-bold uppercase tracking-wider">Attendance Status</Text>
            <Text className="text-white text-2xl font-black mt-1">
              {todayRecord?.status || (canPunchIn ? 'Not Punched In' : 'Completed')}
            </Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            className="p-2.5 bg-white/20 rounded-xl active:bg-white/30"
          >
            <RefreshCw color="#ffffff" size={20} />
          </Pressable>
        </View>

        {/* 3 Metric Cards */}
        <View className="flex-row mt-6 gap-2">
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <Clock color="#cbd5e1" size={16} />
            <Text className="text-white/70 text-[10px] uppercase font-bold mt-1">Punch In</Text>
            <Text className="text-white font-extrabold text-xs mt-0.5">
              {formatDateTime(todayRecord?.punchInAt)}
            </Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <Clock color="#cbd5e1" size={16} />
            <Text className="text-white/70 text-[10px] uppercase font-bold mt-1">Punch Out</Text>
            <Text className="text-white font-extrabold text-xs mt-0.5">
              {formatDateTime(todayRecord?.punchOutAt)}
            </Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <ShieldCheck color="#cbd5e1" size={16} />
            <Text className="text-white/70 text-[10px] uppercase font-bold mt-1">Worked</Text>
            <Text className="text-white font-extrabold text-xs mt-0.5">{workedHoursStr}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mx-4 mt-4">
        <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2 ml-1">
          Attendance Actions
        </Text>

        <View className="flex-row gap-3">
          {/* Punch In */}
          <Pressable
            onPress={() => handlePunchAction('in')}
            disabled={!canPunchIn || actionLoading !== ''}
            className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-sm flex-row gap-2 ${
              canPunchIn ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-200'
            }`}
          >
            {actionLoading === 'in' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Camera color={canPunchIn ? '#fff' : '#94a3b8'} size={18} />
                <Text className={`font-bold text-sm ${canPunchIn ? 'text-white' : 'text-slate-400'}`}>
                  Punch In
                </Text>
              </>
            )}
          </Pressable>

          {/* Punch Out */}
          <Pressable
            onPress={() => handlePunchAction('out')}
            disabled={!canPunchOut || actionLoading !== ''}
            className={`flex-1 py-4 rounded-2xl items-center justify-center shadow-sm flex-row gap-2 ${
              canPunchOut ? 'bg-rose-600 active:bg-rose-700' : 'bg-slate-200'
            }`}
          >
            {actionLoading === 'out' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Camera color={canPunchOut ? '#fff' : '#94a3b8'} size={18} />
                <Text className={`font-bold text-sm ${canPunchOut ? 'text-white' : 'text-slate-400'}`}>
                  Punch Out
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Reached Home & Regularization Row */}
        <View className="flex-row gap-3 mt-3">
          <Pressable
            onPress={() => handlePunchAction('home')}
            disabled={!canReachedHome || actionLoading !== ''}
            className={`flex-1 py-3.5 rounded-2xl items-center justify-center border flex-row gap-2 ${
              canReachedHome
                ? 'bg-blue-50 border-blue-200 active:bg-blue-100'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {actionLoading === 'home' ? (
              <ActivityIndicator color="#2563eb" size="small" />
            ) : (
              <>
                <Home color={canReachedHome ? '#2563eb' : '#94a3b8'} size={16} />
                <Text
                  className={`font-bold text-xs ${canReachedHome ? 'text-blue-700' : 'text-slate-400'}`}
                >
                  Reached Home
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => setRegularizeModalOpen(true)}
            className="flex-1 py-3.5 rounded-2xl items-center justify-center bg-amber-50 border border-amber-200 flex-row gap-2 active:bg-amber-100"
          >
            <FileWarning color="#d97706" size={16} />
            <Text className="text-amber-700 font-bold text-xs">Request Regularize</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="mx-4 mt-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 font-bold text-base">Attendance History</Text>
          <Text className="text-slate-400 text-xs font-semibold">{records.length} logs</Text>
        </View>

        <View className="flex-row bg-slate-200/70 p-1 rounded-xl">
          {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setFilterType(tab)}
              className={`flex-1 py-2 items-center rounded-lg ${
                filterType === tab ? 'bg-white shadow-xs' : ''
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filterType === tab ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Logs List */}
      <View className="mx-4 mt-3 mb-10 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {attendanceLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading logs...</Text>
          </View>
        ) : records.length === 0 ? (
          <View className="py-12 items-center">
            <Calendar color="#cbd5e1" size={36} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No attendance records found</Text>
          </View>
        ) : (
          records.map((item, idx) => {
            const isPresent = item?.status === 'PRESENT';
            return (
              <View
                key={item?.id || idx}
                className="flex-row items-center px-4 py-3.5 border-b border-slate-100 justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center ${
                      isPresent ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}
                  >
                    {isPresent ? (
                      <CheckCircle2 color="#059669" size={18} />
                    ) : (
                      <XCircle color="#64748b" size={18} />
                    )}
                  </View>
                  <View>
                    <Text className="text-slate-900 font-bold text-sm">
                      {formatDateOnly(item?.date)}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      In: {formatDateTime(item?.punchInAt)} • Out: {formatDateTime(item?.punchOutAt)}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <View
                    className={`px-2 py-0.5 rounded-md ${
                      isPresent ? 'bg-emerald-50' : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-extrabold uppercase ${
                        isPresent ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {item?.status || 'ABSENT'}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-[10px] mt-1">
                    {formatHoursValue(item?.workedHours ?? item?.workedMinutes, {
                      fromMinutes: item?.workedHours == null,
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Regularization Modal */}
      <Modal visible={regularizeModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Request Regularization</Text>
              <Pressable onPress={() => setRegularizeModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-base">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Date (YYYY-MM-DD)</Text>
              <TextInput
                value={regDate}
                onChangeText={setRegDate}
                placeholder="2026-08-03"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Punch In Time</Text>
                  <TextInput
                    value={regPunchIn}
                    onChangeText={setRegPunchIn}
                    placeholder="09:00"
                    className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Punch Out Time</Text>
                  <TextInput
                    value={regPunchOut}
                    onChangeText={setRegPunchOut}
                    placeholder="18:00"
                    className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium"
                  />
                </View>
              </View>

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Reason / Notes</Text>
              <TextInput
                value={regReason}
                onChangeText={setRegReason}
                placeholder="Explain why punch was missed..."
                multiline
                numberOfLines={3}
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3 h-20"
                textAlignVertical="top"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Proof Attachment (Optional)</Text>
              <Pressable
                onPress={pickProofForRegularization}
                className="bg-slate-100 border border-dashed border-slate-300 rounded-xl p-4 items-center justify-center mb-6"
              >
                {regProofBase64 ? (
                  <View className="items-center">
                    <CheckCircle2 color="#059669" size={24} />
                    <Text className="text-emerald-700 font-bold text-xs mt-1">Proof Image Attached</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Camera color="#94a3b8" size={24} />
                    <Text className="text-slate-500 font-bold text-xs mt-1">Tap to select photo</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={submitRegularization}
                disabled={submittingReg}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {submittingReg ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Submit Request</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
