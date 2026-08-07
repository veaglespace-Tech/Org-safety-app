import React from 'react';
import { View, ViewProps } from 'react-native';

interface SurfaceCardProps extends ViewProps {
  className?: string;
  variant?: 'default' | 'flat' | 'glow' | 'glass';
  children: React.ReactNode;
}

export function SurfaceCard({
  className = '',
  variant = 'default',
  style,
  children,
  ...props
}: SurfaceCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return 'bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800';
      case 'glow':
        return 'bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-xl shadow-indigo-500/10';
      case 'glass':
        return 'bg-white/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 shadow-lg';
      case 'default':
      default:
        return 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm';
    }
  };

  return (
    <View
      className={`rounded-3xl p-5 ${getVariantStyles()} ${className}`}
      style={[
        {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
