import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Building2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  CalendarCheck,
  MapPin,
  ChevronRight,
  User,
  Share2,
  Bell,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react-native';

import { useGetOrgDashboardQuery, useGetOrgTeamsQuery } from '@/services/api/orgApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { formatRoleLabel } from '@/utils/roles';

export default function MemberDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  // Fetch some basic data (Member dashboards might use specialized hooks later)
  const { data: teamsData } = useGetOrgTeamsQuery(10, { skip: !user });
  const { data: dashboardData } = useGetOrgDashboardQuery(undefined, { skip: !user });

  const [copied, setCopied] = useState(false);

  const rawOrgId = user?.organization_id || user?.organizationId || user?.organization?.id;
  const referralCode = rawOrgId ? `REF-${String(rawOrgId).padStart(8, '0')}` : '';
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
        message: `Join ${user?.organization?.name || 'our team'} on the Safety Portal!\nRegister your profile here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Member Profile Banner */}
      <View className="px-5 pt-5">
        <SurfaceCard variant="glass" className="p-6 bg-indigo-600 border-indigo-500 overflow-hidden relative">
          <View className="absolute -top-6 -right-6 opacity-10">
            <Zap size={120} color="#ffffff" />
          </View>
          <View className="flex-row items-center gap-4 relative z-10">
            <View className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 items-center justify-center overflow-hidden">
              {user?.profilePhoto || user?.profile_photo ? (
                <Image
                  source={{ uri: user.profilePhoto || user.profile_photo }}
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <User color="#fff" size={32} />
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <BadgePill
                  label={formatRoleLabel(user?.role) || 'MEMBER'}
                  variant="primary"
                  size="sm"
                  className="bg-indigo-500/50"
                />
              </View>
              <Text className="text-xl font-black text-white tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Member'}!
              </Text>
              {user?.organization?.name && (
                <View className="flex-row items-center gap-1.5 mt-1 opacity-90">
                  <Building2 size={13} color="#e2e8f0" />
                  <Text className="text-slate-200 font-medium text-xs">
                    {user.organization.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </SurfaceCard>
      </View>

      {/* 2. Personal Stat Cards */}
      <View className="px-5 mt-5">
        <View className="flex-row gap-3">
          {/* My Attendance */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Attendance
              </Text>
              <View className="p-2 bg-blue-50 rounded-xl">
                <CalendarCheck color="#2563eb" size={16} />
              </View>
            </View>
            <Text className="text-3xl font-black text-slate-900">0</Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">Days Present</Text>
          </SurfaceCard>

          {/* Assigned Teams */}
          <SurfaceCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                My Teams
              </Text>
              <View className="p-2 bg-indigo-50 rounded-xl">
                <Layers color="#4f46e5" size={16} />
              </View>
            </View>
            <Text className="text-3xl font-black text-slate-900">
              {Array.isArray(teamsData?.items) ? teamsData.items.length : 0}
            </Text>
            <Text className="text-slate-400 font-bold text-[10px] mt-0.5">Active Pods</Text>
          </SurfaceCard>
        </View>

        {/* SOS Ready Status */}
        <SurfaceCard className="p-4 mt-3 flex-row items-center justify-between border-emerald-100 bg-emerald-50/30">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center">
              <ShieldCheck color="#059669" size={20} />
            </View>
            <View>
              <Text className="font-extrabold text-slate-900">Safety SOS Ready</Text>
              <Text className="text-xs font-medium text-slate-500">Contact mapping active</Text>
            </View>
          </View>
          <BadgePill label="SECURE" variant="active" size="sm" />
        </SurfaceCard>
      </View>

      {/* 3. Quick Navigation Panel */}
      <View className="px-5 mt-6">
        <Text className="text-base font-extrabold text-slate-900 mb-3 ml-1">Daily Actions</Text>
        
        <SurfaceCard className="p-0 overflow-hidden mb-5">
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/member/attendance' as any)}
            className="flex-row items-center px-4 py-3.5 border-b border-slate-100 active:bg-slate-50"
          >
            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
              <MapPin color="#2563eb" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 text-sm">Mark Attendance</Text>
              <Text className="text-slate-500 text-[11px] font-medium">Punch in with GPS verification</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/profile' as any)}
            className="flex-row items-center px-4 py-3.5 border-b border-slate-100 active:bg-slate-50"
          >
            <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3">
              <User color="#64748b" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 text-sm">My Profile Settings</Text>
              <Text className="text-slate-500 text-[11px] font-medium">Update emergency contacts</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/member/posts' as any)}
            className="flex-row items-center px-4 py-3.5 active:bg-slate-50"
          >
            <View className="w-10 h-10 rounded-xl bg-pink-50 items-center justify-center mr-3">
              <Bell color="#ec4899" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 text-sm">Announcements & Polls</Text>
              <Text className="text-slate-500 text-[11px] font-medium">Check the latest notices</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </SurfaceCard>
      </View>

      {/* 4. Referral Code Card */}
      <View className="px-5">
        <SurfaceCard className="p-5 border-2 border-indigo-100 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#4f46e5" />
              <Text className="text-sm font-extrabold text-slate-900">
                Invite Members
              </Text>
            </View>
          </View>

          <Text className="text-xs text-slate-500 font-medium mb-3">
            Share this organizational referral code to invite others to join your team.
          </Text>

          <View className="flex-row items-center bg-indigo-50/50 rounded-2xl p-3 border border-indigo-50 mb-3 justify-between">
            <Text className="font-mono font-black text-indigo-700 text-base">
              {referralCode || 'Loading...'}
            </Text>
            <TouchableOpacity
              onPress={handleCopyLink}
              className="flex-row items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm active:bg-slate-50"
            >
              {copied ? (
                <CheckCircle2 size={14} color="#059669" />
              ) : (
                <Copy size={14} color="#4f46e5" />
              )}
              <Text className="text-xs font-bold text-indigo-700">
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            className="flex-row items-center justify-center gap-2 bg-indigo-600 py-3 rounded-xl active:bg-indigo-700 shadow-md shadow-indigo-500/20"
          >
            <Share2 size={16} color="#fff" />
            <Text className="text-white font-bold text-xs">Share Invite Link</Text>
          </TouchableOpacity>
        </SurfaceCard>
      </View>
    </ScrollView>
  );
}
