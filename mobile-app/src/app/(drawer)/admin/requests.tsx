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
import {
  UserPlus,
  FileWarning,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RefreshCw,
  Mail,
  Phone,
  Eye,
  CalendarCheck,
  User,
} from 'lucide-react-native';

import {
  useGetOrgRegistrationRequestsQuery,
  useAcceptRegistrationRequestMutation,
  useRejectRegistrationRequestMutation,
  useGetOrgRegularizationRequestsQuery,
  useApproveRegularizationRequestMutation,
  useRejectRegularizationRequestMutation,
} from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { Button } from '@/components/ui/Button';
import { formatHoursValue } from '@/utils/time';

const formatDateTime = (value: any) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RequestsScreen() {
  const { user } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<'JOIN' | 'ATTENDANCE'>('JOIN');

  // Selected state for Action Modals
  const [selectedJoinReq, setSelectedJoinReq] = useState<any>(null);
  const [selectedAttReq, setSelectedAttReq] = useState<any>(null);

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

  const [acceptRegistration, { isLoading: isAccepting }] = useAcceptRegistrationRequestMutation();
  const [rejectRegistration, { isLoading: isRejecting }] = useRejectRegistrationRequestMutation();
  const [approveRegularization, { isLoading: isApprovingAtt }] = useApproveRegularizationRequestMutation();
  const [rejectRegularization, { isLoading: isRejectingAtt }] = useRejectRegularizationRequestMutation();

  const regItems = useMemo(() => {
    return Array.isArray(regData?.items) ? regData.items : [];
  }, [regData]);

  const attItems = useMemo(() => {
    return Array.isArray(attData?.data)
      ? attData.data.filter((r: any) => r.status === 'PENDING')
      : [];
  }, [attData]);

  const handleRefresh = async () => {
    if (activeTab === 'JOIN') await refetchReg();
    else await refetchAtt();
  };

  const handleAcceptJoin = async () => {
    if (!selectedJoinReq) return;
    try {
      await acceptRegistration(selectedJoinReq.id).unwrap();
      Alert.alert('Approved', `${selectedJoinReq.name} has been approved.`);
      setSelectedJoinReq(null);
      refetchReg();
    } catch (err: any) {
      Alert.alert('Approval Failed', err?.data?.message || 'Could not approve request.');
    }
  };

  const handleRejectJoin = async () => {
    if (!selectedJoinReq) return;
    try {
      await rejectRegistration(selectedJoinReq.id).unwrap();
      Alert.alert('Rejected', `Request for ${selectedJoinReq.name} was rejected.`);
      setSelectedJoinReq(null);
      refetchReg();
    } catch (err: any) {
      Alert.alert('Rejection Failed', err?.data?.message || 'Could not reject request.');
    }
  };

  const handleApproveAtt = async () => {
    if (!selectedAttReq) return;
    try {
      await approveRegularization(selectedAttReq.id).unwrap();
      Alert.alert('Approved', `Attendance record regularized for ${selectedAttReq.userName || 'Member'}.`);
      setSelectedAttReq(null);
      refetchAtt();
    } catch (err: any) {
      Alert.alert('Approval Failed', err?.data?.message || 'Could not approve request.');
    }
  };

  const handleRejectAtt = async () => {
    if (!selectedAttReq) return;
    try {
      await rejectRegularization(selectedAttReq.id).unwrap();
      Alert.alert('Rejected', `Regularization request was rejected.`);
      setSelectedAttReq(null);
      refetchAtt();
    } catch (err: any) {
      Alert.alert('Rejection Failed', err?.data?.message || 'Could not reject request.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-0 border-b border-slate-200 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Requests Hub</Text>
            <Text className="text-slate-400 font-medium text-xs mt-0.5">
              Review and approve organization requests
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Custom Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab('JOIN')}
            className={`flex-1 flex-row items-center justify-center gap-2 pb-3 border-b-2 ${
              activeTab === 'JOIN' ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <UserPlus size={16} color={activeTab === 'JOIN' ? '#2563eb' : '#64748b'} />
            <Text
              className={`font-bold text-sm ${
                activeTab === 'JOIN' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              Join Requests ({regItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('ATTENDANCE')}
            className={`flex-1 flex-row items-center justify-center gap-2 pb-3 border-b-2 ${
              activeTab === 'ATTENDANCE' ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <CalendarCheck size={16} color={activeTab === 'ATTENDANCE' ? '#2563eb' : '#64748b'} />
            <Text
              className={`font-bold text-sm ${
                activeTab === 'ATTENDANCE' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              Regularization ({attItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'JOIN' && (
          <View>
            {regLoading || regFetching ? (
              <View className="py-16 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-slate-400 font-semibold text-xs mt-3">Loading requests...</Text>
              </View>
            ) : regItems.length === 0 ? (
              <View className="py-16 items-center">
                <CheckCircle2 size={48} color="#cbd5e1" />
                <Text className="text-slate-700 font-bold text-base mt-3">All caught up!</Text>
                <Text className="text-slate-400 text-xs text-center mt-1">
                  There are no pending join requests.
                </Text>
              </View>
            ) : (
              regItems.map((req: any) => (
                <SurfaceCard key={req.id} className="mb-3.5 p-4 flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 items-center justify-center mr-3">
                    <User size={20} color="#2563eb" />
                  </View>
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-extrabold text-slate-900 text-sm">
                        {req.name || 'Unknown User'}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Pending
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs font-medium mb-1">
                      {req.phone || req.email || 'No contact info'}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => setSelectedJoinReq(req)}
                        className="bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100"
                      >
                        <Text className="text-[10px] font-bold text-indigo-700">Review Request</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </SurfaceCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'ATTENDANCE' && (
          <View>
            {attLoading || attFetching ? (
              <View className="py-16 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-slate-400 font-semibold text-xs mt-3">Loading requests...</Text>
              </View>
            ) : attItems.length === 0 ? (
              <View className="py-16 items-center">
                <CheckCircle2 size={48} color="#cbd5e1" />
                <Text className="text-slate-700 font-bold text-base mt-3">All caught up!</Text>
                <Text className="text-slate-400 text-xs text-center mt-1">
                  There are no pending attendance regularization requests.
                </Text>
              </View>
            ) : (
              attItems.map((req: any) => (
                <SurfaceCard key={req.id} className="mb-3.5 p-4 flex-row items-start">
                  <View className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 items-center justify-center mr-3 mt-1">
                    <FileWarning size={18} color="#d97706" />
                  </View>
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center justify-between mb-0.5">
                      <Text className="font-extrabold text-slate-900 text-sm">
                        {req.userName || 'Member'}
                      </Text>
                      <BadgePill label="PENDING" variant="warning" size="sm" />
                    </View>
                    <Text className="text-slate-500 text-xs font-medium mb-2">
                      Reason: <Text className="font-bold text-slate-700">{req.reason || '-'}</Text>
                    </Text>
                    <View className="flex-row gap-2 mt-1">
                      <TouchableOpacity
                        onPress={() => setSelectedAttReq(req)}
                        className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 active:bg-amber-100"
                      >
                        <Text className="text-[11px] font-bold text-amber-700">Review Dispute</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </SurfaceCard>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Join Request Review Modal */}
      {selectedJoinReq && (
        <ActionModal
          visible={Boolean(selectedJoinReq)}
          onClose={() => setSelectedJoinReq(null)}
          title="Review Join Request"
          subtitle="Verify user identity before admitting to organization"
        >
          <View className="items-center mb-5">
            <View className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-blue-100 items-center justify-center mb-3">
              <User color="#2563eb" size={32} />
            </View>
            <Text className="text-xl font-black text-slate-900">{selectedJoinReq.name}</Text>
            <BadgePill label="PENDING REGISTRATION" variant="primary" className="mt-2" />
          </View>

          <SurfaceCard variant="flat" className="p-4 mb-5 bg-slate-50 border border-slate-200">
            <View className="space-y-3">
              <View className="flex-row items-center gap-3">
                <Mail size={16} color="#64748b" />
                <Text className="text-xs font-bold text-slate-800">{selectedJoinReq.email || '-'}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Phone size={16} color="#64748b" />
                <Text className="text-xs font-bold text-slate-800">{selectedJoinReq.phone || '-'}</Text>
              </View>
              {selectedJoinReq.city ? (
                <View className="flex-row items-center gap-3">
                  <MapPin size={16} color="#64748b" />
                  <Text className="text-xs font-bold text-slate-800">{selectedJoinReq.city}</Text>
                </View>
              ) : null}
              <View className="flex-row items-center gap-3">
                <Clock size={16} color="#64748b" />
                <Text className="text-xs font-bold text-slate-800">
                  Applied on {formatDateTime(selectedJoinReq.createdAt)}
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <View className="flex-row gap-3">
            <Button
              onPress={handleRejectJoin}
              isLoading={isRejecting}
              disabled={isAccepting}
              className="flex-1 bg-red-50 border border-red-200"
            >
              <Text className="text-red-600 font-extrabold text-sm text-center">Reject</Text>
            </Button>
            <Button
              onPress={handleAcceptJoin}
              isLoading={isAccepting}
              disabled={isRejecting}
              className="flex-1 bg-blue-600"
            >
              <Text className="text-white font-extrabold text-sm text-center">Approve</Text>
            </Button>
          </View>
        </ActionModal>
      )}

      {/* Attendance Regularization Modal */}
      {selectedAttReq && (
        <ActionModal
          visible={Boolean(selectedAttReq)}
          onClose={() => setSelectedAttReq(null)}
          title="Review Attendance Dispute"
          subtitle={`Requested by ${selectedAttReq.userName || 'Member'}`}
        >
          <SurfaceCard variant="flat" className="p-4 mb-4 bg-amber-50/50 border border-amber-100">
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Date:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {formatDateTime(selectedAttReq.createdAt)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Requested Check In:</Text>
                <Text className="text-xs font-black text-emerald-600">
                  {formatDateTime(selectedAttReq.requestedCheckIn)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Requested Check Out:</Text>
                <Text className="text-xs font-black text-rose-600">
                  {formatDateTime(selectedAttReq.requestedCheckOut)}
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <View className="mb-5 px-1">
            <Text className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Member's Reason
            </Text>
            <Text className="text-sm font-medium text-slate-700 bg-slate-100 p-3 rounded-xl">
              {selectedAttReq.reason || 'No specific reason provided.'}
            </Text>
          </View>

          {selectedAttReq.proofUrl && (
            <TouchableOpacity
              onPress={() => {}}
              className="flex-row items-center justify-center gap-2 bg-blue-50 py-3 rounded-xl mb-5"
            >
              <Eye size={16} color="#2563eb" />
              <Text className="text-blue-700 font-bold text-xs">View Uploaded Proof Image</Text>
            </TouchableOpacity>
          )}

          <View className="flex-row gap-3">
            <Button
              onPress={handleRejectAtt}
              isLoading={isRejectingAtt}
              disabled={isApprovingAtt}
              className="flex-1 bg-red-50 border border-red-200"
            >
              <Text className="text-red-600 font-extrabold text-sm text-center">Deny</Text>
            </Button>
            <Button
              onPress={handleApproveAtt}
              isLoading={isApprovingAtt}
              disabled={isRejectingAtt}
              className="flex-1 bg-emerald-600"
            >
              <Text className="text-white font-extrabold text-sm text-center">Approve Times</Text>
            </Button>
          </View>
        </ActionModal>
      )}
    </View>
  );
}
