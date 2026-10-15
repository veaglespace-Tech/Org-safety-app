import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  MapPin,
  Shield,
  ShieldAlert,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Radio,
} from 'lucide-react-native';

export type DisclosureType =
  | 'foreground_location'
  | 'background_location'
  | 'camera'
  | 'media_library';

interface ProminentDisclosureModalProps {
  visible: boolean;
  type: DisclosureType;
  onAccept: () => void;
  onDecline: () => void;
  isDark?: boolean;
}

export function ProminentDisclosureModal({
  visible,
  type,
  onAccept,
  onDecline,
  isDark = false,
}: ProminentDisclosureModalProps) {
  if (!visible) return null;

  const getContent = () => {
    switch (type) {
      case 'foreground_location':
        return {
          icon: <MapPin size={36} color="#f97316" />,
          badge: 'स्थान माहिती • LOCATION ACCESS',
          title: 'स्थान परवानगी आवश्यक\nLocation Permission Required',
          description: (
            <>
              <Text className="font-bold text-slate-900 dark:text-white">
                "तिची सुरक्षा" (Tichi Suraksha)
              </Text>{' '}
              collects <Text className="font-bold text-orange-600 dark:text-orange-400">location data</Text> to provide essential safety features:
            </>
          ),
          bullets: [
            'Sharing your real-time GPS coordinates with emergency contacts and authorities during an active SOS dispatch.',
            'Displaying your current coordinates on the safety dashboard so help can reach you quickly.',
            'Verifying location accuracy for distress alerts.',
          ],
          note: 'This location data is used strictly for your emergency safety and is never sold, shared with advertisers, or used for tracking unrelated to safety features.',
          acceptText: 'Allow Location • परवानगी द्या',
          declineText: 'Not Now • आत्ता नको',
          acceptColor: 'bg-orange-500',
        };

      case 'background_location':
        return {
          icon: <Radio size={36} color="#ef4444" />,
          badge: 'BACKGROUND LOCATION PERMISSION',
          title: 'Background Location Access',
          description: (
            <Text className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-relaxed text-center">
              TichiSuraksha collects location data to enable the SOS emergency tracking and live location sharing features even when the app is closed or not in use.
            </Text>
          ),
          bullets: [
            'Continues sending live GPS updates to your emergency contacts even if your phone screen turns off or the app is minimized.',
            'Ensures responders receive continuous location updates while an SOS is active.',
            'Tracking runs only during an active SOS alert and displays an ongoing notification.',
          ],
          note: 'Selecting "Agree" will open the Android system dialog. Please select "Allow all the time" for continuous protection during an emergency.',
          acceptText: 'Agree',
          declineText: 'No Thanks',
          acceptColor: 'bg-rose-600',
        };

      case 'camera':
        return {
          icon: <Camera size={36} color="#3b82f6" />,
          badge: 'कॅमेरा • CAMERA ACCESS',
          title: 'कॅमेरा परवानगी आवश्यक\nCamera Permission Required',
          description: (
            <>
              <Text className="font-bold text-slate-900 dark:text-white">
                "तिची सुरक्षा" (Tichi Suraksha)
              </Text>{' '}
              requires access to your device camera:
            </>
          ),
          bullets: [
            'To capture a real-time selfie photo for attendance identity verification.',
            'Ensures member authenticity and safety records within your organization.',
          ],
          note: 'Camera access is only activated when you explicitly initiate selfie capture and is never accessed without your consent.',
          acceptText: 'Allow Camera • कॅमेरा सुरू करा',
          declineText: 'Cancel • रद्द करा',
          acceptColor: 'bg-blue-600',
        };

      case 'media_library':
        return {
          icon: <ImageIcon size={36} color="#8b5cf6" />,
          badge: 'फोटो गॅलरी • PHOTO LIBRARY',
          title: 'फोटो गॅलरी परवानगी\nPhoto Library Access',
          description: (
            <>
              <Text className="font-bold text-slate-900 dark:text-white">
                "तिची सुरक्षा" (Tichi Suraksha)
              </Text>{' '}
              requires access to your photo library:
            </>
          ),
          bullets: [
            'To select and upload your profile picture for your verified member badge.',
            'To select and upload an organization logo for your dashboard header.',
          ],
          note: 'Only the specific photo you choose to upload is processed and saved.',
          acceptText: 'Allow Photos • फोटो निवडा',
          declineText: 'Cancel • रद्द करा',
          acceptColor: 'bg-purple-600',
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDecline}
    >
      <View
        className="flex-1 justify-center items-center px-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
      >
        <View className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Top Icon with Subtle Ring */}
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                {content.icon}
              </View>
              <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full mt-3 border border-slate-200 dark:border-slate-700">
                <Text className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {content.badge}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-lg font-black text-slate-900 dark:text-white text-center leading-snug mb-3">
              {content.title}
            </Text>

            {/* Description */}
            <Text className="text-slate-600 dark:text-slate-300 text-xs text-center leading-relaxed mb-3">
              {content.description}
            </Text>

            {/* Bullet Points */}
            <View className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-3.5 mb-3 border border-slate-100 dark:border-slate-800 space-y-2">
              {content.bullets.map((b, idx) => (
                <View key={idx} className="flex-row items-start gap-2">
                  <CheckCircle2 size={14} color="#10b981" className="mt-0.5 shrink-0" />
                  <Text className="text-slate-700 dark:text-slate-300 text-xs flex-1 leading-relaxed">
                    {b}
                  </Text>
                </View>
              ))}
            </View>

            {/* Policy Compliance Note */}
            <View className="bg-amber-500/10 rounded-xl p-2.5 mb-5 border border-amber-500/20">
              <Text className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed text-center font-medium">
                {content.note}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-2.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onAccept}
                className={`w-full ${content.acceptColor} py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/20 active:opacity-90`}
              >
                <Text className="text-white font-black text-sm tracking-wide text-center">
                  {content.acceptText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onDecline}
                className="w-full bg-slate-100 dark:bg-slate-800 py-3 rounded-2xl items-center justify-center border border-slate-200 dark:border-slate-700 active:bg-slate-200"
              >
                <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs tracking-wide text-center">
                  {content.declineText}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
