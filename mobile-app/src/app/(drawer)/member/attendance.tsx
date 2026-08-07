import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileWarning,
} from 'lucide-react-native';

import {
  useGetMemberAttendanceQuery,
  useGetMemberDashboardQuery,
} from '@/services/api/memberApi';
import {
  usePunchInMutation,
  usePunchOutMutation,
  useRequestRegularizationMutation,
} from '@/services/api/attendanceApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { formatHoursValue } from '@/utils/time';

const formatDateTime = (value: any) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateOnly = (value: any) => {
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
  const { user } = useSelector((state: any) => state.auth);

  // Queries
  const { data: dashboardData, refetch: refetchDash } = useGetMemberDashboardQuery(undefined, {
    skip: !user,
  });
  const { data: attendanceData, isLoading: logsLoading, refetch: refetchLogs } =
    useGetMemberAttendanceQuery({ limit: 50 }, { skip: !user });

  // Mutations
  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();
  const [requestReg, { isLoading: isSubmittingReg }] = useRequestRegularizationMutation();

  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regInTime, setRegInTime] = useState('');
  const [regOutTime, setRegOutTime] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regProofBase64, setRegProofBase64] = useState('');

  const todayStatus = dashboardData?.todayStatus || 'NOT_PUNCHED_IN';
  const records = useMemo(() => {
    return Array.isArray(attendanceData?.items) ? attendanceData.items : [];
  }, [attendanceData]);

  const handleRefresh = async () => {
    await Promise.all([refetchDash(), refetchLogs()]);
  };

  const handleLivePunchAction = async (type: 'IN' | 'OUT') => {
    try {
      // 1. Check Camera Permission
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed for selfie verification.');
        return;
      }

      // 2. Check Location Permission
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.status !== 'granted') {
        Alert.alert('Permission Required', 'GPS permission is needed to verify geofence.');
        return;
      }

      // 3. Capture Selfie
      const photo = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (photo.canceled || !photo.assets?.[0]?.base64) return;
      const base64Image = `data:image/jpeg;base64,${photo.assets[0].base64}`;

      // 4. Capture GPS Coordinates
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      // 5. Fire appropriate mutation
      if (type === 'IN') {
        await punchIn({
          latitude: lat,
          longitude: lng,
          selfieBase64: base64Image,
        }).unwrap();
        Alert.alert('Success', 'Punched In Successfully! Have a great session.');
      } else {
        await punchOut({
          latitude: lat,
          longitude: lng,
          selfieBase64: base64Image,
        }).unwrap();
        Alert.alert('Success', 'Punched Out Successfully! See you next time.');
      }

      handleRefresh();
    } catch (err: any) {
      console.error('Punch action failed:', err);
      Alert.alert(
        'Punch Failed',
        err?.data?.message || err?.message || `Failed to punch ${type.toLowerCase()}.`
      );
    }
  };

  const pickRegularizationProof = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed for proof upload.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setRegProofBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleRegularizeSubmit = async () => {
    if (!regDate || !regInTime || !regOutTime || !regReason) {
      Alert.alert('Validation Error', 'Please fill out all required fields.');
      return;
    }

    try {
      // Minimal naive date string combination
      // Expected backend format might vary, fallback to ISO strings
      const dateStr = regDate; // Format: YYYY-MM-DD
      const checkInISO = new Date(`${dateStr}T${regInTime}:00`).toISOString();
      const checkOutISO = new Date(`${dateStr}T${regOutTime}:00`).toISOString();

      await requestReg({
        date: dateStr,
        requestedCheckIn: checkInISO,
        requestedCheckOut: checkOutISO,
        reason: regReason,
        proofBase64: regProofBase64 || undefined,
      }).unwrap();

      Alert.alert('Submitted', 'Attendance regularization request sent to admin.');
      setRegularizeModalOpen(false);
      setRegDate('');
      setRegInTime('');
      setRegOutTime('');
      setRegReason('');
      setRegProofBase64('');
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.data?.message || 'Could not send request.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">
              Live Attendance
            </Text>
            <Text className="text-slate-400 font-medium text-xs mt-0.5">
              Punch in via GPS & Selfie
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Punch Action Card */}
        <SurfaceCard variant="glass" className="p-6 mb-6 bg-indigo-600 border-indigo-500 overflow-hidden relative">
          <View className="absolute -top-6 -right-6 opacity-10">
            <Zap size={120} color="#ffffff" />
          </View>
          
          <View className="relative z-10">
            <View className="flex-row items-center gap-2 mb-3">
              <ShieldCheck size={20} color="#6ee7b7" />
              <Text className="text-emerald-300 font-bold text-xs uppercase tracking-widest">
                Geofence Active
              </Text>
            </View>

            {todayStatus === 'NOT_PUNCHED_IN' ? (
              <View>
                <Text className="text-3xl font-black text-white mb-1 tracking-tight">Ready to Start?</Text>
                <Text className="text-indigo-200 text-sm font-medium mb-6 leading-5">
                  Make sure you are within the practice geofence and camera ready.
                </Text>
                <TouchableOpacity
                  onPress={() => handleLivePunchAction('IN')}
                  disabled={isPunchingIn || isPunchingOut}
                  className="bg-emerald-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  {isPunchingIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Camera size={18} color="#fff" />
                  )}
                  <Text className="text-white font-extrabold text-sm">
                    Capture Selfie & Punch IN
                  </Text>
                </TouchableOpacity>
              </View>
            ) : todayStatus === 'PUNCHED_IN' ? (
              <View>
                <Text className="text-3xl font-black text-white mb-1 tracking-tight">Shift Active</Text>
                <Text className="text-indigo-200 text-sm font-medium mb-6 leading-5">
                  You are currently punched in. Great work today!
                </Text>
                <TouchableOpacity
                  onPress={() => handleLivePunchAction('OUT')}
                  disabled={isPunchingIn || isPunchingOut}
                  className="bg-rose-500 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-rose-500/30"
                >
                  {isPunchingOut ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Camera size={18} color="#fff" />
                  )}
                  <Text className="text-white font-extrabold text-sm">
                    Capture Selfie & Punch OUT
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="py-2">
                <Text className="text-3xl font-black text-white mb-1 tracking-tight">Completed</Text>
                <Text className="text-indigo-200 text-sm font-medium mb-4 leading-5">
                  You have successfully completed your attendance for today.
                </Text>
                <View className="flex-row items-center gap-2 bg-indigo-500/40 px-3 py-2 rounded-xl self-start">
                  <CheckCircle2 size={16} color="#6ee7b7" />
                  <Text className="text-white font-bold text-xs">Attendance Logged</Text>
                </View>
              </View>
            )}
          </View>
        </SurfaceCard>

        {/* Dispute / Regularization Strip */}
        <View className="flex-row items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center gap-1.5 mb-1">
              <FileWarning size={16} color="#d97706" />
              <Text className="font-extrabold text-amber-900 text-sm">Missed a Punch?</Text>
            </View>
            <Text className="text-amber-700/80 text-xs font-medium">
              Submit a regularization request if you missed marking attendance.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setRegularizeModalOpen(true)}
            className="bg-white px-3 py-2 rounded-xl shadow-sm border border-amber-200 active:bg-slate-50"
          >
            <Text className="text-amber-700 font-bold text-[11px]">Request</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance History */}
        <Text className="text-base font-extrabold text-slate-900 mb-3 ml-1">My Attendance History</Text>
        
        {logsLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : records.length === 0 ? (
          <SurfaceCard className="py-10 items-center">
            <Calendar size={40} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-sm mt-3">No history found</Text>
            <Text className="text-slate-400 text-[11px] mt-1 text-center px-4">
              Your attendance records will appear here once you punch in.
            </Text>
          </SurfaceCard>
        ) : (
          records.map((log: any, idx: number) => {
            const punchInTime = log?.punchIn || log?.checkInTime;
            const punchOutTime = log?.punchOut || log?.checkOutTime;
            
            return (
              <SurfaceCard key={log?.id || idx} className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 items-center justify-center">
                      <Calendar size={14} color="#2563eb" />
                    </View>
                    <Text className="font-extrabold text-slate-900 text-sm">
                      {formatDateOnly(log?.date || punchInTime)}
                    </Text>
                  </View>
                  <BadgePill
                    label={punchOutTime ? 'COMPLETED' : punchInTime ? 'ACTIVE' : 'LOGGED'}
                    variant={punchOutTime ? 'active' : 'primary'}
                    size="sm"
                  />
                </View>

                <View className="flex-row justify-between items-center px-1">
                  <View>
                    <View className="flex-row items-center gap-1 mb-0.5">
                      <Clock size={10} color="#94a3b8" />
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Check In
                      </Text>
                    </View>
                    <Text className="text-xs font-black text-slate-800">
                      {formatDateTime(punchInTime)}
                    </Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1 mb-0.5">
                      <Clock size={10} color="#94a3b8" />
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Check Out
                      </Text>
                    </View>
                    <Text className="text-xs font-black text-slate-800">
                      {formatDateTime(punchOutTime)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Duration
                    </Text>
                    <Text className="text-xs font-black text-emerald-600">
                      {formatHoursValue(log?.workedHours || log?.workedMinutes, {
                        fromMinutes: log?.workedHours == null,
                      })}
                    </Text>
                  </View>
                </View>

                {log?.punchInValid !== undefined && (
                  <View className="mt-3 bg-slate-50 p-2 rounded-lg flex-row items-center justify-between border border-slate-100">
                    <Text className="text-[10px] font-bold text-slate-500">Geofence Status</Text>
                    <View className="flex-row items-center gap-1">
                      {log.punchInValid ? (
                        <>
                          <CheckCircle2 size={12} color="#059669" />
                          <Text className="text-[10px] font-bold text-emerald-700">Verified inside</Text>
                        </>
                      ) : (
                        <>
                          <MapPin size={12} color="#ef4444" />
                          <Text className="text-[10px] font-bold text-rose-600">Outside range</Text>
                        </>
                      )}
                    </View>
                  </View>
                )}
              </SurfaceCard>
            );
          })
        )}
      </ScrollView>

      {/* Regularization Modal */}
      {regularizeModalOpen && (
        <ActionModal
          visible={regularizeModalOpen}
          onClose={() => setRegularizeModalOpen(false)}
          title="Attendance Regularization"
          subtitle="Submit missed punch times for admin approval"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            <TextInput
              label="Date (YYYY-MM-DD)"
              required
              placeholder="e.g. 2024-05-12"
              value={regDate}
              onChangeText={setRegDate}
              leftIcon={<Calendar size={16} color="#64748b" />}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Check In Time (HH:MM)"
                  required
                  placeholder="09:00"
                  value={regInTime}
                  onChangeText={setRegInTime}
                  leftIcon={<Clock size={16} color="#64748b" />}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Check Out Time (HH:MM)"
                  required
                  placeholder="18:00"
                  value={regOutTime}
                  onChangeText={setRegOutTime}
                  leftIcon={<Clock size={16} color="#64748b" />}
                />
              </View>
            </View>

            <TextInput
              label="Reason for Regularization"
              required
              placeholder="e.g. Phone battery died, missed punch"
              value={regReason}
              onChangeText={setRegReason}
              multiline
            />

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Upload Proof (Optional)</Text>
              <TouchableOpacity
                onPress={pickRegularizationProof}
                className="bg-slate-50 border border-slate-200 border-dashed py-6 rounded-2xl items-center justify-center"
              >
                {regProofBase64 ? (
                  <View className="items-center">
                    <CheckCircle2 size={24} color="#059669" className="mb-2" />
                    <Text className="text-xs font-bold text-emerald-700">Image attached</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Camera size={24} color="#94a3b8" className="mb-2" />
                    <Text className="text-xs font-bold text-slate-500">Tap to select photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleRegularizeSubmit}
              isLoading={isSubmittingReg}
              size="lg"
              className="bg-amber-600 rounded-2xl shadow-md shadow-amber-500/20 mt-2 mb-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-sm">Submit Request</Text>
              </View>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
