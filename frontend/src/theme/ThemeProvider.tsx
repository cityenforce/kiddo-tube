// src/theme/ThemeProvider.tsx

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Typography } from './typography';
import { Dimensions } from './dimensions';

/**
 * KidsStream Theme Provider
 * Migrated from Kotlin Theme.kt
 * 
 * Supports:
 * - Light mode (default)
 * - Night mode (forced during Timeout lock)
 * - System color scheme detection
 */

export interface KidsTheme {
  isNightMode: boolean;
  colors: typeof Colors;
  typography: typeof Typography;
  dimensions: typeof Dimensions;
}

interface ThemeContextValue {
  theme: KidsTheme;
  toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Force night mode (used by TimeoutScreen lock)
   * When true, uses timeoutNight* colors
   */
  isNightMode?: boolean;
  /**
   * Follow system color scheme when isNightMode is undefined
   */
  followSystem?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  isNightMode,
  followSystem = false,
}) => {
  const systemColorScheme = useColorScheme();

  const effectiveNightMode = useMemo(() => {
    // Priority 1: Explicit isNightMode prop (Timeout lock)
    if (isNightMode !== undefined) {
      return isNightMode;
    }
    // Priority 2: Follow system (if enabled)
    if (followSystem && systemColorScheme === 'dark') {
      return true;
    }
    // Default: Light mode
    return false;
  }, [isNightMode, followSystem, systemColorScheme]);

  const theme: KidsTheme = useMemo(
    () => ({
      isNightMode: effectiveNightMode,
      colors: Colors,
      typography: Typography,
      dimensions: Dimensions,
    }),
    [effectiveNightMode]
  );

  return (
    <ThemeContext.Provider value={{ theme }}>
      <View
        style={[
          styles.root,
          {
            backgroundColor: effectiveNightMode
              ? Colors.timeoutNightBackground
              : Colors.kidsBackground,
          },
        ]}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

/**
 * Hook to access theme in any component
 * 
 * Usage:
 * const { theme } = useKidsTheme();
 * theme.colors.kidsPrimary
 * theme.typography.titleLarge
 * theme.dimensions.spaceMedium
 */
export const useKidsTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useKidsTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Convenience hook for accessing only colors
 */
export const useColors = () => {
  const { theme } = useKidsTheme();
  return theme.colors;
};

/**
 * Convenience hook for accessing only typography
 */
export const useTypography = () => {
  const { theme } = useKidsTheme();
  return theme.typography;
};

/**
 * Convenience hook for accessing only dimensions
 */
export const useDimensions = () => {
  const { theme } = useKidsTheme();
  return theme.dimensions;
};