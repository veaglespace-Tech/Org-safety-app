import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Phone, ChevronDown, Check, X } from 'lucide-react-native';
import { COUNTRY_PHONE_OPTIONS, getDefaultCountryCode } from '@/utils/phone';

interface CountryPhoneFieldProps {
  label?: string;
  countryCode?: string;
  phone?: string;
  onCountryCodeChange?: (code: string) => void;
  onPhoneChange?: (text: string) => void;
  phonePlaceholder?: string;
  countryCodeError?: string;
  phoneError?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export function CountryPhoneField({
  label = 'Mobile Number',
  countryCode = '+91',
  phone = '',
  onCountryCodeChange,
  onPhoneChange,
  phonePlaceholder = '9876543210',
  countryCodeError = '',
  phoneError = '',
  helpText = '',
  disabled = false,
  required = false,
  containerClassName = '',
}: CountryPhoneFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const activeCode = getDefaultCountryCode(countryCode);
  const hasError = Boolean(countryCodeError || phoneError);

  const selectedOption = COUNTRY_PHONE_OPTIONS.find((item) => item.code === activeCode) || {
    label: 'India',
    code: '+91',
    iso: 'IN',
  };

  const handleSelectCountry = (code: string) => {
    onCountryCodeChange?.(code);
    setModalVisible(false);
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-bold text-slate-700 mb-1.5 ml-1">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <View
        className={`flex-row items-center bg-white border-2 rounded-2xl overflow-hidden transition-all ${
          hasError
            ? 'border-red-400 bg-red-50/20'
            : 'border-slate-200 focus:border-blue-600'
        }`}
      >
        <View className="pl-3.5 pr-2 py-3">
          <Phone size={18} color={hasError ? '#ef4444' : '#64748b'} />
        </View>

        {/* Country Code Trigger */}
        <TouchableOpacity
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
          className="flex-row items-center border-r border-slate-200 pr-3 pl-1 py-3 gap-1"
        >
          <Text className="text-xs font-bold text-slate-900">
            {selectedOption.iso} {selectedOption.code}
          </Text>
          <ChevronDown size={14} color="#64748b" />
        </TouchableOpacity>

        {/* Phone Input */}
        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          placeholder={phonePlaceholder}
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          editable={!disabled}
          className="flex-1 px-3 py-3 text-slate-900 font-medium text-sm"
        />
      </View>

      {hasError ? (
        <Text className="text-red-500 text-xs font-medium mt-1 ml-1">
          {phoneError || countryCodeError}
        </Text>
      ) : helpText ? (
        <Text className="text-slate-400 text-xs font-medium mt-1 ml-1">
          {helpText}
        </Text>
      ) : null}

      {/* Country Code Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row justify-between items-center pb-4 border-b border-slate-100 mb-2">
              <Text className="text-lg font-bold text-slate-900">Select Country Code</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRY_PHONE_OPTIONS}
              keyExtractor={(item) => `${item.iso}-${item.code}`}
              renderItem={({ item }) => {
                const isSelected = item.code === activeCode;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectCountry(item.code)}
                    className={`flex-row justify-between items-center p-3.5 rounded-xl mb-1 ${
                      isSelected ? 'bg-blue-50' : 'active:bg-slate-50'
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View className="w-8 h-6 bg-slate-100 rounded items-center justify-center border border-slate-200">
                        <Text className="text-[11px] font-bold text-slate-700">{item.iso}</Text>
                      </View>
                      <Text className="text-sm font-semibold text-slate-800">{item.label}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-blue-600 font-mono">{item.code}</Text>
                      {isSelected && <Check size={16} color="#2563eb" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
