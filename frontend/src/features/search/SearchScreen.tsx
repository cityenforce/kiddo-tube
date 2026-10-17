// src/features/search/SearchScreen.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Dimensions } from '../../theme/dimensions';

import { KidsVideoCard } from '../../components/ui/KidsVideoCard';
import { KidsChannelCard } from '../../components/ui/KidsChannelCard';
import { KidsPlaylistCard } from '../../components/ui/KidsPlaylistCard';
import { KidsEmptyState } from '../../components/ui/KidsStatusViews';
import { KidsBottomNavigation } from '../../components/layout/KidsBottomNavigation';

import { useContentStore } from '../../store/contentStore';
import { ScreenState, ChildTab } from '../../types/navigation';
import { navigate } from '../../app/navigation/navigationRef';
import { goBack } from '../../app/navigation/navigationRef';
import type { RootStackParamList } from '../../types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * SearchScreen
 * Migrated 1:1 from Kotlin KidsSearchScreen.kt
 * 
 * - Search bar with clear button
 * - Safe-search banner
 * - Results: Channels → Playlists → Videos
 * - Empty states (initial / no results)
 */

type SearchScreenProps = NativeStackScreenProps<
  RootStackParamList,
  ScreenState.SEARCH
>;

export const SearchScreen: React.FC<SearchScreenProps> = ({ route }) => {
  const [query, setQuery] = useState('');

  // previousScreen is in route.params (for back navigation)
  const previousScreen = route.params?.previousScreen ?? ScreenState.HOME;

  // Derive results from content store — reactive
  const approvedVideos = useContentStore((s) => s.approvedVideos);
  const approvedChannels = useContentStore((s) => s.approvedChannels);
  const approvedPlaylists = useContentStore((s) => s.approvedPlaylists);
  const selectedProfile = useContentStore((s) => s.selectedProfile);
  const profileEmoji = selectedProfile?.avatarEmoji ?? '🦁';

  const handleTabSelected = (tab: ChildTab) => {
    switch (tab) {
      case ChildTab.HOME:
        navigate(ScreenState.HOME);
        break;
      case ChildTab.EXPLORE:
        navigate(ScreenState.EXPLORE);
        break;
      case ChildTab.SEARCH:
        // Already on Search
        break;
      case ChildTab.PROFILE:
        navigate(ScreenState.PROFILE);
        break;
    }
  };

  const results = useMemo(() => {
    if (!query.trim()) {
      return { videos: [], channels: [], playlists: [] };
    }

    const q = query.trim().toLowerCase();

    const videos = approvedVideos.filter(
      (v) =>
        !v.isBlocked &&
        (v.title.toLowerCase().includes(q) ||
          v.channelTitle.toLowerCase().includes(q) ||
          (v.description ?? '').toLowerCase().includes(q))
    );

    const channels = approvedChannels.filter(
      (c) =>
        !c.isBlocked &&
        (c.title.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q))
    );

    const playlists = approvedPlaylists.filter(
      (p) =>
        !p.isBlocked &&
        (p.title.toLowerCase().includes(q) ||
          p.channelTitle.toLowerCase().includes(q))
    );

    return { videos, channels, playlists };
  }, [query, approvedVideos, approvedChannels, approvedPlaylists]);

  const isQueryEmpty = query.trim().length === 0;
  const hasAnyResults =
    results.videos.length > 0 ||
    results.channels.length > 0 ||
    results.playlists.length > 0;

  const handleBack = () => {
    if (previousScreen === ScreenState.HOME) {
      navigate(ScreenState.HOME);
    } else if (previousScreen === ScreenState.EXPLORE) {
      navigate(ScreenState.EXPLORE);
    } else {
      goBack();
    }
  };

  return (
    <View style={styles.root} testID="kids_search_screen">
      {/* Top bar */}
      <SafeAreaView style={styles.safeTop}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID="search_back_button"
          >
            <MaterialIcons
              name="arrow-back"
              size={26}
              color={Colors.kidsTextPrimary}
            />
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <MaterialIcons
              name="search"
              size={22}
              color={Colors.kidsSkyBlue}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search approved videos, channels, playlists..."
              placeholderTextColor={Colors.kidsTextMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              testID="search_input_field"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="clear"
                  size={20}
                  color={Colors.kidsTextMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Safe search banner */}
      <View style={styles.safeBanner}>
        <Text style={styles.safeBannerText}>
          🔒 Safe Search: Searching only videos approved by your parent
        </Text>
      </View>

      {/* Results */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isQueryEmpty ? (
          <KidsEmptyState
            title="Find Fun Videos!"
            subtitle="Search for science, music, bedtime stories, or animal adventures."
          />
        ) : !hasAnyResults ? (
          <KidsEmptyState
            title="No Results Found"
            subtitle={`We couldn't find "${query}" in your approved list. Try another search!`}
          />
        ) : (
          <>
            {/* Channels */}
            {results.channels.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Channels</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {results.channels.map((ch) => (
                    <KidsChannelCard
                      key={ch.id}
                      channel={ch}
                      onClick={() =>
                        navigate(ScreenState.CHANNEL_DETAILS, {
                          channelId: ch.id,
                          previousScreen: ScreenState.SEARCH,
                        })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Playlists */}
            {results.playlists.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Playlists</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {results.playlists.map((pl) => (
                    <KidsPlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onClick={() =>
                        navigate(ScreenState.PLAYLIST_DETAILS, {
                          playlistId: pl.id,
                          previousScreen: ScreenState.SEARCH,
                        })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Videos */}
            {results.videos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Videos ({results.videos.length})
                </Text>
                <View style={styles.videosList}>
                  {results.videos.map((video) => (
                    <KidsVideoCard
                      key={video.id}
                      video={video}
                      onClick={() =>
                        navigate(ScreenState.PLAYER, {
                          videoId: video.id,
                          previousScreen: ScreenState.SEARCH,
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <KidsBottomNavigation
        selectedTab={ChildTab.SEARCH}
        profileEmoji={profileEmoji}
        onTabSelected={handleTabSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.kidsBackground,
  },
  safeTop: {
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: Dimensions.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: Dimensions.touchTargetMin,
    height: Dimensions.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrap: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kidsSurfaceVariant,
    borderRadius: Dimensions.radiusPill,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.kidsTextPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  safeBanner: {
    backgroundColor: Colors.kidsSkyBlue + '1F',
    paddingHorizontal: Dimensions.spaceMedium,
    paddingVertical: 6,
  },
  safeBannerText: {
    ...Typography.labelSmall,
    color: '#0284C7',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 84,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.kidsTextPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  horizontalScroll: {
    gap: 12,
  },
  videosList: {
    marginTop: 4,
  },
});