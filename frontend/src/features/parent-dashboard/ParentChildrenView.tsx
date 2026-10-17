// src/features/parent-dashboard/ParentChildrenView.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../theme/typography';
import { hexLongToColor } from '../../utils/color';
import type { ChildDetailDto } from '../../types/api';

/**
 * ParentChildrenView
 * Migrated from Kotlin ParentPanelScreen.kt → ParentChildrenView
 * 
 * Children list with avatar, credentials copy, watched-today,
 * reset password, delete.
 */

interface ParentChildrenViewProps {
  children: ChildDetailDto[];
  onAddChildClick: () => void;
  onResetPasswordClick: (child: ChildDetailDto) => void;
  onDeleteChildClick: (child: ChildDetailDto) => void;
}

export const ParentChildrenView: React.FC<ParentChildrenViewProps> = ({
  children,
  onAddChildClick,
  onResetPasswordClick,
  onDeleteChildClick,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Children Profiles ({children.length})
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            All children share the same parent time-limit setting
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={onAddChildClick}
          accessibilityRole="button"
          accessibilityLabel="Add Child"
          testID="add_child_button"
        >
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addText}>Add Child</Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {children.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="person" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No children profiles yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap 'Add Child' above to create a profile for your kid.
          </Text>
        </View>
      ) : (
        children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onResetPassword={() => onResetPasswordClick(child)}
            onDelete={() => onDeleteChildClick(child)}
          />
        ))
      )}
    </ScrollView>
  );
};

// --- ChildCard ---
interface ChildCardProps {
  child: ChildDetailDto;
  onResetPassword: () => void;
  onDelete: () => void;
}
const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onResetPassword,
  onDelete,
}) => (
  <View style={styles.childCard}>
    {/* Top row: avatar + info + delete */}
    <View style={styles.childTopRow}>
      <View
        style={[
          styles.avatarCircle,
          { backgroundColor: hexLongToColor(child.colorHex) },
        ]}
      >
        <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
      </View>

      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.displayName}</Text>
        <Text style={styles.childMeta}>
          Username: {child.username} • Age: {child.ageGroup ?? 6}
        </Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <MaterialIcons name="delete" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>

    {/* Credentials box */}
    <View style={styles.credentialsBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.credLabel}>Child Explorer Username:</Text>
        <Text style={styles.credValue}>{child.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={onResetPassword}
        // Note: onCopy replaced with reset in some flows; keep for parity
      >
        <MaterialIcons name="content-copy" size={14} color="#475569" />
        <Text style={styles.copyText}>Copy</Text>
      </TouchableOpacity>
    </View>

    {/* Bottom: watched + reset password */}
    <View style={styles.childBottomRow}>
      <Text style={styles.watchedText}>
        Watched today: {child.minutesWatchedToday} min /{' '}
        {child.dailyLimitMinutes} min limit
      </Text>
      <TouchableOpacity onPress={onResetPassword}>
        <Text style={styles.resetText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 8,
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
    lineHeight: 18,
  },
  addButton: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  childTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  childInfo: {
    flex: 1,
    marginLeft: 14,
  },
  childName: {
    ...Typography.titleMedium,
    fontWeight: '700',
    color: '#0F172A',
  },
  childMeta: {
    ...Typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  credLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  credValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    marginLeft: 4,
  },
  childBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  watchedText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
    flex: 1,
  },
  resetText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '700',
  },
});