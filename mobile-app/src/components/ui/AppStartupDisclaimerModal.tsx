import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ShieldAlert,
  MapPin,
  Radio,
  Camera,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react-native';

const DISCLAIMER_STORAGE_KEY = '@tichi_suraksha_initial_disclaimer_accepted_v1';

interface AppStartupDisclaimerModalProps {
  isDark?: boolean;
}

export function AppStartupDisclaimerModal({ isDark = false }: AppStartupDisclaimerModalProps) {
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const accepted = await AsyncStorage.getItem(DISCLAIMER_STORAGE_KEY);
        if (accepted !== 'true') {
          setVisible(true);
        }
      } catch (err) {
        console.warn('Could not check startup disclaimer status:', err);
      } finally {
        setChecking(false);
      }
    };

    checkConsent();
  }, []);

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
      setVisible(false);
    } catch (err) {
      console.warn('Could not save startup disclaimer status:', err);
      setVisible(false);
    }
  };

  if (checking || !visible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        // Modal must be accepted to continue using the safety app
      }}
    >
      <View
        className="flex-1 justify-center items-center px-4 py-8"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }}
      >
        <View className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 max-h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Header Icon & Tag */}
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/40 items-center justify-center border-4 border-rose-100 dark:border-rose-900/40 shadow-inner">
                <ShieldAlert size={38} color="#f43f5e" />
              </View>
              <View className="bg-rose-100 dark:bg-rose-950/60 px-3.5 py-1.5 rounded-full mt-3 border border-rose-200 dark:border-rose-800/50">
                <Text className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  माहिती व सुरक्षा नियम • PRIVACY & DISCLAIMER
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-xl font-black text-slate-900 dark:text-white text-center leading-tight mb-1">
              तिची सुरक्षा (Tichi Suraksha)
            </Text>
            <Text className="text-xs font-semibold text-rose-600 dark:text-rose-400 text-center mb-4 tracking-wide">
              महिला सुरक्षा व आणीबाणी सहाय्य प्रणाली • Women Safety Platform
            </Text>

            {/* Intro App Info */}
            <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-center mb-4">
              &quot;तिची सुरक्षा&quot; हे ॲप महिलांच्या सुरक्षिततेसाठी आणि संकटसमयी त्वरित मदतीसाठी तयार करण्यात आले आहे. तुमच्या गोपनीयतेचा सन्मान ठेवून हे ॲप परवानग्या फक्त गरजेनुसारच वापरते.
            </Text>

            {/* Permissions Summary Section */}
            <View className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-800 space-y-3">
              <Text className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                ॲपमधील परवानग्या आणि त्यांची गरज • Required Permissions:
              </Text>

              {/* Foreground Location */}
              <View className="flex-row items-start gap-3">
                <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    १. स्थान (Location Permission)
                  </Text>
                  <Text className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    तुम्ही संकटसमयी SOS किंवा डॅशबोर्ड वापरताना तुमच्या तात्काळ GPS स्थानाची माहिती पोलीस व कुटुंबियांपर्यंत पोहोचवण्यासाठी.
                  </Text>
                </View>
              </View>

              {/* Background Location */}
              <View className="flex-row items-start gap-3">
                <View className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/40 items-center justify-center shrink-0 mt-0.5">
                  <Radio size={16} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    २. बॅकग्राउंड स्थान (Background Location)
                  </Text>
                  <Text className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    <Text className="font-semibold text-rose-600 dark:text-rose-400">फक्त सक्रिय SOS दरम्यान:</Text> फोनची स्क्रीन बंद असताना किंवा ॲप मिनिमाईज असतानाही तुमची लाईव्ह लोकेशन मदत मिळेपर्यंत अपडेट राहण्यासाठी.
                  </Text>
                </View>
              </View>

              {/* Camera & Photos */}
              <View className="flex-row items-start gap-3">
                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/40 items-center justify-center shrink-0 mt-0.5">
                  <Camera size={16} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ३. कॅमेरा (Camera Access)
                  </Text>
                  <Text className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                    केवळ अटेंडन्स सेल्फी आणि ओळख पडताळणी (Face Check-in) साठीच कॅमेऱ्याचा वापर होतो.
                  </Text>
                </View>
              </View>
            </View>

            {/* Transparent Promise Box */}
            <View className="bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl p-3.5 mb-5 border border-emerald-500/25 space-y-1.5">
              <View className="flex-row items-center gap-2">
                <Lock size={15} color="#10b981" />
                <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  पारदर्शकता आणि गोपनीयता हमी • Our Safety Promise
                </Text>
              </View>
              <Text className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                • या सर्व परवानग्या आताच चालू होणार नाहीत. जेव्हा तुम्ही संबंधित फिचर वापराल तेव्हाच स्वतंत्रपणे विचारल्या जातील.
              </Text>
              <Text className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                • तुमचा डेटा कधीही विकला जात नाही किंवा जाहिरातींसाठी वापरला जात नाही.
              </Text>
            </View>

            {/* Accept Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAccept}
              className="w-full bg-rose-600 active:bg-rose-700 py-4 rounded-2xl items-center justify-center shadow-lg shadow-rose-600/30 flex-row gap-2"
            >
              <Text className="text-white font-black text-sm tracking-wide">
                मला समजले आणि मान्य आहे • I Understand & Accept
              </Text>
              <ChevronRight size={18} color="#ffffff" />
            </TouchableOpacity>

            <Text className="text-[10px] text-slate-400 text-center mt-3 font-medium">
              Version 1.0.2 • Tichi Suraksha Organization Safety
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
