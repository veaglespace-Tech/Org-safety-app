import React from 'react';
import { View, ViewProps, StyleSheet, useWindowDimensions } from 'react-native';

interface ResponsiveContainerProps extends ViewProps {
  maxWidth?: number;
  children: React.ReactNode;
}

/**
 * ResponsiveContainer wraps page content and constrains its maximum width
 * on larger screens (such as iPad Air 11-inch, iPad Pro, and tablets),
 * centering the content and providing sensible padding so the UI does not
 * stretch awkwardly or display cramped multi-column cards.
 */
export function ResponsiveContainer({
  maxWidth = 720,
  children,
  style,
  ...props
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View
      style={[
        styles.wrapper,
        isTablet && styles.tabletWrapper,
      ]}
    >
      <View
        style={[
          styles.container,
          { maxWidth },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  tabletWrapper: {
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
  },
});
