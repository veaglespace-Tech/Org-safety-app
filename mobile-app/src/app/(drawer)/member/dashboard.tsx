import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Share } from 'react-native';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { Building2, Copy, CheckCircle2, Share2, MessageCircle, Mail, Shield } from 'lucide-react-native';
import { ROLE_LABELS, normalizeRole } from '@/utils/roles';
import { router } from 'expo-router';
import { Linking } from 'react-native';

export default function MemberDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const userRole = user?.role ? normalizeRole(user.role) : null;
  const displayRole = userRole && ROLE_LABELS[userRole] ? ROLE_LABELS[userRole] : 'Member';

  const rawOrgId = user?.organization_id;
  const referralCode = rawOrgId ? `REF-${String(rawOrgId).padStart(8, '0')}` : '';
  const referralLink = `https://app.veaglespace.com/register?ref=${referralCode}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `Join our organization on Safety Portal!\nRegister here: ${referralLink}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
    });
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join our Organization Safety Portal');
    const body = encodeURIComponent(`Join our organization on Safety Portal!\nRegister here: ${referralLink}`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Join our organization on Safety Portal!\nRegister here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

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
              Check your organization's updates & share referral link.
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row mx-4 mt-4 gap-3">
        <Pressable
          onPress={() => router.push('/(drawer)/sos')}
          className="flex-1 bg-red-500 rounded-2xl p-5 items-center justify-center active:bg-red-600"
        >
          <Shield color="#fff" size={28} />
          <Text className="text-white font-bold text-sm mt-2">SOS Alert</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(drawer)/profile')}
          className="flex-1 bg-indigo-500 rounded-2xl p-5 items-center justify-center active:bg-indigo-600"
        >
          <Text className="text-white text-2xl font-black">{displayRole[0]}</Text>
          <Text className="text-white font-bold text-sm mt-2">{displayRole}</Text>
        </Pressable>
      </View>

      {/* Referral Code */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Referral Code</Text>
        <View className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 mb-3">
          <Text className="font-mono text-indigo-600 font-bold text-base">{referralCode || 'Loading...'}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={handleCopyLink}
            className="flex-1 flex-row items-center justify-center gap-2 bg-indigo-600 py-3 rounded-xl active:bg-indigo-700"
          >
            {copied ? <CheckCircle2 color="#fff" size={16} /> : <Copy color="#fff" size={16} />}
            <Text className="text-white font-bold text-xs">{copied ? 'Copied!' : 'Copy Link'}</Text>
          </Pressable>
          <Pressable
            onPress={handleNativeShare}
            className="flex-row items-center justify-center gap-2 bg-slate-900 px-5 py-3 rounded-xl active:bg-slate-800"
          >
            <Share2 color="#fff" size={16} />
          </Pressable>
        </View>

        {/* Social Share */}
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={handleShareWhatsApp}
            className="flex-1 flex-row items-center justify-center gap-2 bg-green-500 py-3 rounded-xl active:bg-green-600"
          >
            <MessageCircle color="#fff" size={16} />
            <Text className="text-white font-bold text-xs">WhatsApp</Text>
          </Pressable>
          <Pressable
            onPress={handleShareEmail}
            className="flex-1 flex-row items-center justify-center gap-2 bg-blue-500 py-3 rounded-xl active:bg-blue-600"
          >
            <Mail color="#fff" size={16} />
            <Text className="text-white font-bold text-xs">Email</Text>
          </Pressable>
        </View>
      </View>

      {/* User Info Card */}
      <View className="bg-white mx-4 mt-4 mb-8 rounded-2xl p-5 border border-slate-100 shadow-sm">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Information</Text>
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Phone" value={user?.phone} />
        <InfoRow label="Emergency Contact" value={user?.emergencyContact} valueColor="text-rose-600" />
        <InfoRow label="City" value={user?.city} />
        <InfoRow label="Role" value={displayRole} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, valueColor = "text-slate-900" }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-slate-50">
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</Text>
      <Text className={`font-medium text-sm ${valueColor}`}>{value}</Text>
    </View>
  );
}
