import React, { useState } from 'react';
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
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  Receipt,
  Plus,
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react-native';

export default function MemberExpensesScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [description, setDescription] = useState('');
  const [receiptBase64, setReceiptBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [myClaims, setMyClaims] = useState([
    {
      id: 'claim-1',
      amount: 1800,
      category: 'Travel',
      description: 'Transport for Dhwaja delivery',
      date: '2026-08-02',
      status: 'PENDING',
    },
  ]);

  const handlePickReceipt = async () => {
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setReceiptBase64(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const handleSubmitClaim = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !description.trim()) {
      Alert.alert('Required', 'Please enter a valid amount and description.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newClaim = {
        id: `claim-${Date.now()}`,
        amount: num,
        category,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING',
      };
      setMyClaims([newClaim, ...myClaims]);
      setClaimModalOpen(false);
      setAmount('');
      setDescription('');
      setReceiptBase64('');
      setSubmitting(false);
      Alert.alert('Submitted', 'Reimbursement claim submitted to admin for approval.');
    }, 400);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-slate-900">Expense Claims</Text>
          <Text className="text-slate-500 text-xs mt-0.5">Submit reimbursement requests</Text>
        </View>
        <Pressable
          onPress={() => setClaimModalOpen(true)}
          className="p-2.5 bg-indigo-600 rounded-xl active:bg-indigo-700 flex-row items-center gap-1"
        >
          <Plus color="#ffffff" size={16} />
          <Text className="text-white font-bold text-xs">New Claim</Text>
        </Pressable>
      </View>

      {/* Claims List */}
      <ScrollView className="flex-1 px-4 pt-3">
        {myClaims.length === 0 ? (
          <View className="py-16 items-center">
            <Receipt color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No reimbursement claims yet</Text>
          </View>
        ) : (
          myClaims.map((claim) => (
            <View
              key={claim.id}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-slate-900 font-extrabold text-base">{claim.category}</Text>
                  <Text className="text-slate-400 text-xs">{claim.date}</Text>
                </View>
                <Text className="text-indigo-600 font-black text-lg">
                  ₹{claim.amount.toLocaleString()}
                </Text>
              </View>

              <Text className="text-slate-600 text-xs mb-3">{claim.description}</Text>

              <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                <View className="flex-row items-center gap-1.5">
                  {claim.status === 'APPROVED' ? (
                    <CheckCircle2 color="#059669" size={16} />
                  ) : claim.status === 'REJECTED' ? (
                    <XCircle color="#e11d48" size={16} />
                  ) : (
                    <Clock color="#d97706" size={16} />
                  )}
                  <Text
                    className={`text-xs font-bold ${
                      claim.status === 'APPROVED'
                        ? 'text-emerald-700'
                        : claim.status === 'REJECTED'
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {claim.status === 'PENDING' ? 'Under Review' : claim.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Claim Submission Modal */}
      <Modal visible={claimModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Submit Expense Claim</Text>
              <Pressable onPress={() => setClaimModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Claim Amount (₹)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g. 1500"
                keyboardType="numeric"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-black text-lg mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Expense Category</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Travel, Refreshments, Material"
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Description & Reason</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Explain what the expense was for..."
                multiline
                numberOfLines={3}
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-4 h-24"
                textAlignVertical="top"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Receipt Photo</Text>
              <Pressable
                onPress={handlePickReceipt}
                className="bg-slate-100 border border-dashed border-slate-300 rounded-xl p-4 items-center justify-center mb-6"
              >
                {receiptBase64 ? (
                  <View className="items-center">
                    <CheckCircle2 color="#059669" size={24} />
                    <Text className="text-emerald-700 font-bold text-xs mt-1">Receipt Captured</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <Camera color="#94a3b8" size={24} />
                    <Text className="text-slate-500 font-bold text-xs mt-1">Take photo of bill/receipt</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleSubmitClaim}
                disabled={submitting}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Submit Claim</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
