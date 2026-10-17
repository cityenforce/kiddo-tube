// src/app/navigation/navigationRef.ts

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { ScreenState } from '../../types/navigation';

/**
 * Navigation Reference
 * Allows imperative navigation from anywhere (non-React contexts)
 * Maps Kotlin's `currentScreen = ScreenState.X` pattern
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <
  T extends keyof RootStackParamList
>(
  screen: T,
  params?: RootStackParamList[T]
): void => {
  if (navigationRef.isReady()) {
    // @ts-ignore — RN Navigation types are strict here
    navigationRef.navigate(screen, params);
  }
};

export const goBack = (): void => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

export const resetToChildLogin = (): void => {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: ScreenState.CHILD_LOGIN }],
    });
  }
};

export const resetToParentPanel = (): void => {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: ScreenState.PARENT_PANEL }],
    });
  }
};