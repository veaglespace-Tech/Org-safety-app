import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string | number;
}

export function ActionModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: ActionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/60">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="bg-white rounded-t-[2.5rem] max-h-[85%] overflow-hidden border-t border-slate-100 shadow-2xl"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <View className="flex-1 pr-4">
                  <Text className="text-xl font-extrabold text-slate-900">{title}</Text>
                  {subtitle && (
                    <Text className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
                >
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                className="px-6 py-4"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
                <View className="h-8" />
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
