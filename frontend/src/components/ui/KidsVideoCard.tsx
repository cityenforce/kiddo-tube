// src/components/ui/KidsVideoCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formatVideoDuration } from '../../utils/formatTime';
import type { VideoItem } from '../../types/models';

/**
 * KidsVideoCard
 * 1:1 Pixel Clone of YouTube Kids Video Card (Screenshot 2).
 * 
 * - Rounded 16:9 thumbnail with dark duration badge at bottom right
 * - Bold title (2 lines max)
 * - Channel subtitle
 * - 3-dots options menu on right
 */

interface KidsVideoCardProps {
  video: VideoItem;
  onClick: () => void;
}

export const KidsVideoCard: React.FC<KidsVideoCardProps> = ({
  video,
  onClick,
}) => {
  const duration = formatVideoDuration(video.durationText);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onClick}
      testID={`video_card_${video.id}`}
    >
      {/* 16:9 Video Thumbnail */}
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Duration badge (bottom-right) */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{duration}</Text>
        </View>

        {/* Favorite heart badge (top-left) */}
        {video.isFavorite && (
          <View style={styles.favoriteBadge}>
            <MaterialIcons name="favorite" size={14} color="#EF4444" />
          </View>
        )}
      </View>

      {/* Info Row: Title & Subtitle + 3-dots button */}
      <View style={styles.infoRow}>
        <View style={styles.textColumn}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {video.title}
          </Text>

          <Text
            style={styles.channelName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {video.channelTitle}
          </Text>
        </View>

        {/* Three-dots menu */}
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.6}
          onPress={onClick}
        >
          <MaterialIcons
            name="more-vert"
            size={22}
            color="#606060"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  thumbnailWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  channelName: {
    fontSize: 13,
    color: '#606060',
    marginTop: 3,
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});