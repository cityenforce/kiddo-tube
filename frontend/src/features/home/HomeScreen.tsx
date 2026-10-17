// src/features/home/HomeScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';

import { KidsHeader } from '../../components/layout/KidsHeader';
import { KidsBottomNavigation } from '../../components/layout/KidsBottomNavigation';
import { KidsCategoryRow } from '../../components/ui/KidsCategoryRow';
import { KidsVideoCard } from '../../components/ui/KidsVideoCard';
import { KidsChannelCard } from '../../components/ui/KidsChannelCard';
import { KidsPlaylistCard } from '../../components/ui/KidsPlaylistCard';
import { KidsEmptyState } from '../../components/ui/KidsStatusViews';
import { KidsCastSheet } from '../../components/layout/KidsCastSheet';
import { KidsPolicyDialog } from '../../components/layout/KidsPolicyDialog';
import { ParentsPasscodeModal } from '../parental/ParentsPasscodeModal';
import { ParentExtensionDialog } from '../parental/ParentExtensionDialog';

import { useContentStore } from '../../store/contentStore';
import { useScreenTimeStore } from '../../store/screenTimeStore';
import { VideoCategory } from '../../types/models';
import { ChildTab, ScreenState } from '../../types/navigation';
import { navigate } from '../../app/navigation/navigationRef';

/**
 * HomeScreen
 * 1:1 Pixel Clone of YouTube Kids (Screenshot 2).
 * 
 * Features:
 * - Top yellow app bar with Kids logo, doodles, Cast, Shield, Settings icons
 * - Category pill row with dark active pill
 * - Video cards feed with rounded thumbnails and duration badges
 * - Cast Device sheet, Safety Policy dialog, and Parents only Passcode modal
 * - Clean English empty state without any parent button
 */

export const HomeScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>(
    VideoCategory.ALL
  );

  // Dialog and bottom sheet states
  const [showCastSheet, setShowCastSheet] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const videos = useContentStore((s) => s.approvedVideos);
  const channels = useContentStore((s) => s.approvedChannels);
  const playlists = useContentStore((s) => s.approvedPlaylists);
  const currentProfile = useContentStore((s) => s.selectedProfile);

  const remainingMinutes = useScreenTimeStore((s) => s.remainingMinutes);
  const profileEmoji = currentProfile?.avatarEmoji ?? '🦁';

  // Filter videos by category and prioritize liked/favorite videos at top
  const filteredVideos = (
    selectedCategory === VideoCategory.ALL
      ? videos
      : videos.filter((v) => v.category === selectedCategory)
  )
    .slice()
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

  const handleTabSelected = (tab: ChildTab) => {
    switch (tab) {
      case ChildTab.HOME:
        // already here
        break;
      case ChildTab.EXPLORE:
        navigate(ScreenState.EXPLORE);
        break;
      case ChildTab.SEARCH:
        navigate(ScreenState.SEARCH, { previousScreen: ScreenState.HOME });
        break;
      case ChildTab.PROFILE:
        navigate(ScreenState.PROFILE);
        break;
    }
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(false);
    setShowTimerDialog(true);
  };

  const handleConfirmExtension = async (extensionMinutes: number) => {
    setShowTimerDialog(false);
    useScreenTimeStore.setState((state) => ({
      remainingMinutes: state.remainingMinutes + extensionMinutes,
      isLocked: false,
    }));
  };

  return (
    <View style={styles.root} testID="kids_home_screen">
      {/* Top YouTube Kids Vibrant Yellow Bar */}
      <View style={styles.topYellowBanner}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <KidsHeader
            remainingMinutes={remainingMinutes}
            onCastPress={() => setShowCastSheet(true)}
            onPolicyPress={() => setShowPolicyDialog(true)}
            onSettingsPress={() => setShowPasscodeModal(true)}
          />

          <KidsCategoryRow
            selectedCategory={selectedCategory}
            onCategorySelected={setSelectedCategory}
          />
        </SafeAreaView>
      </View>

      {/* Content Area with Soft Gradient */}
      <LinearGradient
        colors={['#FFF9E6', '#FFFDF9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.contentGradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dedicated Playlists Tab View */}
          {selectedCategory === VideoCategory.PLAYLISTS ? (
            playlists.length > 0 ? (
              <View style={styles.playlistsGrid}>
                {playlists.map((playlist) => (
                  <View key={playlist.id} style={styles.playlistItemWrap}>
                    <KidsPlaylistCard
                      playlist={playlist}
                      onClick={() =>
                        navigate(ScreenState.PLAYLIST_DETAILS, {
                          playlistId: playlist.id,
                          previousScreen: ScreenState.HOME,
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <KidsEmptyState
                  title="No playlists available yet"
                  subtitle="There are no playlists added yet. Ask mom or dad to whitelist safe playlists!"
                />
              </View>
            )
          ) : (
            /* Videos feed for ALL, SHOWS, MUSIC, LEARNING, EXPLORE */
            filteredVideos.length > 0 ? (
              <View style={styles.videosList}>
                {filteredVideos.map((video) => (
                  <KidsVideoCard
                    key={video.id}
                    video={video}
                    onClick={() =>
                      navigate(ScreenState.PLAYER, {
                        videoId: video.id,
                        previousScreen: ScreenState.HOME,
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <KidsEmptyState
                  title="No videos available yet"
                  subtitle="There are no videos under this category yet. Check back soon!"
                />
              </View>
            )
          )}
        </ScrollView>
      </LinearGradient>

      {/* Bottom Navigation */}
      <KidsBottomNavigation
        selectedTab={ChildTab.HOME}
        profileEmoji={profileEmoji}
        onTabSelected={handleTabSelected}
      />

      {/* Cast Device Bottom Sheet (Screenshot 2) */}
      <KidsCastSheet
        visible={showCastSheet}
        onDismiss={() => setShowCastSheet(false)}
      />

      {/* Safety Policy Modal (Shield icon) */}
      <KidsPolicyDialog
        visible={showPolicyDialog}
        onDismiss={() => setShowPolicyDialog(false)}
      />

      {/* "Parents only" Passcode Modal (Screenshot 3) */}
      <ParentsPasscodeModal
        visible={showPasscodeModal}
        onDismiss={() => setShowPasscodeModal(false)}
        onSuccess={handlePasscodeSuccess}
      />

      {/* Screen Time Timer Dialog */}
      <ParentExtensionDialog
        visible={showTimerDialog}
        onDismiss={() => setShowTimerDialog(false)}
        onConfirmExtension={handleConfirmExtension}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFBE00',
  },
  topYellowBanner: {
    backgroundColor: '#FFBE00',
    paddingBottom: 8,
  },
  contentGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  horizontalScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  videosList: {
    marginTop: 4,
  },
  playlistsGrid: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  playlistItemWrap: {
    width: '48%',
    minWidth: 155,
    marginBottom: 8,
  },
  emptyWrap: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});