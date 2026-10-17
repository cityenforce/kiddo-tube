// src/features/profile/ChildProfileScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Dimensions } from '../../theme/dimensions';

import { useContentStore } from '../../store/contentStore';
import { useScreenTimeStore } from '../../store/screenTimeStore';
import { hexLongToColor } from '../../utils/color';
import {
  computeUsedMinutes,
  computeProgress,
  formatUsageText,
} from '../../utils/formatTime';
import { ScreenState, ChildTab } from '../../types/navigation';
import {
  navigate,
  resetToChildLogin,
} from '../../app/navigation/navigationRef';
import { KidsBottomNavigation } from '../../components/layout/KidsBottomNavigation';

/**
 * ChildProfileScreen
 * Features:
 * - Red gradient YouTube Kids theme
 * - Main avatar with self-change support (child can customize emoji & color)
 * - Watch-time progress card
 * - Switch profile row
 * - Sign out button
 */

const AVATAR_EMOJIS = [
  '🚀', '🦁', '🎨', '⚽',
  '🦄', '🐼', '🎸', '🦖',
  '🐱', '🐶', '🦊', '🐻',
  '🐯', '🐸', '🐧', '🐬',
];

const AVATAR_COLORS = [
  0xff00a6fb, // Blue
  0xffff3366, // Red/Pink
  0xff10b981, // Emerald Green
  0xff8b5cf6, // Purple
  0xffffb703, // Amber
  0xff06b6d4, // Cyan
];

export const ChildProfileScreen: React.FC = () => {
  const profiles = useContentStore((s) => s.childProfiles);
  const selectedProfile = useContentStore((s) => s.selectedProfile);
  const selectProfile = useContentStore((s) => s.selectProfile);
  const logoutChild = useContentStore((s) => s.logoutChild);
  const updateCurrentChildAvatar = useContentStore(
    (s) => s.updateCurrentChildAvatar
  );

  const remainingMinutes = useScreenTimeStore((s) => s.remainingMinutes);
  const dailyLimitMinutes = useScreenTimeStore((s) => s.dailyLimitMinutes);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const usedMinutes = computeUsedMinutes(
    dailyLimitMinutes,
    remainingMinutes
  );
  const progress = computeProgress(usedMinutes, dailyLimitMinutes);

  const handleBack = () => {
    navigate(ScreenState.HOME);
  };

  const handleLogout = () => {
    logoutChild();
    useScreenTimeStore.getState().clearSession();
    resetToChildLogin();
  };

  const handleSelectNewAvatar = async (emoji: string, colorHex?: number) => {
    if (isUpdatingAvatar || !selectedProfile) return;

    setIsUpdatingAvatar(true);
    setFeedbackMsg(null);

    const targetColor = colorHex ?? selectedProfile.colorHex;
    const result = await updateCurrentChildAvatar(emoji, targetColor);

    setIsUpdatingAvatar(false);
    if (result.success) {
      setFeedbackMsg('Avatar changed! 🎉');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(result.error ?? 'Could not change avatar.');
    }
  };

  if (!selectedProfile) {
    return (
      <View style={styles.root}>
        <Text style={styles.missing}>No profile selected</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.kidsProfileRed, Colors.kidsProfileDarkRed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.root}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          testID="profile_back_button"
        >
          <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Avatar with Edit Badge */}
          <TouchableOpacity
            style={styles.avatarTouchContainer}
            activeOpacity={0.85}
            onPress={() => setShowAvatarPicker(!showAvatarPicker)}
            accessibilityLabel="Change avatar"
          >
            <View
              style={[
                styles.mainAvatar,
                { backgroundColor: hexLongToColor(selectedProfile.colorHex) },
              ]}
            >
              <Text style={styles.mainEmoji}>
                {selectedProfile.avatarEmoji}
              </Text>
            </View>
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{selectedProfile.name}</Text>
          <TouchableOpacity
            style={styles.changeAvatarBtn}
            onPress={() => setShowAvatarPicker(!showAvatarPicker)}
          >
            <Text style={styles.changeAvatarText}>
              {showAvatarPicker ? 'Hide Avatar Options ▲' : 'Change Avatar 🎨 ▼'}
            </Text>
          </TouchableOpacity>

          {feedbackMsg && (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedbackMsg}</Text>
            </View>
          )}

          {/* Child Avatar Self-Customization Panel */}
          {showAvatarPicker && (
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Pick Your New Avatar 🎈</Text>
                {isUpdatingAvatar && (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
              </View>

              {/* Color choices */}
              <Text style={styles.pickerSubLabel}>Background Color:</Text>
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map((col) => {
                  const isSel = selectedProfile.colorHex === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.colorPill,
                        { backgroundColor: hexLongToColor(col) },
                        isSel && styles.colorPillSelected,
                      ]}
                      onPress={() =>
                        handleSelectNewAvatar(selectedProfile.avatarEmoji, col)
                      }
                    >
                      {isSel && (
                        <MaterialIcons name="check" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Emoji choices */}
              <Text style={styles.pickerSubLabel}>Avatar Character:</Text>
              <View style={styles.emojiGrid}>
                {AVATAR_EMOJIS.map((emoji) => {
                  const isSel = selectedProfile.avatarEmoji === emoji;
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiPill,
                        isSel && styles.emojiPillSelected,
                      ]}
                      onPress={() => handleSelectNewAvatar(emoji)}
                    >
                      <Text style={styles.emojiChar}>{emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Watch time card */}
          <View style={styles.watchTimeCard}>
            <View style={styles.watchTimeHeader}>
              <View style={styles.watchTimeLeft}>
                <MaterialIcons
                  name="hourglass-top"
                  size={18}
                  color={Colors.kidsSunnyYellow}
                />
                <Text style={styles.watchTimeTitle}>
                  Today's Screen Time
                </Text>
              </View>
              <Text style={styles.watchTimeRemaining}>
                {remainingMinutes} min left
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>

            <Text style={styles.watchTimeUsage}>
              {formatUsageText(usedMinutes, dailyLimitMinutes)}
            </Text>
          </View>

          {/* Switch profile */}
          {profiles.length > 1 && (
            <>
              <Text style={styles.switchTitle}>Switch Profile</Text>
              <View style={styles.switchRow}>
                {profiles.map((profile) => {
                  const isCurrent = profile.id === selectedProfile.id;
                  return (
                    <TouchableOpacity
                      key={profile.id}
                      style={styles.switchPill}
                      activeOpacity={0.85}
                      onPress={() => selectProfile(profile)}
                    >
                      <View
                        style={[
                          styles.switchAvatar,
                          {
                            backgroundColor: hexLongToColor(profile.colorHex),
                            borderWidth: isCurrent ? 3.5 : 1.5,
                            borderColor: isCurrent
                              ? '#FFFFFF'
                              : 'rgba(255,255,255,0.5)',
                          },
                        ]}
                      >
                        <Text style={styles.switchEmoji}>
                          {profile.avatarEmoji}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.switchName,
                          { fontWeight: isCurrent ? '900' : '600' },
                        ]}
                      >
                        {profile.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        {/* Child sign-out */}
        <TouchableOpacity
          style={styles.parentLock}
          onPress={handleLogout}
          testID="child_logout_button"
        >
          <Text style={styles.parentLockText}>Log out</Text>
          <MaterialIcons name="logout" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <KidsBottomNavigation
          selectedTab={ChildTab.PROFILE}
          profileEmoji={selectedProfile.avatarEmoji}
          onTabSelected={(tab) => {
            if (tab === ChildTab.HOME) navigate(ScreenState.HOME);
            else if (tab === ChildTab.SEARCH)
              navigate(ScreenState.SEARCH, { previousScreen: ScreenState.HOME });
            else if (tab === ChildTab.EXPLORE) navigate(ScreenState.EXPLORE);
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  missing: {
    color: '#FFFFFF',
    padding: 24,
  },
  backButton: {
    marginTop: 16,
    marginLeft: 12,
    width: Dimensions.touchTargetMin,
    height: Dimensions.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  avatarTouchContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  mainEmoji: {
    fontSize: 54,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#0284C7',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    ...Typography.displayLarge,
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  changeAvatarBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  changeAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
    borderWidth: 1,
    backgroundColor: 'rgba(58, 155, 232, 0.25)',
    borderColor: '#3A9BE8',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 10,
  },
  feedbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pickerCard: {
    width: '94%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pickerSubLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  colorPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPillSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiPill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPillSelected: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  emojiChar: {
    fontSize: 22,
  },
  watchTimeCard: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  watchTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchTimeTitle: {
    ...Typography.labelLarge,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
  },
  watchTimeRemaining: {
    ...Typography.labelMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.kidsSunnyYellow,
  },
  watchTimeUsage: {
    ...Typography.labelSmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  switchTitle: {
    ...Typography.labelLarge,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    marginTop: 24,
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  switchPill: {
    alignItems: 'center',
    padding: 4,
  },
  switchAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchEmoji: {
    fontSize: 28,
  },
  switchName: {
    ...Typography.labelMedium,
    color: '#FFFFFF',
    marginTop: 4,
  },
  parentLock: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Dimensions.radiusPill,
  },
  parentLockText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 6,
  },
});