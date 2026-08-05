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
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Search,
  MapPin,
  Clock,
  Settings,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LocateFixed,
  Save,
} from 'lucide-react-native';
import {
  useGetOrgAttendanceQuery,
  useGetOrgAttendanceSettingsQuery,
  useUpdateOrgAttendanceSettingsMutation,
} from '@/services/api/orgApi';
import { getCurrentCoordinates } from '@/utils/location';
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

export default function AdminAttendanceScreen() {
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProofLog, setSelectedProofLog] = useState(null);
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
  } = useGetOrgAttendanceQuery({ limit: 200 }, { skip: !user });

  const {
    data: settingsData,
    refetch: refetchSettings,
  } = useGetOrgAttendanceSettingsQuery(undefined, { skip: !user });

  const [updateSettings] = useUpdateOrgAttendanceSettingsMutation();

  const records = useMemo(() => {
    const items = Array.isArray(attendanceData?.items) ? attendanceData.items : [];
    if (!searchTerm.trim()) return items;
    return items.filter((log) => {
      const name = log?.user?.name || log?.userName || '';
      const email = log?.user?.email || log?.userEmail || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attendanceData, searchTerm]);

  const openGeofenceSettings = () => {
    if (settingsData?.settings) {
      setGeoLat(String(settingsData.settings.latitude || ''));
      setGeoLng(String(settingsData.settings.longitude || ''));
      setGeoRadius(String(settingsData.settings.radiusMeters || settingsData.settings.radius || '100'));
    }
    setGeofenceModalOpen(true);
  };

  const handleDetectLocation = async () => {
    try {
      setDetectingLoc(true);
      const coords = await getCurrentCoordinates();
      setGeoLng(String(coords[0]));
      setGeoLat(String(coords[1]));
      Alert.alert('Location Locked', `Lat: ${coords[1]}, Lng: ${coords[0]}`);
    } catch (e) {
      Alert.alert('GPS Error', e?.message || 'Could not acquire GPS position.');
    } finally {
      setDetectingLoc(false);
    }
  };

  const handleSaveGeofence = async () => {
    const latitude = parseFloat(geoLat);
    const longitude = parseFloat(geoLng);
    const radiusMeters = parseInt(geoRadius, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for latitude, longitude, and radius.');
      return;
    }

    try {
      setSavingSettings(true);
      await updateSettings({
        latitude,
        longitude,
        radiusMeters,
        radius: radiusMeters,
      }).unwrap();
      Alert.alert('Success', 'Geofencing settings updated successfully.');
      setGeofenceModalOpen(false);
      await refetchSettings();
    } catch (e) {
      Alert.alert('Save Failed', e?.data?.message || 'Could not update geofence settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Banner */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900">Org Attendance</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Live logs, geofencing & selfie proofs
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={openGeofenceSettings}
              className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl active:bg-indigo-100"
            >
              <Settings color="#4f46e5" size={18} />
            </Pressable>
            <Pressable
              onPress={() => refetchLogs()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </Pressable>
          </View>
        </View>

        {/* Search Field */}
        <View className="flex-row items-center bg-slate-100 rounded-2xl px-3.5 py-2 mt-3">
          <Search color="#94a3b8" size={18} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search by member name or email..."
            className="flex-1 ml-2 text-sm text-slate-900 font-medium"
          />
        </View>
      </View>

      {/* Attendance Logs List */}
      <ScrollView className="flex-1 px-4 pt-3">
        {logsLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading attendance logs...</Text>
          </View>
        ) : records.length === 0 ? (
          <View className="py-16 items-center">
            <ShieldCheck color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No attendance logs found</Text>
          </View>
        ) : (
          records.map((log, index) => {
            const memberName = log?.user?.name || log?.userName || 'Member';
            const memberEmail = log?.user?.email || log?.userEmail || '';
            const isPresent = log?.status === 'PRESENT';
            const hasSelfie = Boolean(log?.punchInSelfie || log?.punchInSelfieUrl);

            return (
              <View
                key={log?.id || index}
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-xs"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
                      {memberName}
                    </Text>
                    <Text className="text-slate-400 text-xs">{memberEmail}</Text>
                  </View>

                  <View className="items-end">
                    <View
                      className={`px-2.5 py-0.5 rounded-lg ${
                        isPresent ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold uppercase ${
                          isPresent ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {log?.status || 'PRESENT'}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-[10px] mt-1">
                      {formatDateOnly(log?.date)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-2 border-t border-slate-50 mt-1">
                  <View className="flex-row items-center gap-2">
                    <Clock color="#94a3b8" size={14} />
                    <Text className="text-slate-600 text-xs font-semibold">
                      {formatDateTime(log?.punchInAt)} - {formatDateTime(log?.punchOutAt)}
                    </Text>
                  </View>

                  {hasSelfie && (
                    <Pressable
                      onPress={() => setSelectedProofLog(log)}
                      className="flex-row items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg active:bg-indigo-100"
                    >
                      <Eye color="#4f46e5" size={12} />
                      <Text className="text-indigo-600 text-xs font-bold">Proof</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Selfie Proof Modal */}
      <Modal visible={Boolean(selectedProofLog)} transparent animationType="fade">
        <View className="flex-1 bg-black/75 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-slate-900 font-extrabold text-lg mb-1">Selfie Verification</Text>
            <Text className="text-slate-500 text-xs mb-4">
              {selectedProofLog?.user?.name || 'Member'} • {formatDateOnly(selectedProofLog?.date)}
            </Text>

            {/* Selfie Image */}
            <View className="w-full h-64 rounded-2xl bg-slate-100 overflow-hidden items-center justify-center border border-slate-200">
              {selectedProofLog?.punchInSelfie || selectedProofLog?.punchInSelfieUrl ? (
                <Image
                  source={{ uri: selectedProofLog.punchInSelfie || selectedProofLog.punchInSelfieUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-slate-400 text-xs">No image proof available</Text>
              )}
            </View>

            {/* Punch Location Coordinates */}
            {selectedProofLog?.punchInCoordinates && (
              <Pressable
                onPress={() => {
                  const [lng, lat] = selectedProofLog.punchInCoordinates;
                  Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
                }}
                className="mt-4 flex-row items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl"
              >
                <ExternalLink color="#4f46e5" size={16} />
                <Text className="text-indigo-600 font-bold text-xs">Open Punch Location on Maps</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setSelectedProofLog(null)}
              className="mt-3 py-3 bg-slate-900 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-sm">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Geofencing Settings Modal */}
      <Modal visible={geofenceModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-black text-slate-900">Geofence Settings</Text>
                <Text className="text-slate-500 text-xs">Define office coordinates and allowed radius</Text>
              </View>
              <Pressable onPress={() => setGeofenceModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleDetectLocation}
              disabled={detectingLoc}
              className="flex-row items-center justify-center gap-2 bg-blue-50 border border-blue-200 py-3.5 rounded-2xl mb-4"
            >
              {detectingLoc ? (
                <ActivityIndicator color="#2563eb" size="small" />
              ) : (
                <>
                  <LocateFixed color="#2563eb" size={18} />
                  <Text className="text-blue-700 font-bold text-sm">Detect Current Location as Org Center</Text>
                </>
              )}
            </Pressable>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Latitude</Text>
                <TextInput
                  value={geoLat}
                  onChangeText={setGeoLat}
                  placeholder="e.g. 18.5204"
                  keyboardType="numeric"
                  className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Longitude</Text>
                <TextInput
                  value={geoLng}
                  onChangeText={setGeoLng}
                  placeholder="e.g. 73.8567"
                  keyboardType="numeric"
                  className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium"
                />
              </View>
            </View>

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Radius (Meters)</Text>
            <TextInput
              value={geoRadius}
              onChangeText={setGeoRadius}
              placeholder="e.g. 100"
              keyboardType="numeric"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-6"
            />

            <Pressable
              onPress={handleSaveGeofence}
              disabled={savingSettings}
              className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-4 flex-row gap-2"
            >
              {savingSettings ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Save color="#fff" size={18} />
                  <Text className="text-white font-extrabold text-base">Save Geofence Settings</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
