import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Building2,
  Copy,
  CheckCircle2,
  Shield,
  Settings,
  ChevronRight,
  Share2,
  User,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { BadgePill } from '@/components/ui/BadgePill';
import { AppFooter } from '@/components/layout/Footer';

export default function MemberDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);
  const { isDark } = useAppTheme();

  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

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
        message: `Join ${user?.organization?.name || user?.organizations?.name || 'our organization'} on the Tichi Suraksha Safety Portal!\nRegister here: ${referralLink}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const userName = user?.name || 'Member';
  const orgName = user?.organization?.name || user?.organizations?.name || 'ढोल - ताशा महासंघ';
  const photoUri = user?.profilePhoto || user?.profile_photo || user?.organization?.logo || user?.organizations?.logo;

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Member Profile & Organization Banner */}
      <View className="px-4 pt-5">
        <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 items-center justify-center overflow-hidden shrink-0">
              {photoUri && !imgError ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 64, height: 64 }}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User color={isDark ? '#60a5fa' : '#2563eb'} size={32} />
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex-1" numberOfLines={1}>
                  {userName}
                </Text>
                <BadgePill label="MEMBER" variant="member" size="sm" />
              </View>
              <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5" numberOfLines={1}>
                {orgName}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1 leading-relaxed" numberOfLines={2}>
                Welcome to your member portal. Access safety alerts and manage your organization profile.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Referral Box */}
      <View className="px-4 mt-4">
        <View className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl">
          <Text className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            SHARE YOUR REFERRAL CODE OR LINK
          </Text>

          {/* Referral Code Badge */}
          <View className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 self-start mb-3">
            <Text className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              CODE:{' '}
              <Text className="text-blue-600 dark:text-blue-400 font-mono font-black">
                {referralCode || 'REF-XXXXXXXX'}
              </Text>
            </Text>
          </View>

          {/* Referral Link Input Box */}
          <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 mb-3">
            <TextInput
              editable={false}
              value={referralLink || 'https://tichisuraksha.veaglespace.com/register'}
              className="text-slate-700 dark:text-slate-300 font-mono text-xs"
              numberOfLines={1}
            />
          </View>

          {/* Buttons */}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl shadow-lg shadow-blue-500/20"
            >
              {copied ? (
                <CheckCircle2 size={16} color="#ffffff" />
              ) : (
                <Copy size={16} color="#ffffff" />
              )}
              <Text className="text-white font-bold text-xs">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.8}
              className="flex-row items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700"
            >
              <Share2 size={16} color={isDark ? '#ffffff' : '#334155'} />
              <Text className="text-slate-800 dark:text-white font-bold text-xs">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* 4. Footer Component */}
      <View className="px-4 mt-auto">
        <AppFooter />
      </View>
    </ScrollView>
  );
}
