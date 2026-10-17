// src/services/storage/secureStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure Storage Wrapper
 * Handles persistence of auth tokens and session data
 * 
 * Note: AsyncStorage is not encrypted by default.
 * For production, replace with react-native-keychain or expo-secure-store.
 * Kept simple here to match Kotlin's in-memory token behavior + restart persistence.
 */

const KEYS = {
  CHILD_TOKEN: '@kidsstream/child_token',
  PARENT_TOKEN: '@kidsstream/parent_token',
  ADMIN_TOKEN: '@kidsstream/admin_token',
} as const;

class SecureStorage {
  async setChildToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CHILD_TOKEN, token);
    } catch (e) {
      console.warn('[SecureStorage] Failed to persist child token:', e);
    }
  }

  async getChildToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.CHILD_TOKEN);
    } catch {
      return null;
    }
  }

  async clearChildToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.CHILD_TOKEN);
    } catch {}
  }

  async setParentToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PARENT_TOKEN, token);
    } catch (e) {
      console.warn('[SecureStorage] Failed to persist parent token:', e);
    }
  }

  async getParentToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.PARENT_TOKEN);
    } catch {
      return null;
    }
  }

  async clearParentToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.PARENT_TOKEN);
    } catch {}
  }

  async setAdminToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ADMIN_TOKEN, token);
    } catch (e) {
      console.warn('[SecureStorage] Failed to persist admin token:', e);
    }
  }

  async getAdminToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.ADMIN_TOKEN);
    } catch {
      return null;
    }
  }

  async clearAdminToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.ADMIN_TOKEN);
    } catch {}
  }

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        KEYS.CHILD_TOKEN,
        KEYS.PARENT_TOKEN,
        KEYS.ADMIN_TOKEN,
      ].map((key) => AsyncStorage.removeItem(key)));
    } catch (e) {
      console.warn('[SecureStorage] Failed to clear tokens:', e);
    }
  }
}

export const secureStorage = new SecureStorage();