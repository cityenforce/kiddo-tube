// src/features/parent-dashboard/ParentContentView.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { MaterialIconsIconName } from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../theme/typography';
import { hexLongToColor, getInitial } from '../../utils/color';
import type {
  VideoItem,
  ChannelItem,
  PlaylistItem,
} from '../../types/models';

/**
 * ParentContentView
 * Migrated from Kotlin ParentPanelScreen.kt → ParentContentView
 * 
 * 3 tabs: Videos, Channels, Playlists
 * Each item has a delete button
 */

interface ParentContentViewProps {
  videos: VideoItem[];
  channels: ChannelItem[];
  playlists: PlaylistItem[];
  onAddVideoClick: () => void;
  onAddChannelClick: () => void;
  onAddPlaylistClick: () => void;
  onRemoveVideo: (video: VideoItem) => void;
  onRemoveChannel: (ch: ChannelItem) => void;
  onRemovePlaylist: (pl: PlaylistItem) => void;
}

export const ParentContentView: React.FC<ParentContentViewProps> = ({
  videos,
  channels,
  playlists,
  onAddVideoClick,
  onAddChannelClick,
  onAddPlaylistClick,
  onRemoveVideo,
  onRemoveChannel,
  onRemovePlaylist,
}) => {
  const [contentTab, setContentTab] = useState(0); // 0: Videos, 1: Channels, 2: Playlists

  const handleAdd = () => {
    if (contentTab === 0) onAddVideoClick();
    else if (contentTab === 1) onAddChannelClick();
    else onAddPlaylistClick();
  };

  const addLabel =
    contentTab === 0
      ? 'Add Video'
      : contentTab === 1
      ? 'Add Channel'
      : 'Add Playlist';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Approved Media Whitelist</Text>
          <Text style={styles.subtitle}>
            Only media approved here is visible to kids
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={handleAdd}
        >
          <MaterialIcons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addText}>{addLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TabButton
          label={`Videos (${videos.length})`}
          active={contentTab === 0}
          onPress={() => setContentTab(0)}
        />
        <TabButton
          label={`Channels (${channels.length})`}
          active={contentTab === 1}
          onPress={() => setContentTab(1)}
        />
        <TabButton
          label={`Playlists (${playlists.length})`}
          active={contentTab === 2}
          onPress={() => setContentTab(2)}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {contentTab === 0 && (
          <>
            {videos.length === 0 ? (
              <EmptyCard
                icon="video-library"
                title="No Approved Videos Yet"
                subtitle="Tap 'Add Video' above to whitelist your first YouTube video."
              />
            ) : (
              videos.map((vid) => (
                <View key={vid.id} style={styles.listItem}>
                  <Image
                    source={{ uri: vid.thumbnailUrl }}
                    style={styles.videoThumb}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {vid.title}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {vid.channelTitle} • {vid.category}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.itemDelete}
                    onPress={() => onRemoveVideo(vid)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {contentTab === 1 && (
          <>
            {channels.length === 0 ? (
              <EmptyCard
                icon="subscriptions"
                title="No Approved Channels Yet"
                subtitle="Tap 'Add Channel' above to whitelist a YouTube channel."
              />
            ) : (
              channels.map((ch) => (
                <View key={ch.id} style={styles.listItem}>
                  <View
                    style={[
                      styles.channelAvatarCircle,
                      { backgroundColor: hexLongToColor(ch.colorAccentHex) },
                    ]}
                  >
                    {ch.avatarUrl ? (
                      <Image
                        source={{ uri: ch.avatarUrl }}
                        style={styles.channelAvatarImg}
                      />
                    ) : (
                      <Text style={styles.channelAvatarText}>
                        {getInitial(ch.title)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{ch.title}</Text>
                    <Text style={styles.itemMeta} numberOfLines={1}>
                      {ch.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.itemDelete}
                    onPress={() => onRemoveChannel(ch)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {contentTab === 2 && (
          <>
            {playlists.length === 0 ? (
              <EmptyCard
                icon="subscriptions"
                title="No Approved Playlists Yet"
                subtitle="Tap 'Add Playlist' above to approve a YouTube playlist collection."
              />
            ) : (
              playlists.map((pl) => (
                <View key={pl.id} style={styles.listItem}>
                  <Image
                    source={{ uri: pl.thumbnailUrl }}
                    style={styles.videoThumb}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{pl.title}</Text>
                    <Text style={styles.itemMeta}>
                      {pl.channelTitle} • {pl.videoCount} videos
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.itemDelete}
                    onPress={() => onRemovePlaylist(pl)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// --- Internal components ---
const TabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Text
      style={[
        styles.tabButtonText,
        active && styles.tabButtonTextActive,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const EmptyCard: React.FC<{
  icon: MaterialIconsIconName;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <View style={styles.emptyCard}>
    <MaterialIcons name={icon} size={44} color="#94A3B8" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  videoThumb: {
    width: 68,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  channelAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  channelAvatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  channelAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemDelete: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});