// src/app/config/env.ts

import { Platform } from 'react-native';

/**
 * KidsStream Environment Configuration
 * Migrated from Kotlin ApiClient.kt
 * 
 * Handles the critical React Native localhost problem:
 * - Android Emulator: `10.0.2.2` maps to host machine's localhost
 * - iOS Simulator: `localhost` works directly
 * - Physical Device: Use your computer's LAN IP
 */

// Original Kotlin URLs (preserved for reference)
export const DEV_EMULATOR_BASE_URL = 'http://10.0.2.2:4000/';
export const DEV_LOCALHOST_BASE_URL = 'http://127.0.0.1:4000/';
export const PRODUCTION_CLOUD_BASE_URL =
  'https://ais-dev-jikcox2ra6y7i7pgcwl5hu-593908721251.asia-southeast1.run.app/';

/**
 * Get the correct base URL based on platform and environment
 * This replaces the Kotlin @Volatile activeBaseUrl logic
 */
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to reach host machine
      return DEV_EMULATOR_BASE_URL;
    }
    // iOS simulator uses localhost directly
    return DEV_LOCALHOST_BASE_URL;
  }
  // Production mode
  return PRODUCTION_CLOUD_BASE_URL;
};

/**
 * Active base URL — can be overridden at runtime
 * Replaces Kotlin's mutable activeBaseUrl
 */
let activeBaseUrl: string = getApiBaseUrl();

export const getActiveBaseUrl = (): string => activeBaseUrl;

export const setBaseUrl = (newUrl: string): void => {
  activeBaseUrl = newUrl.endsWith('/') ? newUrl : `${newUrl}/`;
};

/**
 * API configuration constants
 * Maps to Kotlin OkHttpClient timeouts
 */
export const API_CONFIG = {
  connectTimeout: 15000, // 15 seconds for reliable cloud DB queries
  readTimeout: 15000,    // 15 seconds
  writeTimeout: 15000,   // 15 seconds
} as const;