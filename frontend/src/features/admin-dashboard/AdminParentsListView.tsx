// src/features/admin-dashboard/AdminParentsListView.tsx

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
import type { AdminParentItemDto } from '../../types/api';

/**
 * AdminParentsListView
 * Migrated from Kotlin AdminPanelScreen.kt → AdminParentsListView
 */

interface AdminParentsListViewProps {
  parents: AdminParentItemDto[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleStatus: (parentId: string) => void;
  onAddParentClick: () => void;
}

export const AdminParentsListView: React.FC<AdminParentsListViewProps> = ({
  parents,
  searchQuery,
  onSearchChange,
  onToggleStatus,
  onAddParentClick,
}) => {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Registered Parents ({parents.length})
        </Text>
        <TouchableOpacity
          style={styles.addParentBtn}
          onPress={onAddParentClick}
          accessibilityRole="button"
          accessibilityLabel="Add Parent Account"
        >
          <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
          <Text style={styles.addParentBtnText}>Add Parent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username or email..."
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
        {parents.map((parent) => {
          const isActive = parent.status === 'ACTIVE';

          return (
            <View key={parent.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {parent.displayName ?? parent.username} (
                  {parent.username})
                </Text>
                <Text style={styles.cardMeta}>
                  Email: {parent.email ?? 'N/A'} • {parent.childrenCount}{' '}
                  children
                </Text>
                <Text
                  style={[
                    styles.cardStatus,
                    {
                      color: isActive ? '#059669' : '#DC2626',
                    },
                  ]}
                >
                  Daily limit: {parent.dailyLimitMinutes}m • Status:{' '}
                  {parent.status}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: isActive ? '#FEE2E2' : '#DCFCE7',
                  },
                ]}
                onPress={() => onToggleStatus(parent.id)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isActive ? '#DC2626' : '#059669' },
                  ]}
                >
                  {isActive ? 'Suspend' : 'Activate'}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '900',
    color: '#0F172A',
  },
  addParentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3A9BE8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addParentBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  cardStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
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