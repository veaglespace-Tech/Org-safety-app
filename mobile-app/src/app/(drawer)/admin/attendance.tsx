import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Search,
  MapPin,
  Clock,
  Settings,
  RefreshCw,
  Eye,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LocateFixed,
  Save,
  User,
  Calendar,
} from 'lucide-react-native';

import {
  useGetOrgAttendanceQuery,
  useGetOrgAttendanceSettingsQuery,
  useUpdateOrgAttendanceSettingsMutation,
} from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { getCurrentCoordinates } from '@/utils/location';
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

export default function AdminAttendanceScreen() {
  const { user } = useSelector((state: any) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProofLog, setSelectedProofLog] = useState<any>(null);
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);

  // Geofence settings form
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState('100');
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const {
    data: attendanceData,
    isLoading: logsLoading,
    refetch: refetchLogs,
    isFetching,
  } = useGetOrgAttendanceQuery({ limit: 200 }, { skip: !user });

  const {
    data: settingsData,
    refetch: refetchSettings,
  } = useGetOrgAttendanceSettingsQuery(undefined, { skip: !user });

  const [updateSettings] = useUpdateOrgAttendanceSettingsMutation();

  const records = useMemo(() => {
    const items = Array.isArray(attendanceData?.items) ? attendanceData.items : [];
    if (!searchTerm.trim()) return items;
    return items.filter((log: any) => {
      const name = log?.user?.name || log?.userName || '';
      const email = log?.user?.email || log?.userEmail || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attendanceData, searchTerm]);

  const openGeofenceSettings = () => {
    const currentSettings = settingsData?.settings || settingsData?.data;
    if (currentSettings) {
      setGeoLat(String(currentSettings.latitude || currentSettings.coordinates?.[1] || ''));
      setGeoLng(String(currentSettings.longitude || currentSettings.coordinates?.[0] || ''));
      setGeoRadius(String(currentSettings.radiusMeters || currentSettings.radius || '100'));
    }
    setGeofenceModalOpen(true);
  };

  const handleDetectGPS = async () => {
    try {
      setDetectingLoc(true);
      const coords = await getCurrentCoordinates();
      if (coords) {
        setGeoLat(String(coords[1].toFixed(6)));
        setGeoLng(String(coords[0].toFixed(6)));
        Alert.alert('GPS Located', `Coordinates captured: ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
      }
    } catch (err: any) {
      Alert.alert('GPS Error', err.message || 'Could not fetch current device coordinates.');
    } finally {
      setDetectingLoc(false);
    }
  };

  const handleSaveGeofence = async () => {
    const lat = parseFloat(geoLat);
    const lng = parseFloat(geoLng);
    const rad = parseInt(geoRadius, 10);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Validation Error', 'Please enter valid Latitude and Longitude coordinates.');
      return;
    }

    try {
      setSavingSettings(true);
      await updateSettings({
        latitude: lat,
        longitude: lng,
        radiusMeters: rad || 100,
      }).unwrap();

      Alert.alert('Success', 'Geofence safety parameters updated.');
      setGeofenceModalOpen(false);
      refetchSettings();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.data?.message || 'Could not save attendance settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Attendance</Text>
            <Text className="text-slate-400 font-medium text-xs">
              {records.length} Logs recorded
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => refetchLogs()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openGeofenceSettings}
              className="flex-row items-center gap-1.5 bg-emerald-600 px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 active:bg-emerald-700"
            >
              <Settings size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Geofence GPS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TextInput
          placeholder="Search logs by member name..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={<Search size={16} color="#94a3b8" />}
        />
      </View>

      {/* Attendance Logs List */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {logsLoading || isFetching ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-slate-400 font-semibold text-xs mt-3">Loading records...</Text>
          </View>
        ) : records.length === 0 ? (
          <View className="py-16 items-center">
            <Calendar size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">No attendance logs found</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Members will appear here once they punch in within your practice geofence.
            </Text>
          </View>
        ) : (
          records.map((log: any, idx: number) => {
            const userName = log?.user?.name || log?.userName || 'Member';
            const userPhone = log?.user?.phone || log?.userPhone || '';
            const punchIn = log?.punchIn || log?.checkInTime;
            const punchOut = log?.punchOut || log?.checkOutTime;
            const hasSelfie = log?.punchInSelfieUrl || log?.selfieUrl;

            return (
              <SurfaceCard key={log?.id || idx} className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                      <User size={16} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="font-extrabold text-slate-900 text-sm">{userName}</Text>
                      <Text className="text-[10px] text-slate-400 font-medium">
                        {formatDateOnly(log?.date || punchIn)}
                      </Text>
                    </View>
                  </View>

                  <BadgePill
                    label={punchOut ? 'COMPLETED' : punchIn ? 'PUNCHED IN' : 'RECORDED'}
                    variant={punchOut ? 'active' : 'primary'}
                    size="sm"
                  />
                </View>

                {/* Time & Duration Grid */}
                <View className="flex-row justify-between items-center py-1">
                  <View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">In Time</Text>
                    <Text className="text-xs font-black text-slate-800">
                      {formatDateTime(punchIn)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">Out Time</Text>
                    <Text className="text-xs font-black text-slate-800">
                      {formatDateTime(punchOut)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">Duration</Text>
                    <Text className="text-xs font-black text-emerald-600">
                      {formatHoursValue(log?.workedHours || log?.workedMinutes, {
                        fromMinutes: log?.workedHours == null,
                      })}
                    </Text>
                  </View>
                </View>

                {/* Selfie Proof Preview Trigger */}
                {hasSelfie && (
                  <TouchableOpacity
                    onPress={() => setSelectedProofLog(log)}
                    className="mt-2.5 pt-2 border-t border-slate-100 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-1.5">
                      <ShieldCheck size={14} color="#059669" />
                      <Text className="text-xs font-bold text-emerald-700">
                        GPS & Selfie Verified
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Eye size={12} color="#2563eb" />
                      <Text className="text-xs font-bold text-blue-600">View Proof</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </SurfaceCard>
            );
          })
        )}
      </ScrollView>

      {/* Selfie Proof Modal */}
      {selectedProofLog && (
        <ActionModal
          visible={Boolean(selectedProofLog)}
          onClose={() => setSelectedProofLog(null)}
          title="Attendance Verification Proof"
          subtitle={selectedProofLog?.user?.name || 'Member Verification'}
        >
          <View className="items-center mb-4">
            <View className="w-48 h-48 rounded-3xl bg-slate-100 border-2 border-slate-200 items-center justify-center overflow-hidden mb-3">
              {selectedProofLog?.punchInSelfieUrl || selectedProofLog?.selfieUrl ? (
                <Image
                  source={{
                    uri: selectedProofLog?.punchInSelfieUrl || selectedProofLog?.selfieUrl,
                  }}
                  style={{ width: 192, height: 192 }}
                  resizeMode="cover"
                />
              ) : (
                <User size={64} color="#94a3b8" />
              )}
            </View>
          </View>

          <SurfaceCard variant="flat" className="p-4 mb-4">
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Punch In Time:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {formatDateTime(selectedProofLog?.punchIn)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">GPS Validation:</Text>
                <Text className="text-xs font-bold text-emerald-600">
                  {selectedProofLog?.punchInValid !== false ? 'Inside Geofence' : 'Outside Geofence'}
                </Text>
              </View>
            </View>
          </SurfaceCard>
        </ActionModal>
      )}

      {/* Geofence Configuration Modal */}
      {geofenceModalOpen && (
        <ActionModal
          visible={geofenceModalOpen}
          onClose={() => setGeofenceModalOpen(false)}
          title="Practice Ground Geofence"
          subtitle="Configure GPS boundary for automated member attendance"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
            {/* Auto Detect Button */}
            <TouchableOpacity
              onPress={handleDetectGPS}
              disabled={detectingLoc}
              className="flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 py-3 rounded-2xl mb-4 active:bg-emerald-100"
            >
              {detectingLoc ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <LocateFixed size={16} color="#059669" />
              )}
              <Text className="text-xs font-bold text-emerald-700">
                {detectingLoc ? 'Detecting Location...' : 'Auto-Capture Current GPS Coordinates'}
              </Text>
            </TouchableOpacity>

            <TextInput
              label="Latitude Coordinate"
              required
              placeholder="e.g. 18.520430"
              value={geoLat}
              onChangeText={setGeoLat}
              keyboardType="numeric"
              leftIcon={<MapPin size={16} color="#64748b" />}
            />

            <TextInput
              label="Longitude Coordinate"
              required
              placeholder="e.g. 73.856743"
              value={geoLng}
              onChangeText={setGeoLng}
              keyboardType="numeric"
              leftIcon={<MapPin size={16} color="#64748b" />}
            />

            <TextInput
              label="Allowed Attendance Radius (Meters)"
              required
              placeholder="100"
              value={geoRadius}
              onChangeText={setGeoRadius}
              keyboardType="number-pad"
              leftIcon={<ShieldCheck size={16} color="#64748b" />}
            />

            <Button
              onPress={handleSaveGeofence}
              isLoading={savingSettings}
              size="lg"
              className="bg-emerald-600 rounded-2xl shadow-md shadow-emerald-500/20 mt-2 mb-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Save size={16} color="#fff" />
                <Text className="text-white font-extrabold text-sm">Save Geofence Boundary</Text>
              </View>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
