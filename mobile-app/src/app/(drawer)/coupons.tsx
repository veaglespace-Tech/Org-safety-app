import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Ticket,
  Copy,
  CheckCircle2,
  Percent,
  Sparkles,
} from 'lucide-react-native';

export default function CouponsScreen() {
  const coupons = [
    {
      id: 'c-1',
      code: 'SAFETY10',
      discount: '10% OFF',
      description: 'Applicable on organization subscription renewals & upgrades',
      expiry: '2026-12-31',
    },
    {
      id: 'c-2',
      code: 'DHOL2026',
      discount: '15% OFF',
      description: 'Exclusive festival discount for partner organizations',
      expiry: '2026-10-30',
    },
  ];

  const handleCopy = async (code) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Coupon code "${code}" copied to clipboard.`);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-slate-900 mx-4 mt-4 rounded-3xl p-6 shadow-md">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl bg-indigo-500/20 items-center justify-center">
            <Ticket color="#818cf8" size={24} />
          </View>
          <View>
            <Text className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Referral Rewards
            </Text>
            <Text className="text-white text-xl font-black">Partner Coupons</Text>
          </View>
        </View>
      </View>

      {/* Coupons List */}
      <View className="mx-4 mt-4 space-y-3">
        {coupons.map((c) => (
          <View
            key={c.id}
            className="bg-white rounded-3xl p-5 border border-dashed border-indigo-200 shadow-xs"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="bg-indigo-600 px-3 py-1 rounded-xl">
                <Text className="text-white font-black text-sm tracking-wider">{c.code}</Text>
              </View>
              <Text className="text-emerald-600 font-black text-base">{c.discount}</Text>
            </View>

            <Text className="text-slate-600 text-xs mt-2 mb-4 leading-5">{c.description}</Text>

            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
              <Text className="text-slate-400 text-[10px]">Valid till {c.expiry}</Text>

              <Pressable
                onPress={() => handleCopy(c.code)}
                className="flex-row items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl active:bg-indigo-100"
              >
                <Copy color="#4f46e5" size={14} />
                <Text className="text-indigo-600 font-bold text-xs">Copy Code</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <View className="h-10" />
    </ScrollView>
  );
}
