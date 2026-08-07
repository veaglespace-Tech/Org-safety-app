import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

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
        return 'bg-slate-50 border border-slate-200/80';
      case 'glow':
        return 'bg-white border border-indigo-100 shadow-xl shadow-indigo-500/10';
      case 'glass':
        return 'bg-white/90 border border-slate-200/60 shadow-lg';
      case 'default':
      default:
        return 'bg-white border border-slate-200/70 shadow-sm';
    }
  };

  return (
    <View
      className={`rounded-3xl p-5 ${getVariantStyles()} ${className}`}
      style={[
        {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
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
