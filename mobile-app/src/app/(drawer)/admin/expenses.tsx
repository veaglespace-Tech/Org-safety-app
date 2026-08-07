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
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Receipt,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
} from 'lucide-react-native';

export default function AdminExpensesScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); // 'TRANSACTIONS' | 'CLAIMS'
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // Form states
  const [txnType, setTxnType] = useState('EXPENSE'); // 'EXPENSE' | 'DEPOSIT'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [receiptBase64, setReceiptBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // In-memory demo/storage state for dynamic transactions & claims
  const [transactions, setTransactions] = useState([
    {
      id: 'txn-1',
      type: 'DEPOSIT',
      amount: 50000,
      category: 'Sponsorship',
      description: 'Festival Sponsorship Fund',
      date: '2026-08-01',
    },
    {
      id: 'txn-2',
      type: 'EXPENSE',
      amount: 12500,
      category: 'Instruments',
      description: 'Dhol leather replacement & repair',
      date: '2026-08-02',
    },
    {
      id: 'txn-3',
      type: 'EXPENSE',
      amount: 4500,
      category: 'Refreshments',
      description: 'Practice session water & snacks',
      date: '2026-08-03',
    },
  ]);

  const [claims, setClaims] = useState([
    {
      id: 'claim-1',
      userName: 'Akshay Shinde',
      amount: 1800,
      category: 'Travel',
      description: 'Transport for Dhwaja delivery',
      date: '2026-08-02',
      status: 'PENDING',
    },
  ]);

  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalDeposits - totalExpenses;

  const handlePickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setReceiptBase64(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const handleCreateTransaction = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !description.trim()) {
      Alert.alert('Required', 'Please enter a valid amount and description.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newTxn = {
        id: `txn-${Date.now()}`,
        type: txnType,
        amount: num,
        category,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
      };
      setTransactions([newTxn, ...transactions]);
      setRecordModalOpen(false);
      setAmount('');
      setDescription('');
      setReceiptBase64('');
      setSubmitting(false);
      Alert.alert('Recorded', `${txnType} of ₹${num.toLocaleString()} recorded.`);
    }, 400);
  };

  const handleApproveClaim = (claimId, amt) => {
    setClaims(
      claims.map((c) => (c.id === claimId ? { ...c, status: 'APPROVED' } : c))
    );
    // Automatically record as expense
    const newTxn = {
      id: `txn-${Date.now()}`,
      type: 'EXPENSE',
      amount: amt,
      category: 'Reimbursement',
      description: `Settled claim #${claimId}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions([newTxn, ...transactions]);
    Alert.alert('Claim Approved', 'Claim has been settled and added to expenses.');
  };

  const handleRejectClaim = (claimId) => {
    setClaims(
      claims.map((c) => (c.id === claimId ? { ...c, status: 'REJECTED' } : c))
    );
    Alert.alert('Claim Rejected', 'Reimbursement claim was rejected.');
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Hero Fund Balance Card */}
      <View className="bg-slate-900 mx-4 mt-4 rounded-3xl p-6 shadow-md">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Org Fund Balance
            </Text>
            <Text className="text-white text-3xl font-black mt-1">
              ₹{currentBalance.toLocaleString()}
            </Text>
          </View>
          <Pressable
            onPress={() => setRecordModalOpen(true)}
            className="p-3 bg-indigo-600 rounded-2xl active:bg-indigo-700 flex-row items-center gap-1.5"
          >
            <Plus color="#ffffff" size={16} />
            <Text className="text-white font-bold text-xs">Record</Text>
          </Pressable>
        </View>

        {/* Deposit & Expense stats */}
        <View className="flex-row mt-6 gap-3 pt-4 border-t border-slate-800">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-xl bg-emerald-500/20 items-center justify-center">
              <ArrowDownLeft color="#10b981" size={18} />
            </View>
            <View>
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Total Inflow</Text>
              <Text className="text-white font-extrabold text-xs">
                ₹{totalDeposits.toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-xl bg-rose-500/20 items-center justify-center">
              <ArrowUpRight color="#f43f5e" size={18} />
            </View>
            <View>
              <Text className="text-slate-400 text-[10px] uppercase font-bold">Total Outflow</Text>
              <Text className="text-white font-extrabold text-xs">
                ₹{totalExpenses.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mx-4 mt-5">
        <Pressable
          onPress={() => setActiveTab('TRANSACTIONS')}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'TRANSACTIONS' ? 'bg-white shadow-xs' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'TRANSACTIONS' ? 'text-indigo-600' : 'text-slate-600'
            }`}
          >
            Transactions ({transactions.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('CLAIMS')}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'CLAIMS' ? 'bg-white shadow-xs' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === 'CLAIMS' ? 'text-indigo-600' : 'text-slate-600'
            }`}
          >
            Member Claims ({claims.filter((c) => c.status === 'PENDING').length})
          </Text>
        </Pressable>
      </View>

      {/* Tab Contents */}
      <ScrollView className="flex-1 px-4 pt-3">
        {activeTab === 'TRANSACTIONS' ? (
          transactions.map((txn) => {
            const isDeposit = txn.type === 'DEPOSIT';
            return (
              <View
                key={txn.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-xs flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      isDeposit ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft color="#059669" size={20} />
                    ) : (
                      <ArrowUpRight color="#e11d48" size={20} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                      {txn.description}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {txn.category} • {txn.date}
                    </Text>
                  </View>
                </View>

                <Text
                  className={`font-black text-sm ${
                    isDeposit ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isDeposit ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </Text>
              </View>
            );
          })
        ) : claims.length === 0 ? (
          <View className="py-16 items-center">
            <Receipt color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No pending claims</Text>
          </View>
        ) : (
          claims.map((claim) => (
            <View
              key={claim.id}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-slate-900 font-extrabold text-base">{claim.userName}</Text>
                  <Text className="text-slate-400 text-xs">
                    {claim.category} • {claim.date}
                  </Text>
                </View>
                <Text className="text-indigo-600 font-black text-lg">
                  ₹{claim.amount.toLocaleString()}
                </Text>
              </View>

              <Text className="text-slate-600 text-xs mb-4">{claim.description}</Text>

              {claim.status === 'PENDING' ? (
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => handleRejectClaim(claim.id)}
                    className="flex-1 py-2.5 rounded-xl items-center justify-center bg-rose-50 border border-rose-200 active:bg-rose-100 flex-row gap-1"
                  >
                    <XCircle color="#e11d48" size={16} />
                    <Text className="text-rose-600 font-bold text-xs">Reject</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleApproveClaim(claim.id, claim.amount)}
                    className="flex-1 py-2.5 rounded-xl items-center justify-center bg-emerald-600 active:bg-emerald-700 flex-row gap-1"
                  >
                    <CheckCircle2 color="#fff" size={16} />
                    <Text className="text-white font-bold text-xs">Settle & Pay</Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  className={`py-1.5 rounded-xl items-center ${
                    claim.status === 'APPROVED' ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs ${
                      claim.status === 'APPROVED' ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {claim.status}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Record Expense/Deposit Modal */}
      <Modal visible={recordModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Record Transaction</Text>
              <Pressable onPress={() => setRecordModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            {/* Type selector */}
            <View className="flex-row gap-2 mb-4">
              <Pressable
                onPress={() => setTxnType('EXPENSE')}
                className={`flex-1 py-3 rounded-2xl items-center border ${
                  txnType === 'EXPENSE'
                    ? 'bg-rose-50 border-rose-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    txnType === 'EXPENSE' ? 'text-rose-600' : 'text-slate-600'
                  }`}
                >
                  Expense / Outflow
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTxnType('DEPOSIT')}
                className={`flex-1 py-3 rounded-2xl items-center border ${
                  txnType === 'DEPOSIT'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    txnType === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-600'
                  }`}
                >
                  Deposit / Inflow
                </Text>
              </Pressable>
            </View>

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Amount (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-black text-lg mb-3"
            />

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Category</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Refreshments, Instruments, Travel"
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
            />

            <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Notes on this transaction..."
              className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-4"
            />

            <Pressable
              onPress={handleCreateTransaction}
              disabled={submitting}
              className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-extrabold text-base">Save Transaction</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
