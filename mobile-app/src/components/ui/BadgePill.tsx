import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'amber'
  | 'admin'
  | 'member'
  | 'leader'
  | 'active';

interface BadgePillProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export function BadgePill({
  label,
  variant = 'primary',
  size = 'md',
  className = '',
  style,
  ...props
}: BadgePillProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'admin':
        return { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' };
      case 'leader':
        return { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' };
      case 'member':
        return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' };
      case 'success':
      case 'active':
        return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' };
      case 'warning':
      case 'amber':
        return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' };
      case 'error':
        return { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' };
      case 'info':
        return { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300' };
      case 'purple':
        return { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', text: 'text-fuchsia-700 dark:text-fuchsia-300' };
      case 'secondary':
        return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
      case 'primary':
      default:
        return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' };
    }
  };

  const { bg, text } = getBadgeStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <View
      className={`self-start rounded-full ${bg} ${sizeClasses} ${className}`}
      style={style}
      {...props}
    >
      <Text className={`font-black uppercase tracking-wider ${text}`}>
        {label}
      </Text>
    </View>
  );
}
