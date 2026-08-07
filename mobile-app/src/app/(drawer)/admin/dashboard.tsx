import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import {
  Users,
  Copy,
  CheckCircle2,
  Building2,
  ChevronRight,
  User,
  UserPlus,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Guitar,
  FileText,
  Share2,
  Crown,
  Radio,
} from 'lucide-react-native';

import { useGetMembersQuery } from '@/services/api/authApi';
import { useGetOrgDashboardQuery, useGetOrgTeamsQuery } from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  const { data: membersData, isLoading: isMembersLoading, refetch: refetchMembers } =
    useGetMembersQuery(undefined);
  const { data: dashboardData } = useGetOrgDashboardQuery(undefined, { skip: !user });
  const { data: teamsData } = useGetOrgTeamsQuery(100, { skip: !user });

  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const members = membersData?.members || [];
  const teams = Array.isArray(teamsData?.items) ? teamsData.items : [];

  const orgId = user?.organization_id || user?.organizationId || user?.organization?.id;
  const referralCode = orgId ? `REF-${String(orgId).padStart(8, '0')}` : '';
  const referralLink = referralCode
    ? `https://tichisuraksha.veaglespace.com/register/user?ref=${referralCode}`
    : '';

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ${user?.organization?.name || 'our organization'} on Tichi Suraksha Safety Portal!\nRegister your profile here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (emailAddress: string) => {
    if (emailAddress) {
      Linking.openURL(`mailto:${emailAddress}`);
    }
  };

  const quickActions = [
    {
      title: 'Add Member',
      icon: UserPlus,
      color: '#2563eb',
      bg: 'bg-blue-50',
      onPress: () => router.push('/(drawer)/admin/members' as any),
    },
    {
      title: 'Create Team',
      icon: Layers,
      color: '#4f46e5',
      bg: 'bg-indigo-50',
      onPress: () => router.push('/(drawer)/admin/teams' as any),
    },
    {
      title: 'Attendance',
      icon: Calendar,
      color: '#059669',
      bg: 'bg-emerald-50',
      onPress: () => router.push('/(drawer)/admin/attendance' as any),
    },
    {
      title: 'Instruments',
      icon: Guitar,
      color: '#d97706',
      bg: 'bg-amber-50',
      onPress: () => router.push('/(drawer)/admin/instruments' as any),
    },
    {
      title: 'Reports',
      icon: FileText,
      color: '#7c3aed',
      bg: 'bg-purple-50',
      onPress: () => router.push('/(drawer)/admin/reports' as any),
    },
    {
      title: 'Safety SOS',
      icon: Radio,
      color: '#dc2626',
      bg: 'bg-rose-50',
      onPress: () => router.push('/(drawer)/admin/attendance' as any),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Organization Banner */}
      <View className="px-5 pt-5">
        <SurfaceCard variant="glow" className="p-6">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center overflow-hidden">
              {user?.organization?.logo ? (
                <Image
                  source={{ uri: user.organization.logo }}
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <Building2 color="#4f46e5" size={32} />
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <BadgePill
                  label={user?.organization?.plan?.name || 'PRO TRIAL'}
                  variant="admin"
                  size="sm"
                />
              </View>
              <Text className="text-2xl font-black text-slate-900 tracking-tight">
                {user?.organization?.name || 'Organization Portal'}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <MapPin size={13} color="#64748b" />
                <Text className="text-slate-500 font-medium text-xs">
                  {user?.organization?.city || 'Pune'}, {user?.organization?.state || 'Maharashtra'}
                </Text>
              </View>
            </View>
          </View>
        </SurfaceCard>
      </View>

      {/* 2. Key Metric Stat Cards */}
      <View className="px-5 mt-5">
        <View className="flex-row gap-3">
          {/* Total Members */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Members
              </Text>
              <View className="p-2 bg-blue-50 rounded-xl">
                <Users color="#2563eb" size={16} />
              </View>
            </View>
            <Text className="text-3xl font-black text-slate-900">{members.length}</Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">Enrolled</Text>
          </SurfaceCard>

          {/* Active Teams */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Teams
              </Text>
              <View className="p-2 bg-indigo-50 rounded-xl">
                <Layers color="#4f46e5" size={16} />
              </View>
            </View>
            <Text className="text-3xl font-black text-slate-900">{teams.length}</Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">Configured</Text>
          </SurfaceCard>
        </View>

        <View className="flex-row gap-3 mt-3">
          {/* Safety Geofence Status */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Geofence
              </Text>
              <View className="p-2 bg-emerald-50 rounded-xl">
                <ShieldCheck color="#059669" size={16} />
              </View>
            </View>
            <Text className="text-2xl font-black text-emerald-600">Active</Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">GPS Protected</Text>
          </SurfaceCard>

          {/* Subscription Tier */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Plan Limit
              </Text>
              <View className="p-2 bg-amber-50 rounded-xl">
                <Crown color="#d97706" size={16} />
              </View>
            </View>
            <Text className="text-2xl font-black text-slate-900">
              {user?.organization?.plan?.memberLimit || 50}
            </Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">Max Members</Text>
          </SurfaceCard>
        </View>
      </View>

      {/* 3. Referral Code Sharing Card */}
      <View className="px-5 mt-5">
        <SurfaceCard className="p-5 border-2 border-indigo-100 bg-indigo-50/30">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#4f46e5" />
              <Text className="text-sm font-extrabold text-slate-900">
                Member Referral Onboarding
              </Text>
            </View>
            <BadgePill label="1-Tap Invite" variant="purple" size="sm" />
          </View>

          <Text className="text-xs text-slate-600 font-medium mb-3">
            Share this referral code or link with members to let them register directly into your
            organization.
          </Text>

          <View className="flex-row items-center bg-white rounded-2xl p-3 border border-indigo-100 mb-3 justify-between">
            <Text className="font-mono font-black text-indigo-700 text-base">
              {referralCode || 'REF-XXXXXXXX'}
            </Text>
            <TouchableOpacity
              onPress={handleCopyLink}
              className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl active:bg-indigo-100"
            >
              {copied ? (
                <CheckCircle2 size={14} color="#059669" />
              ) : (
                <Copy size={14} color="#4f46e5" />
              )}
              <Text className="text-xs font-bold text-indigo-700">
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={handleCopyLink}
              className="flex-1 flex-row items-center justify-center gap-2 bg-indigo-600 py-3 rounded-xl active:bg-indigo-700 shadow-md shadow-indigo-500/20"
            >
              <Copy size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Copy Invite Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 flex-row items-center justify-center gap-2 bg-slate-900 py-3 rounded-xl active:bg-slate-800"
            >
              <Share2 size={16} color="#fff" />
              <Text className="text-white font-bold text-xs">Share Invite</Text>
            </TouchableOpacity>
          </View>
        </SurfaceCard>
      </View>

      {/* 4. Quick Action Tiles */}
      <View className="px-5 mt-6">
        <Text className="text-base font-extrabold text-slate-900 mb-3 ml-1">
          Quick Actions & Portals
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={idx}
                onPress={action.onPress}
                activeOpacity={0.8}
                className="w-[48%] bg-white p-4 rounded-3xl border border-slate-200/70 shadow-sm"
              >
                <View className={`w-10 h-10 rounded-2xl ${action.bg} items-center justify-center mb-2.5`}>
                  <Icon size={20} color={action.color} />
                </View>
                <Text className="text-sm font-black text-slate-900">{action.title}</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Text className="text-[11px] font-bold text-slate-400">Open</Text>
                  <ChevronRight size={12} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. Recent Organization Members */}
      <View className="px-5 mt-6">
        <View className="flex-row items-center justify-between mb-3 ml-1">
          <Text className="text-base font-extrabold text-slate-900">Organization Members</Text>
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/admin/members' as any)}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-bold text-blue-600">View All</Text>
            <ChevronRight size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <SurfaceCard className="p-0 overflow-hidden">
          {isMembersLoading ? (
            <View className="py-12 items-center">
              <Text className="text-slate-400 font-semibold text-sm">Loading directory...</Text>
            </View>
          ) : members.length === 0 ? (
            <View className="py-12 items-center px-4">
              <Users size={36} color="#94a3b8" />
              <Text className="text-slate-600 font-bold text-base mt-2">No members registered yet</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">
                Share your referral link above to onboard your team.
              </Text>
            </View>
          ) : (
            members.slice(0, 5).map((member: any, idx: number) => (
              <TouchableOpacity
                key={member?.id || idx}
                onPress={() => setSelectedMember(member)}
                className={`flex-row items-center px-4 py-3.5 ${
                  idx !== members.length - 1 ? 'border-b border-slate-100' : ''
                } active:bg-slate-50`}
              >
                <View className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-3 overflow-hidden">
                  {member?.profile_photo ? (
                    <Image
                      source={{ uri: member.profile_photo }}
                      style={{ width: 44, height: 44 }}
                    />
                  ) : (
                    <User color="#2563eb" size={20} />
                  )}
                </View>
                <View className="flex-1 pr-2">
                  <Text className="font-extrabold text-slate-900 text-sm">
                    {member?.name || 'Unknown'}
                  </Text>
                  <Text className="text-slate-400 text-xs font-medium">
                    {member?.phone || member?.email || 'No contact'}
                  </Text>
                </View>
                <BadgePill
                  label={member?.role || 'MEMBER'}
                  variant={member?.role === 'admin' ? 'admin' : 'member'}
                  size="sm"
                />
              </TouchableOpacity>
            ))
          )}
        </SurfaceCard>
      </View>

      {/* Member Details Action Sheet Modal */}
      {selectedMember && (
        <ActionModal
          visible={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
          title={selectedMember?.name || 'Member Details'}
          subtitle={selectedMember?.email || 'Organization Member'}
        >
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-blue-100 items-center justify-center overflow-hidden mb-3">
              {selectedMember?.profile_photo ? (
                <Image
                  source={{ uri: selectedMember.profile_photo }}
                  style={{ width: 80, height: 80 }}
                />
              ) : (
                <User color="#2563eb" size={36} />
              )}
            </View>
            <Text className="text-xl font-black text-slate-900">{selectedMember?.name}</Text>
            <BadgePill
              label={selectedMember?.role || 'MEMBER'}
              variant={selectedMember?.role === 'admin' ? 'admin' : 'member'}
              className="mt-2"
            />
          </View>

          <SurfaceCard variant="flat" className="p-4 mb-4">
            <View className="space-y-2.5">
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Mobile:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedMember?.phone || '-'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Emergency Contact:</Text>
                <Text className="text-xs font-bold text-rose-600">
                  {selectedMember?.emergency_contact || '-'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">Blood Group:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedMember?.blood_group || '-'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-semibold text-slate-500">City / Location:</Text>
                <Text className="text-xs font-bold text-slate-900">
                  {selectedMember?.city || '-'}
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <View className="flex-row gap-3">
            {selectedMember?.phone && (
              <TouchableOpacity
                onPress={() => handleCall(selectedMember.phone)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-emerald-600 py-3.5 rounded-2xl active:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                <Phone size={16} color="#fff" />
                <Text className="text-white font-bold text-xs">Call Member</Text>
              </TouchableOpacity>
            )}
            {selectedMember?.email && (
              <TouchableOpacity
                onPress={() => handleEmail(selectedMember.email)}
                className="flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3.5 rounded-2xl active:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <Mail size={16} color="#fff" />
                <Text className="text-white font-bold text-xs">Email Member</Text>
              </TouchableOpacity>
            )}
          </View>
        </ActionModal>
      )}
    </ScrollView>
  );
}
