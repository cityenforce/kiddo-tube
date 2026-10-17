// src/features/player/VideoPlayerScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';

import { useContentStore } from '../../store/contentStore';
import { useScreenTimeStore } from '../../store/screenTimeStore';
import { buildYoutubePlayerHtml } from '../../utils/youtube';
import { ScreenState } from '../../types/navigation';
import { navigate } from '../../app/navigation/navigationRef';
import { KidsCastSheet } from '../../components/layout/KidsCastSheet';
import { ParentsPasscodeModal } from '../parental/ParentsPasscodeModal';
import { ParentExtensionDialog } from '../parental/ParentExtensionDialog';
import type { RootStackParamList } from '../../types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * VideoPlayerScreen
 * 1:1 Pixel Clone of YouTube Kids Fullscreen Player (Screenshots 1, 4, 5).
 * 
 * Features:
 * - Immersive fullscreen video playback
 * - Tap screen to toggle overlay controls (auto-hides after 4s)
 * - Top Bar: Back arrow, channel avatar, title, subtitle, Subscribe badge, Cast icon, 3-dots menu
 * - Playback bar: Play/Pause, current time, red scrubber with knob, total duration, Next video, Fullscreen toggle
 * - Bottom Shelf: Horizontal recommended videos carousel with duration badges
 * - Floating Settings gear button at bottom right: Opens "Parents only" Passcode modal
 */

type VideoPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  ScreenState.PLAYER
>;

const AnyWebView = WebView as any;

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route,
}) => {
  const { videoId, previousScreen } = route.params;

  const allVideos = useContentStore((s) => s.approvedVideos);
  const remainingMinutes = useScreenTimeStore((s) => s.remainingMinutes);
  const recordWatchSeconds = useScreenTimeStore((s) => s.recordWatchSeconds);

  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showCastSheet, setShowCastSheet] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Playback progress (simulated for scrubber bar display)
  const [currentTimeSec, setCurrentTimeSec] = useState(20);

  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webViewRef = useRef<any>(null);

  // Update current video if route param changes
  useEffect(() => {
    setCurrentVideoId(videoId);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  }, [videoId]);

  const currentVideo = allVideos.find((v) => v.id === currentVideoId);

  // Auto-hide controls after 4.5 seconds
  const resetHideControlsTimer = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  };

  useEffect(() => {
    if (showControls) {
      resetHideControlsTimer();
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [showControls, currentVideoId]);

  // Watch time ticker — 1s intervals while active
  useEffect(() => {
    if (isPlaying && remainingMinutes > 0) {
      watchTimerRef.current = setInterval(() => {
        recordWatchSeconds(1);
        setCurrentTimeSec((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
        watchTimerRef.current = null;
      }
    };
  }, [isPlaying, remainingMinutes, recordWatchSeconds]);

  const toggleLikeVideo = useContentStore((s) => s.toggleLikeVideo);
  const isVideoLiked = currentVideo?.isFavorite ?? false;

  const currentIndex = allVideos.findIndex((v) => v.id === currentVideoId);

  const handleBack = () => {
    if (!previousScreen || previousScreen === ScreenState.HOME) {
      navigate(ScreenState.HOME);
    } else if (previousScreen === ScreenState.SEARCH) {
      navigate(ScreenState.SEARCH, { previousScreen: ScreenState.HOME });
    } else {
      try {
        navigate(previousScreen);
      } catch {
        navigate(ScreenState.HOME);
      }
    }
  };

  const handlePreviousVideo = () => {
    if (currentIndex > 0) {
      setCurrentVideoId(allVideos[currentIndex - 1].id);
      setCurrentTimeSec(0);
      setIsPlaying(true);
      resetHideControlsTimer();
    }
  };

  const handleNextVideo = () => {
    if (currentIndex !== -1 && currentIndex + 1 < allVideos.length) {
      setCurrentVideoId(allVideos[currentIndex + 1].id);
      setCurrentTimeSec(0);
      setIsPlaying(true);
      resetHideControlsTimer();
    }
  };

  const handleToggleLike = async () => {
    if (currentVideo) {
      await toggleLikeVideo(currentVideo.id);
      resetHideControlsTimer();
    }
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    resetHideControlsTimer();
  };

  const handleConfirmExtension = async (extensionMinutes: number) => {
    setShowTimerDialog(false);
    useScreenTimeStore.setState((state) => ({
      remainingMinutes: state.remainingMinutes + extensionMinutes,
      isLocked: false,
    }));
  };

  if (!currentVideo) {
    return (
      <View style={styles.root}>
        <SafeAreaView>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Video not found</Text>
        </View>
      </View>
    );
  }

  const htmlContent = buildYoutubePlayerHtml(currentVideo.youtubeId);
  const recommendedVideos = allVideos.filter(
    (v) => !v.isBlocked && v.id !== currentVideoId
  );

  // Format time display
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mock total duration or extract
  const totalDuration = currentVideo.durationText || '03:14';

  return (
    <View style={styles.root} testID="kids_video_player_screen">
      <StatusBar hidden />

      {/* Fullscreen Video View */}
      <View style={styles.videoPlayerContainer}>
        <AnyWebView
          ref={webViewRef}
          source={{
            html: htmlContent,
            baseUrl: 'https://www.youtube-nocookie.com',
          }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mixedContentMode="never"
        />

        {/* Tap detector overlay to toggle controls */}
        <TouchableWithoutFeedback onPress={toggleControls}>
          <View style={styles.touchOverlay} />
        </TouchableWithoutFeedback>

        {/* Overlay Controls (Screenshots 4 & 5) */}
        {showControls && (
          <View style={styles.controlsOverlay} pointerEvents="box-none">
            {/* Top Bar Overlay */}
            <SafeAreaView edges={['top']} style={styles.topBarSafe}>
              <View style={styles.topBarRow}>
                {/* Back button */}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={handleBack}
                  accessibilityLabel="Back"
                >
                  <MaterialIcons name="arrow-back" size={26} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Channel Avatar Circle */}
                <View style={styles.channelAvatar}>
                  <Text style={styles.channelAvatarText}>
                    {currentVideo.channelTitle ? currentVideo.channelTitle[0] : 'K'}
                  </Text>
                </View>

                {/* Title & Channel Subtitle */}
                <View style={styles.headerTitleWrap}>
                  <Text style={styles.videoHeaderTitle} numberOfLines={1}>
                    {currentVideo.title}
                  </Text>
                  <Text style={styles.videoHeaderSubtitle} numberOfLines={1}>
                    {currentVideo.channelTitle}
                  </Text>
                </View>

                {/* Like / Favorite Button */}
                <TouchableOpacity
                  style={[
                    styles.likeBtn,
                    isVideoLiked && styles.likedBtn,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleToggleLike}
                  accessibilityLabel="Like Video"
                >
                  <MaterialIcons
                    name={isVideoLiked ? 'favorite' : 'favorite-border'}
                    size={16}
                    color={isVideoLiked ? '#EF4444' : '#FFFFFF'}
                    style={{ marginRight: 3 }}
                  />
                  <Text style={[styles.likeText, isVideoLiked && styles.likedText]}>
                    {isVideoLiked ? 'LIKED' : 'LIKE'}
                  </Text>
                </TouchableOpacity>

                {/* Subscribe Badge */}
                <TouchableOpacity
                  style={[
                    styles.subscribeBtn,
                    isSubscribed && styles.subscribedBtn,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setIsSubscribed(!isSubscribed)}
                >
                  <MaterialIcons
                    name="diamond"
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.subscribeText}>
                    {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                  </Text>
                </TouchableOpacity>

                {/* Right: Cast icon & 3-dots */}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowCastSheet(true)}
                >
                  <MaterialIcons name="cast" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowPasscodeModal(true)}
                >
                  <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Center YouTube Kids Playback Controls (Previous / Big Play-Pause / Next) */}
            <View style={styles.centerControlsContainer}>
              {/* Previous Video Button */}
              <TouchableOpacity
                style={[
                  styles.centerNavBtn,
                  currentIndex <= 0 && styles.centerNavBtnDisabled,
                ]}
                onPress={handlePreviousVideo}
                disabled={currentIndex <= 0}
                accessibilityLabel="Previous video"
              >
                <MaterialIcons name="skip-previous" size={40} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Big Center Play / Pause Button */}
              <TouchableOpacity
                style={styles.centerPlayPauseBtn}
                onPress={handlePlayPause}
                accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
              >
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={52}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Next Video Button */}
              <TouchableOpacity
                style={[
                  styles.centerNavBtn,
                  currentIndex >= allVideos.length - 1 && styles.centerNavBtnDisabled,
                ]}
                onPress={handleNextVideo}
                disabled={currentIndex >= allVideos.length - 1}
                accessibilityLabel="Next video"
              >
                <MaterialIcons name="skip-next" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls and Suggested Videos Shelf */}
            <View style={styles.bottomAreaContainer}>
              {/* Scrubber & Playback Controls Bar */}
              <View style={styles.playbackControlsRow}>
                {/* Current Time */}
                <Text style={styles.timeText}>{formatTime(currentTimeSec)}</Text>

                {/* Scrubber Track */}
                <View style={styles.scrubberTrackWrap}>
                  <View style={styles.scrubberTrackPlayed} />
                  <View style={styles.scrubberKnob} />
                  <View style={styles.scrubberTrackRemaining} />
                </View>

                {/* Total Duration */}
                <Text style={styles.timeText}>{totalDuration}</Text>

                {/* Fullscreen Icon */}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={toggleControls}
                >
                  <MaterialIcons name="fullscreen" size={26} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Bottom Shelf of Suggested Videos (Screenshots 4 & 5) */}
              <View style={styles.bottomShelfWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bottomShelfScroll}
                >
                  {recommendedVideos.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.shelfCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        setCurrentVideoId(item.id);
                        setCurrentTimeSec(0);
                        setIsPlaying(true);
                        resetHideControlsTimer();
                      }}
                    >
                      <Image
                        source={{ uri: item.thumbnailUrl }}
                        style={styles.shelfThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.shelfDurationBadge}>
                        <Text style={styles.shelfDurationText}>
                          {item.durationText || '05:00'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Floating Settings Gear Icon at Bottom Right (Screenshots 4 & 5) */}
                <TouchableOpacity
                  style={styles.floatingSettingsGear}
                  activeOpacity={0.8}
                  onPress={() => setShowPasscodeModal(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Settings Passcode"
                >
                  <MaterialIcons name="settings" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Always available Quick-Back Button when controls are hidden */}
        {!showControls && (
          <SafeAreaView edges={['top', 'left']} style={styles.floatingBackSafe}>
            <TouchableOpacity
              style={styles.floatingBackBtn}
              onPress={handleBack}
              accessibilityLabel="Back to previous screen"
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        )}
      </View>

      {/* Cast Device Bottom Sheet */}
      <KidsCastSheet
        visible={showCastSheet}
        onDismiss={() => setShowCastSheet(false)}
      />

      {/* "Parents only" Passcode Modal (Screenshot 3) */}
      <ParentsPasscodeModal
        visible={showPasscodeModal}
        onDismiss={() => setShowPasscodeModal(false)}
        onSuccess={() => {
          setShowPasscodeModal(false);
          setShowTimerDialog(true);
        }}
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
    backgroundColor: '#000000',
  },
  videoPlayerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'space-between',
  },
  topBarSafe: {
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFBE00',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 8,
  },
  channelAvatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1E1E',
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  videoHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  videoHeaderSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 1,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  likedBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  likeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  likedText: {
    color: '#EF4444',
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CC0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  subscribedBtn: {
    backgroundColor: '#475569',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  centerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginVertical: 'auto',
  },
  centerNavBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  centerNavBtnDisabled: {
    opacity: 0.35,
  },
  centerPlayPauseBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomAreaContainer: {
    width: '100%',
  },
  playbackControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  playPauseBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  scrubberTrackWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginHorizontal: 4,
  },
  scrubberTrackPlayed: {
    flex: 0.3,
    height: 3.5,
    backgroundColor: '#FF0000',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  scrubberKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  scrubberTrackRemaining: {
    flex: 0.7,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bottomShelfWrap: {
    height: 108,
    position: 'relative',
    paddingBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  bottomShelfScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
    paddingRight: 64, // leave room for floating gear button
  },
  shelfCard: {
    width: 136,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  shelfThumb: {
    width: '100%',
    height: '100%',
  },
  shelfDurationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  shelfDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingSettingsGear: {
    position: 'absolute',
    right: 14,
    bottom: 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    padding: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  floatingBackSafe: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 999,
  },
  floatingBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});