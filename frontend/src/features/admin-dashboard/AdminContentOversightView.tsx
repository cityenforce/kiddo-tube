// src/features/admin-dashboard/AdminContentOversightView.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Typography } from '../../theme/typography';
import type { VideoItemDto } from '../../types/api';

/**
 * AdminContentOversightView
 * Migrated from Kotlin AdminPanelScreen.kt → AdminContentOversightView
 */

interface AdminContentOversightViewProps {
  videos: VideoItemDto[];
  onModerate: (id: string, action: string) => void;
}

export const AdminContentOversightView: React.FC<
  AdminContentOversightViewProps
> = ({ videos, onModerate }) => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        Content Whitelist Oversight ({videos.length})
      </Text>
      <Text style={styles.subtitle}>
        System-wide inspection of videos approved by parents
      </Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {videos.map((vid) => (
          <View key={vid.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={2}>
                {vid.title}
              </Text>
              <Text style={styles.cardMeta}>
                {vid.channelTitle} • Status: {vid.status}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onModerate(vid.id, 'REMOVE')}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
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
    marginBottom: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
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
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  cardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});