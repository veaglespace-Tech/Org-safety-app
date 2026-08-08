import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Timer, MapPinned, UserCheck, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react-native';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useAppTheme } from '@/context/ThemeContext';
import { addNotification } from '@/store/slices/notificationSlice';
import { useGetMyAttendanceQuery, usePunchInMutation, usePunchOutMutation, useReachedHomeMutation } from '@/services/api/attendanceApi';
import { useGetMemberDashboardQuery } from '@/services/api/memberApi';
import { getTodayDateKey } from '@/utils/date';
import { getCurrentCoordinates } from '@/utils/location';
import AttendanceFaceCaptureModal from '@/components/attendance/AttendanceFaceCaptureModal';

export default function MyAttendancePage() {
  const { user } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();
  const dispatch = useDispatch();

  const [isCapturing, setIsCapturing] = useState(false);
  const [pendingPunchType, setPendingPunchType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard, isFetching: dashboardFetching } = useGetMemberDashboardQuery(undefined, { skip: !user });
  const { data: attendanceData, isLoading: attendanceLoading, refetch: refetchAttendance, isFetching: attendanceFetching } = useGetMyAttendanceQuery(12, { skip: !user });

  const [punchInMutation] = usePunchInMutation();
  const [punchOutMutation] = usePunchOutMutation();
  const [reachedHomeMutation] = useReachedHomeMutation();

  const loading = dashboardLoading || attendanceLoading;
  const refreshing = dashboardFetching || attendanceFetching;

  const records = Array.isArray(attendanceData?.items) ? attendanceData.items : [];
  const todayRecord = records.find(record => String(record.date) === getTodayDateKey());

  const summary = Array.isArray(dashboardData?.summary) ? dashboardData.summary : [];
  const todayStatusItem = summary.find(item => item.label === 'Today Status');
  const todayStatusValue = todayStatusItem ? todayStatusItem.value : (todayRecord?.status || 'No Record');

  const canPunchIn = !todayRecord?.punchInAt;
  const canPunchOut = Boolean(todayRecord?.punchInAt) && !todayRecord?.punchOutAt;

  const handleRefresh = () => {
    refetchDashboard();
    refetchAttendance();
  };

  const handlePunchAction = (type) => {
    if (type === 'home') {
      submitPunch('home', null);
      return;
    }
    setPendingPunchType(type);
    setIsCapturing(true);
  };

  const submitPunch = async (type, selfieBase64) => {
    try {
      setActionLoading(true);
      let coords;
      try {
        coords = await getCurrentCoordinates();
      } catch (locErr) {
        Alert.alert('Location Error', locErr.message);
        setActionLoading(false);
        return;
      }

      const locationPayload = {
        inputFormat: 'NEW2',
        mode: 'AUTO',
        source: 'DEVICE_GPS',
        displayText: `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`,
        coordinates: coords,
      };

      if (type === 'in') {
        await punchInMutation({
          userLocation: coords,
          location: locationPayload,
          selfieImageDataUrl: selfieBase64,
        }).unwrap();
        Alert.alert('Success', 'Punch in successful!');
      } else if (type === 'out') {
        await punchOutMutation({
          userLocation: coords,
          location: locationPayload,
          selfieImageDataUrl: selfieBase64,
        }).unwrap();
        Alert.alert('Success', 'Punch out successful!');
      } else if (type === 'home') {
        await reachedHomeMutation({
          userLocation: coords,
          location: locationPayload,
        }).unwrap();
        Alert.alert('Success', 'Reached home marked successfully!');
      }

      handleRefresh();
    } catch (err) {
      console.log('Attendance Error:', err);
      Alert.alert('Error', err?.data?.message || err?.error || err?.message || 'Attendance action failed');
    } finally {
      setActionLoading(false);
      setPendingPunchType(null);
      setIsCapturing(false);
    }
  };

  if (loading && !refreshing && !records.length) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-[#070e1e]' : 'bg-slate-50'}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-[#070e1e]' : 'bg-slate-50'}`}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />}
      >
        <Text className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          My Attendance
        </Text>

        <SurfaceCard className="p-5 mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center">
              <Timer size={24} color="#3b82f6" />
            </View>
            <View>
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Today's Status</Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{todayStatusValue}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4 justify-between">
            {canPunchIn && (
              <TouchableOpacity
                onPress={() => handlePunchAction('in')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30"
              >
                {actionLoading && pendingPunchType === 'in' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="items-center">
                    <UserCheck size={24} color="#fff" className="mb-2" />
                    <Text className="text-white font-bold">Punch In</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {canPunchOut && (
              <TouchableOpacity
                onPress={() => handlePunchAction('out')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-2xl bg-amber-500 items-center justify-center shadow-lg shadow-amber-500/30"
              >
                {actionLoading && pendingPunchType === 'out' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="items-center">
                    <RefreshCcw size={24} color="#fff" className="mb-2" />
                    <Text className="text-white font-bold">Punch Out</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            
            {!canPunchIn && !canPunchOut && todayRecord?.punchOutAt && (
              <View className="w-full p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex-row items-center justify-center">
                <CheckCircle2 size={20} color="#10b981" />
                <Text className="text-green-600 dark:text-green-400 font-bold ml-2">Punched Out for Today</Text>
              </View>
            )}
          </View>
          
          {todayRecord?.punchOutAt && !todayRecord?.homeReachedAt && (
            <TouchableOpacity
              onPress={() => handlePunchAction('home')}
              disabled={actionLoading}
              className="mt-4 w-full py-4 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              {actionLoading && pendingPunchType === 'home' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <MapPinned size={20} color="#fff" />
                  <Text className="text-white font-bold">Mark Reached Home</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </SurfaceCard>

        <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Logs</Text>
        
        {records.length === 0 ? (
          <Text className={`text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            No attendance records found.
          </Text>
        ) : (
          records.slice(0, 7).map((record, index) => (
            <SurfaceCard key={record.id || index} className="p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {record.date}
                </Text>
                <View className={`px-2 py-1 rounded border ${record.status === 'PRESENT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <Text className={`text-xs font-bold ${record.status === 'PRESENT' ? 'text-green-700' : 'text-red-700'}`}>
                    {record.status || 'ABSENT'}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-2">
                <View>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>In Time</Text>
                  <Text className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {record.punchInAt ? new Date(record.punchInAt).toLocaleTimeString() : '-'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Out Time</Text>
                  <Text className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {record.punchOutAt ? new Date(record.punchOutAt).toLocaleTimeString() : '-'}
                  </Text>
                </View>
              </View>
            </SurfaceCard>
          ))
        )}

        <View className="h-10" />
      </ScrollView>

      {isCapturing && (
        <AttendanceFaceCaptureModal
          visible={isCapturing}
          isDark={isDark}
          onClose={() => {
            setIsCapturing(false);
            setPendingPunchType(null);
          }}
          onCapture={(base64) => {
            submitPunch(pendingPunchType, base64);
          }}
        />
      )}
    </View>
  );
}
