// src/features/auth/ChildLoginScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Dimensions } from '../../theme/dimensions';
import { hexLongToColor } from '../../utils/color';
import { useContentStore } from '../../store/contentStore';
import { useScreenTimeStore } from '../../store/screenTimeStore';
import { KiddoTubeLogo } from '../../components/branding';
import { ScreenState } from '../../types/navigation';
import type { RootStackParamList } from '../../types/navigation';
import type { ChildProfile } from '../../types/models';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * ChildLoginScreen
 * Migrated 1:1 from Kotlin ChildLoginScreen.kt
 * 
 * Uses navigation prop for stack behavior.
 * onParentSettingsClick is passed via navigation params (optional prop).
 */

type ChildLoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  ScreenState.CHILD_LOGIN
> & {
  onParentSettingsClick?: () => void;
};

export const ChildLoginScreen: React.FC<ChildLoginScreenProps> = ({
  navigation,
  onParentSettingsClick,
}) => {
  const childProfiles = useContentStore((s) => s.childProfiles);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    useContentStore.getState().initializeAppData();

    const unsubscribe = navigation.addListener('focus', () => {
      useContentStore.getState().initializeAppData();
    });
    return unsubscribe;
  }, [navigation]);

  const executeLogin = async (
    userToAuth: string,
    passToAuth: string,
    profileId: string | null
  ) => {
    const cleanUser = userToAuth.trim();
    const cleanPass = passToAuth.trim();

    if (!cleanUser && !profileId) {
      setErrorMessage('Please choose your profile or enter your name! 🎈');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your secret password! 🔑');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await useContentStore
      .getState()
      .loginChild(cleanUser, cleanPass, profileId);

    setIsLoading(false);

    if (result.success) {
      const token = useContentStore.getState().getCurrentToken();
      const profile = useContentStore.getState().selectedProfile;
      if (token && profile) {
        try {
          await useScreenTimeStore
            .getState()
            .initializeForChild(
              token,
              profile.id,
              profile.parentId,
              profile.dailyLimitMinutes
            );
        } catch (stErr: any) {
          console.warn('[ChildLoginScreen] ScreenTime init notice:', stErr?.message);
        }
      }
      navigation.replace(ScreenState.HOME);
    } else {
      setErrorMessage(
        result.error ?? 'Incorrect password. Ask mom or dad for help!'
      );
    }
  };

  const handleProfileTap = (profile: ChildProfile) => {
    setSelectedProfileId(profile.id);
    setUsername(profile.username || profile.name);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.logoWrap}>
          <KiddoTubeLogo size="large" showTagline={true} />
        </View>

        <Text style={styles.greeting}>Who's watching today? 🎈</Text>

        <Text style={styles.profileLabel}>Tap Your Profile</Text>

        <View style={styles.profileRow}>
          {childProfiles.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            const bgColor = hexLongToColor(profile.colorHex);

            return (
              <TouchableOpacity
                key={profile.id}
                style={styles.profilePill}
                activeOpacity={0.85}
                onPress={() => handleProfileTap(profile)}
                testID={`profile_pill_${profile.name.toLowerCase()}`}
              >
                <View
                  style={[
                    styles.profileAvatar,
                    {
                      backgroundColor: bgColor,
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: isSelected
                        ? Colors.kidsPrimary
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.profileEmoji}>
                    {profile.avatarEmoji}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.profileName,
                    {
                      color: isSelected
                        ? Colors.kidsPrimary
                        : Colors.kidsTextPrimary,
                      fontWeight: isSelected ? '900' : '700',
                    },
                  ]}
                >
                  {profile.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.credentialsCard}>
          <Text style={styles.cardTitle}>Sign In With Your Account</Text>

          {/* Username Field with Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Explorer Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter child username (e.g. ali)"
              placeholderTextColor={Colors.kidsTextMuted}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                const clean = t.trim().toLowerCase();
                const matched = childProfiles.find(
                  (p) =>
                    p.name.toLowerCase() === clean ||
                    p.username?.toLowerCase() === clean
                );
                setSelectedProfileId(matched ? matched.id : null);
                setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              testID="username_input"
            />
          </View>

          {/* Password Field with Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Kids Secret Password *</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter password configured by parents"
                placeholderTextColor={Colors.kidsTextMuted}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrorMessage(null);
                }}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                testID="password_input"
                onSubmitEditing={() =>
                  executeLogin(username, password, selectedProfileId)
                }
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                accessibilityLabel="Toggle password visibility"
              >
                <MaterialIcons
                  name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={Colors.kidsTextMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={() =>
              executeLogin(username, password, selectedProfileId)
            }
            disabled={isLoading}
            testID="login_button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Let's Go! 🚀</Text>
            )}
          </TouchableOpacity>
        </View>

          <TouchableOpacity
            style={styles.parentEntry}
            activeOpacity={0.7}
            onPress={onParentSettingsClick}
            testID="parent_settings_access_button"
          >
            <MaterialIcons
              name="lock"
              size={16}
              color={Colors.kidsTextSecondary}
            />
            <Text style={styles.parentEntryText}>
              Parent? Create an account or sign in to add your child and set up
              safe videos.
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.kidsBackground },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Dimensions.spaceLarge,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.spaceMedium,
    marginBottom: 6,
  },
  greeting: {
    ...Typography.titleMedium,
    color: Colors.kidsTextSecondary,
    marginTop: 6,
  },
  profileLabel: {
    ...Typography.labelMedium,
    color: Colors.kidsTextMuted,
    fontWeight: '700',
    marginTop: Dimensions.spaceLarge,
  },
  profileRow: {
    flexDirection: 'row',
    marginTop: Dimensions.spaceSmall,
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  profilePill: { alignItems: 'center', padding: 4 },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: { fontSize: 30 },
  profileName: {
    ...Typography.labelMedium,
    marginTop: 4,
  },
  credentialsCard: {
    width: '100%',
    backgroundColor: Colors.kidsSurface,
    borderRadius: Dimensions.radiusLarge,
    padding: Dimensions.spaceLarge,
    marginTop: Dimensions.spaceLarge,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.kidsTextPrimary,
    marginBottom: Dimensions.spaceMedium,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.kidsTextPrimary,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: Dimensions.radiusSmall,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.kidsTextPrimary,
  },
  passwordWrap: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 6,
    right: 8,
    top: 0,
    bottom: 0,
    width: 42,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.kidsError,
    fontWeight: '600',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  loginButton: {
    width: '100%',
    height: Dimensions.touchTargetLarge,
    minHeight: 54,
    borderRadius: Dimensions.radiusPill,
    backgroundColor: Colors.kidsPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.spaceLarge,
  },
  loginButtonText: {
    ...Typography.titleMedium,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
    fontWeight: '800',
  },
  parentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Dimensions.spaceLarge,
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  parentEntryText: {
    ...Typography.labelMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.kidsTextSecondary,
    marginLeft: 6,
    fontWeight: '600',
    marginLeft: 8,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
});