import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  UserPlus,
  FileWarning,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Eye,
} from 'lucide-react-native';
import {
  useGetOrgRegistrationRequestsQuery,
  useAcceptRegistrationRequestMutation,
  useRejectRegistrationRequestMutation,
  useGetOrgRegularizationRequestsQuery,
  useApproveRegularizationRequestMutation,
  useRejectRegularizationRequestMutation,
} from '@/services/api/orgApi';

export default function RequestsScreen() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('REGISTRATION'); // 'REGISTRATION' | 'REGULARIZATION'
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [viewProofModalUri, setViewProofModalUri] = useState('');

  const {
    data: regData,
    isLoading: regLoading,
    isFetching: regFetching,
    refetch: refetchReg,
  } = useGetOrgRegistrationRequestsQuery(undefined, { skip: !user });

  const {
    data: attData,
    isLoading: attLoading,
    isFetching: attFetching,
    refetch: refetchAtt,
  } = useGetOrgRegularizationRequestsQuery(undefined, { skip: !user });

  const [acceptRegistration] = useAcceptRegistrationRequestMutation();
  const [rejectRegistration] = useRejectRegistrationRequestMutation();
  const [approveRegularization] = useApproveRegularizationRequestMutation();
  const [rejectRegularization] = useRejectRegularizationRequestMutation();

  const regItems = Array.isArray(regData?.items) ? regData.items : [];
  const attItems = Array.isArray(attData?.data)
    ? attData.data.filter((r) => r.status === 'PENDING')
    : [];

  const handleRefresh = async () => {
    await Promise.all([refetchReg(), refetchAtt()]);
  };

  const handleApproveReg = (item) => {
    Alert.alert(
      'Approve Member',
      `Are you sure you want to approve registration for ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoadingId(item.id);
              await acceptRegistration(item.id).unwrap();
              Alert.alert('Approved', `${item.name} is now an approved organization member.`);
              await handleRefresh();
            } catch (err) {
              Alert.alert('Approval Failed', err?.data?.message || 'Could not approve request.');
            } finally {
              setActionLoadingId('');
            }
          },
        },
      ]
    );
  };

  const handleRejectReg = (item) => {
    Alert.alert(
      'Reject Member',
      `Reject registration request for ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(item.id);
              await rejectRegistration({ requestId: item.id, note: 'Rejected by admin' }).unwrap();
              Alert.alert('Rejected', 'Registration request rejected.');
              await handleRefresh();
            } catch (err) {
              Alert.alert('Rejection Failed', err?.data?.message || 'Could not reject request.');
            } finally {
              setActionLoadingId('');
            }
          },
        },
      ]
    );
  };

  const handleApproveRegularization = (item) => {
    Alert.alert(
      'Approve Regularization',
      `Approve attendance regularization for ${item.userName || item?.user?.name} on ${item.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoadingId(item.id);
              await approveRegularization(item.id).unwrap();
              Alert.alert('Approved', 'Attendance regularization approved.');
              await handleRefresh();
            } catch (err) {
              Alert.alert('Failed', err?.data?.message || 'Could not approve regularization.');
            } finally {
              setActionLoadingId('');
            }
          },
        },
      ]
    );
  };

  const handleRejectRegularization = (item) => {
    Alert.alert(
      'Reject Regularization',
      `Reject attendance regularization for ${item.userName || item?.user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(item.id);
              await rejectRegularization({ id: item.id, note: 'Rejected by admin' }).unwrap();
              Alert.alert('Rejected', 'Attendance regularization rejected.');
              await handleRefresh();
            } catch (err) {
              Alert.alert('Failed', err?.data?.message || 'Could not reject regularization.');
            } finally {
              setActionLoadingId('');
            }
          },
        },
      ]
    );
  };

  const loading = regLoading || attLoading;
  const isRefreshing = regFetching || attFetching;

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900">Requests Hub</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Review pending registrations & regularizations
            </Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw color="#64748b" size={18} />
          </Pressable>
        </View>

        {/* Segmented Dual Tabs */}
        <View className="flex-row bg-slate-100 p-1 rounded-2xl mt-4">
          <Pressable
            onPress={() => setActiveTab('REGISTRATION')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 ${
              activeTab === 'REGISTRATION' ? 'bg-white shadow-xs' : ''
            }`}
          >
            <UserPlus
              color={activeTab === 'REGISTRATION' ? '#4f46e5' : '#64748b'}
              size={16}
            />
            <Text
              className={`font-bold text-xs ${
                activeTab === 'REGISTRATION' ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              Registrations
            </Text>
            {regItems.length > 0 && (
              <View className="bg-rose-500 px-1.5 py-0.2 rounded-full ml-1">
                <Text className="text-white text-[10px] font-bold">{regItems.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('REGULARIZATION')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 ${
              activeTab === 'REGULARIZATION' ? 'bg-white shadow-xs' : ''
            }`}
          >
            <FileWarning
              color={activeTab === 'REGULARIZATION' ? '#4f46e5' : '#64748b'}
              size={16}
            />
            <Text
              className={`font-bold text-xs ${
                activeTab === 'REGULARIZATION' ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              Attendance
            </Text>
            {attItems.length > 0 && (
              <View className="bg-amber-500 px-1.5 py-0.2 rounded-full ml-1">
                <Text className="text-white text-[10px] font-bold">{attItems.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading requests...</Text>
          </View>
        ) : activeTab === 'REGISTRATION' ? (
          regItems.length === 0 ? (
            <View className="py-16 items-center">
              <UserPlus color="#cbd5e1" size={40} />
              <Text className="text-slate-400 font-bold text-sm mt-2">
                No pending registration requests
              </Text>
            </View>
          ) : (
            regItems.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-slate-900 font-extrabold text-base">{item.name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">{item.email}</Text>
                  </View>
                  <View className="bg-amber-50 px-2.5 py-1 rounded-lg">
                    <Text className="text-amber-700 text-[10px] font-bold uppercase">Pending</Text>
                  </View>
                </View>

                {/* Details */}
                <View className="space-y-1.5 bg-slate-50 p-3 rounded-2xl mb-4">
                  {item.mobile && (
                    <View className="flex-row items-center gap-2">
                      <Phone color="#94a3b8" size={14} />
                      <Text className="text-slate-600 text-xs font-medium">{item.mobile}</Text>
                    </View>
                  )}
                  {item.city && (
                    <View className="flex-row items-center gap-2">
                      <MapPin color="#94a3b8" size={14} />
                      <Text className="text-slate-600 text-xs font-medium">{item.city}</Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => handleRejectReg(item)}
                    disabled={actionLoadingId === item.id}
                    className="flex-1 py-3 rounded-xl items-center justify-center bg-rose-50 border border-rose-200 active:bg-rose-100 flex-row gap-1.5"
                  >
                    <XCircle color="#e11d48" size={16} />
                    <Text className="text-rose-600 font-bold text-xs">Reject</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleApproveReg(item)}
                    disabled={actionLoadingId === item.id}
                    className="flex-1 py-3 rounded-xl items-center justify-center bg-emerald-600 active:bg-emerald-700 flex-row gap-1.5"
                  >
                    {actionLoadingId === item.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <CheckCircle2 color="#fff" size={16} />
                        <Text className="text-white font-bold text-xs">Approve</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )
        ) : attItems.length === 0 ? (
          <View className="py-16 items-center">
            <FileWarning color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">
              No pending attendance regularizations
            </Text>
          </View>
        ) : (
          attItems.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-slate-900 font-extrabold text-base">
                    {item.userName || item?.user?.name || 'Member'}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">Date: {item.date}</Text>
                </View>
                <View className="bg-indigo-50 px-2.5 py-1 rounded-lg">
                  <Text className="text-indigo-700 text-[10px] font-bold uppercase">Regularize</Text>
                </View>
              </View>

              {/* Punch times */}
              <View className="bg-slate-50 p-3 rounded-2xl mb-3 flex-row justify-between">
                <View>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold">Requested In</Text>
                  <Text className="text-slate-800 font-bold text-sm mt-0.5">
                    {item.punchInTime || '-'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-400 text-[10px] uppercase font-bold">Requested Out</Text>
                  <Text className="text-slate-800 font-bold text-sm mt-0.5">
                    {item.punchOutTime || '-'}
                  </Text>
                </View>
              </View>

              {item.reason && (
                <Text className="text-slate-600 text-xs mb-3 italic">
                  "{item.reason}"
                </Text>
              )}

              {item.proofImageDataUrl && (
                <Pressable
                  onPress={() => setViewProofModalUri(item.proofImageDataUrl)}
                  className="flex-row items-center gap-1.5 py-2 mb-3 self-start"
                >
                  <Eye color="#4f46e5" size={14} />
                  <Text className="text-indigo-600 text-xs font-bold">View Attached Proof</Text>
                </Pressable>
              )}

              {/* Actions */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => handleRejectRegularization(item)}
                  disabled={actionLoadingId === item.id}
                  className="flex-1 py-3 rounded-xl items-center justify-center bg-rose-50 border border-rose-200 active:bg-rose-100 flex-row gap-1.5"
                >
                  <XCircle color="#e11d48" size={16} />
                  <Text className="text-rose-600 font-bold text-xs">Reject</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleApproveRegularization(item)}
                  disabled={actionLoadingId === item.id}
                  className="flex-1 py-3 rounded-xl items-center justify-center bg-emerald-600 active:bg-emerald-700 flex-row gap-1.5"
                >
                  {actionLoadingId === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <CheckCircle2 color="#fff" size={16} />
                      <Text className="text-white font-bold text-xs">Approve</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Proof Photo Modal */}
      <Modal visible={Boolean(viewProofModalUri)} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-5 w-full max-w-sm">
            <Text className="text-slate-900 font-bold text-base mb-3">Attached Proof</Text>
            <View className="w-full h-64 rounded-2xl bg-slate-100 overflow-hidden mb-4">
              <Image
                source={{ uri: viewProofModalUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Pressable
              onPress={() => setViewProofModalUri('')}
              className="py-3 bg-slate-900 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-sm">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
