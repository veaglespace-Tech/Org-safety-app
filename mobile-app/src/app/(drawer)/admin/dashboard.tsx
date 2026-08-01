import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Share, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { useGetMembersQuery } from '@/services/api/authApi';
import * as Clipboard from 'expo-clipboard';
import { Users, Copy, CheckCircle2, Building2, ChevronRight, User } from 'lucide-react-native';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetMembersQuery();
  const [copied, setCopied] = useState(false);

  const members = data?.members || [];

  const referralCode = user?.organization_id ? `REF-${String(user.organization_id).padStart(8, '0')}` : '';
  const referralLink = referralCode ? `https://app.veaglespace.com/register/user?ref=${referralCode}` : '';

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join our organization on Safety Portal!\nRegister here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderMember = ({ item: member, index }) => (
    <Pressable
      key={member?.id || index}
      className="flex-row items-center px-5 py-4 border-b border-slate-100 active:bg-slate-50"
    >
      <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 overflow-hidden">
        {member?.profile_photo ? (
          <Image source={{ uri: member.profile_photo }} style={{ width: 40, height: 40 }} />
        ) : (
          <User color="#94a3b8" size={20} />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-bold text-slate-900 text-base">{member?.name || 'Unknown'}</Text>
        <Text className="text-slate-500 text-xs mt-0.5">{member?.email || ''}</Text>
      </View>
      <View className="items-end">
        <View className={`px-2.5 py-1 rounded-lg ${member?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${member?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
            {member?.role}
          </Text>
        </View>
        <Text className="text-slate-400 text-[10px] mt-1">
          {member?.created_at ? new Date(member.created_at).toLocaleDateString() : ''}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Org Banner */}
      <View className="bg-white mx-4 mt-4 rounded-3xl p-6 border border-slate-100 shadow-sm">
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 items-center justify-center overflow-hidden">
            {user?.organization?.logo ? (
              <Image source={{ uri: user.organization.logo }} style={{ width: 64, height: 64 }} />
            ) : (
              <Building2 color="#94a3b8" size={28} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-extrabold text-slate-900 tracking-tight">
              {user?.organization?.name || 'Organization'}
            </Text>
            <Text className="text-slate-500 text-sm mt-0.5">
              Manage members & share referral link
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row mx-4 mt-4 gap-3">
        <View className="flex-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="p-1.5 bg-blue-50 rounded-lg">
              <Users color="#3b82f6" size={16} />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Users</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900">{members.length}</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="p-1.5 bg-green-50 rounded-lg">
              <CheckCircle2 color="#22c55e" size={16} />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900">{members.length}</Text>
        </View>
      </View>

      {/* Referral Box */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Referral Code</Text>
        <View className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 mb-3">
          <Text className="font-mono text-indigo-600 font-bold text-base">{referralCode || 'Loading...'}</Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCopyLink}
            className="flex-1 flex-row items-center justify-center gap-2 bg-indigo-600 py-3 rounded-xl active:bg-indigo-700"
          >
            {copied ? <CheckCircle2 color="#fff" size={16} /> : <Copy color="#fff" size={16} />}
            <Text className="text-white font-bold text-sm">{copied ? 'Copied!' : 'Copy Link'}</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-1 flex-row items-center justify-center gap-2 bg-slate-900 py-3 rounded-xl active:bg-slate-800"
          >
            <Text className="text-white font-bold text-sm">Share</Text>
          </Pressable>
        </View>
      </View>

      {/* Members List */}
      <View className="bg-white mx-4 mt-4 mb-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <View className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Users color="#3b82f6" size={18} />
            <Text className="font-bold text-slate-900">Organization Members</Text>
          </View>
        </View>
        
        {isLoading ? (
          <View className="py-12 items-center">
            <Text className="text-slate-400 font-medium">Loading members...</Text>
          </View>
        ) : members.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-slate-400 font-medium">No members found. Share your referral link!</Text>
          </View>
        ) : (
          members.map((member, idx) => renderMember({ item: member, index: idx }))
        )}
      </View>
    </ScrollView>
  );
}
