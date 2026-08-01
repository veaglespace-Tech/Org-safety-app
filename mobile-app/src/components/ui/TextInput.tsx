import React from 'react';
import { TextInput as RNTextInput, TextInputProps, View, Text } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function TextInput({ 
  label, 
  error, 
  className, 
  containerClassName,
  ...props 
}: InputProps) {
  
  return (
    <View className={twMerge('w-full mb-4', containerClassName)}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <RNTextInput
        className={twMerge(
          'w-full h-12 px-4 bg-gray-50 border rounded-lg text-gray-900',
          error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500',
          className
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
