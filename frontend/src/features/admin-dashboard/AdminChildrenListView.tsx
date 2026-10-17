// src/features/admin-dashboard/AdminChildrenListView.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../theme/typography';
import type { AdminChildItemDto } from '../../types/api';

/**
 * AdminChildrenListView
 * Migrated from Kotlin AdminPanelScreen.kt → AdminChildrenListView
 */

interface AdminChildrenListViewProps {
  children: AdminChildItemDto[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleStatus: (childId: string) => void;
}

export const AdminChildrenListView: React.FC<AdminChildrenListViewProps> = ({
  children,
  searchQuery,
  onSearchChange,
  onToggleStatus,
}) => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        All Explorers Directory ({children.length})
      </Text>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by child name..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children.map((child) => {
          const isActive = child.status === 'ACTIVE';

          return (
            <View key={child.id} style={styles.card}>
              <Text style={styles.emoji}>{child.avatarEmoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{child.displayName}</Text>
                <Text style={styles.cardMeta}>
                  Username: {child.username} • Parent: @
                  {child.parentUsername}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: isActive ? '#FEE2E2' : '#DCFCE7',
                  },
                ]}
                onPress={() => onToggleStatus(child.id)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? '#DC2626' : '#059669' },
                  ]}
                >
                  {isActive ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 12,
  },
});