import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export function TextInput({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  isPassword,
  required,
  className,
  containerClassName,
  secureTextEntry,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View className={twMerge('w-full mb-4', containerClassName)}>
      {label && (
        <Text className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <View
        className={twMerge(
          'flex-row items-center bg-white dark:bg-slate-900/90 border-2 rounded-2xl overflow-hidden transition-all',
          error
            ? 'border-red-400 bg-red-50/20 dark:border-red-500 dark:bg-red-950/20'
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500'
        )}
      >
        {leftIcon && <View className="pl-3.5 pr-2 py-3">{leftIcon}</View>}

        <RNTextInput
          className={twMerge(
            'flex-1 px-4 py-3 text-slate-900 dark:text-white font-medium text-sm',
            leftIcon ? 'pl-1' : '',
            rightIcon || isPassword ? 'pr-2' : '',
            className
          )}
          placeholderTextColor="#94a3b8"
          secureTextEntry={isSecure}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-3.5 pl-2 py-3"
          >
            {showPassword ? (
              <EyeOff size={18} color="#94a3b8" />
            ) : (
              <Eye size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="pr-3.5 pl-2 py-3">{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text className="text-red-500 text-xs font-medium mt-1 ml-1">{error}</Text>
      ) : helpText ? (
        <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-1 ml-1">
          {helpText}
        </Text>
      ) : null}
    </View>
  );
}
