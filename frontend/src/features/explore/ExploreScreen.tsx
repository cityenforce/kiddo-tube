// src/features/explore/ExploreScreen.tsx

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
import { VideoCategory, getVideoCategoryDisplayName } from '../../types/models';
import { ChildTab, ScreenState } from '../../types/navigation';
import { navigate } from '../../app/navigation/navigationRef';

/**
 * ExploreScreen
 * YouTube Kids Explore tab.
 */

export const ExploreScreen: React.FC = () => {
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

  const categoryFilteredVideos =
    selectedCategory === VideoCategory.ALL
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const handleTabSelected = (tab: ChildTab) => {
    switch (tab) {
      case ChildTab.HOME:
        navigate(ScreenState.HOME);
        break;
      case ChildTab.EXPLORE:
        // already here
        break;
      case ChildTab.SEARCH:
        navigate(ScreenState.SEARCH, { previousScreen: ScreenState.EXPLORE });
        break;
      case ChildTab.PROFILE:
        navigate(ScreenState.PROFILE);
        break;
    }
  };

  const handleConfirmExtension = async (extensionMinutes: number) => {
    setShowTimerDialog(false);
    useScreenTimeStore.setState((state) => ({
      remainingMinutes: state.remainingMinutes + extensionMinutes,
      isLocked: false,
    }));
  };

  return (
    <View style={styles.root} testID="explore_screen">
      {/* Top YouTube Kids Yellow Banner */}
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

      {/* Content Area */}
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
          {/* Playlists */}
          {playlists.length > 0 && selectedCategory === VideoCategory.ALL && (
            <View style={styles.section}>
              <Text style={styles.sectionTitleLarge}>Approved Playlists</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {playlists.map((playlist) => (
                  <KidsPlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() =>
                      navigate(ScreenState.PLAYLIST_DETAILS, {
                        playlistId: playlist.id,
                        previousScreen: ScreenState.EXPLORE,
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Channels */}
          {channels.length > 0 && selectedCategory === VideoCategory.ALL && (
            <View style={styles.section}>
              <Text style={styles.sectionTitleLarge}>Explore Channels</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {channels.map((channel) => (
                  <KidsChannelCard
                    key={channel.id}
                    channel={channel}
                    onClick={() =>
                      navigate(ScreenState.CHANNEL_DETAILS, {
                        channelId: channel.id,
                        previousScreen: ScreenState.EXPLORE,
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Videos section title */}
          <Text style={styles.sectionTitleLarge}>
            {selectedCategory === VideoCategory.ALL
              ? 'All Approved Content'
              : `${getVideoCategoryDisplayName(selectedCategory)} Videos`}
          </Text>

          {/* Videos feed */}
          {categoryFilteredVideos.length > 0 ? (
            <View style={styles.videosList}>
              {categoryFilteredVideos.map((video) => (
                <KidsVideoCard
                  key={video.id}
                  video={video}
                  onClick={() =>
                    navigate(ScreenState.PLAYER, {
                      videoId: video.id,
                      previousScreen: ScreenState.EXPLORE,
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <KidsEmptyState
              title="No videos available yet"
              subtitle="There are no videos in this category right now. Check back soon!"
            />
          )}
        </ScrollView>
      </LinearGradient>

      {/* Bottom nav */}
      <KidsBottomNavigation
        selectedTab={ChildTab.EXPLORE}
        profileEmoji={profileEmoji}
        onTabSelected={handleTabSelected}
      />

      {/* Cast Device Bottom Sheet */}
      <KidsCastSheet
        visible={showCastSheet}
        onDismiss={() => setShowCastSheet(false)}
      />

      {/* Safety Policy Modal */}
      <KidsPolicyDialog
        visible={showPolicyDialog}
        onDismiss={() => setShowPolicyDialog(false)}
      />

      {/* Passcode Modal */}
      <ParentsPasscodeModal
        visible={showPasscodeModal}
        onDismiss={() => setShowPasscodeModal(false)}
        onSuccess={() => {
          setShowPasscodeModal(false);
          setShowTimerDialog(true);
        }}
      />

      {/* Timer Dialog */}
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
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  videosList: {
    marginTop: 4,
  },
});