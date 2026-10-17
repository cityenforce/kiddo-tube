// src/app/providers/AppProviders.tsx

import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { setTokenProvider } from '../../services/api';
import { useContentStore } from '../../store/contentStore';
import { useParentAdminStore } from '../../store/parentAdminStore';

/**
 * AppProviders
 * Wraps the app with all context providers
 * 
 * - SafeAreaProvider: notch/status bar handling
 * - ThemeProvider: colors/typography/dimensions
 * - Token wiring: injects auth token into API client
 * 
 * Wires the token provider before rendering screens that make API requests.
 */

interface AppProvidersProps {
  children: ReactNode;
  isNightMode?: boolean;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  isNightMode,
}) => {
  // Wire token provider once — synchronously, before render
  setTokenProvider(() => {
    // Priority: admin > parent > child
    const adminToken = useParentAdminStore.getState().adminToken;
    const parentToken = useParentAdminStore.getState().parentToken;
    const childToken = useContentStore.getState().childToken;
    return adminToken ?? parentToken ?? childToken ?? null;
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider isNightMode={isNightMode}>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
};