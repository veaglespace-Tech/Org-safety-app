import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  textClassName?: string;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className, 
  textClassName,
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseClasses = 'flex-row items-center justify-center rounded-lg active:opacity-80';
  
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    accent: 'bg-indigo-500',
    ghost: 'bg-transparent',
    outline: 'bg-transparent border border-gray-300',
    error: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 h-8',
    md: 'px-4 py-2.5 h-12',
    lg: 'px-6 py-4 h-16',
  };

  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    accent: 'text-white font-semibold',
    ghost: 'text-gray-700 font-medium',
    outline: 'text-gray-700 font-medium',
    error: 'text-white font-semibold',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || isLoading) ? 'opacity-50' : '',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#374151' : '#ffffff'} className="mr-2" />
      ) : null}
      
      {typeof children === 'string' ? (
        <Text className={twMerge(textVariantClasses[variant], textSizeClasses[size], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
