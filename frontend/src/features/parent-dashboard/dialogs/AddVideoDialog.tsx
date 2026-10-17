// src/features/parent-dashboard/dialogs/AddVideoDialog.tsx

import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../../theme/typography';
import { extractYoutubeId } from '../../../utils/youtube';

/**
 * AddVideoDialog
 * Migrated 1:1 from Kotlin ParentPanelScreen.kt → AddVideoDialog
 */

interface AddVideoDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (
    title: string,
    channel: string,
    ytId: string,
    category: string
  ) => void;
}

const CATEGORY_OPTIONS = [
  { key: 'LEARNING', label: 'Learning', icon: 'lightbulb' },
  { key: 'MUSIC', label: 'Music', icon: 'music-note' },
  { key: 'SHOWS', label: 'Shows', icon: 'movie' },
  { key: 'EXPLORE', label: 'Explore', icon: 'explore' },
];

export const AddVideoDialog: React.FC<AddVideoDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [ytUrlOrId, setYtUrlOrId] = useState('');
  const [category, setCategory] = useState('LEARNING');

  const handleClose = () => {
    setTitle('');
    setChannel('');
    setYtUrlOrId('');
    setCategory('LEARNING');
    onDismiss();
  };

  const handleApprove = () => {
    const youtubeId = extractYoutubeId(ytUrlOrId);
    if (!youtubeId) {
      Alert.alert(
        'Invalid video details',
        'Enter a valid YouTube video URL or 11-character ID.'
      );
      return;
    }
    onConfirm(
      title.trim(),
      channel.trim(),
      youtubeId,
      category
    );
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Approve YouTube Video</Text>

          <ScrollView
            contentContainerStyle={{ paddingVertical: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>Video Title (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Custom video title (optional)"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Channel Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. SciShow Kids"
              placeholderTextColor="#94A3B8"
              value={channel}
              onChangeText={setChannel}
            />

            <Text style={styles.fieldLabel}>YouTube Link or Video ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://youtu.be/... or 11-char ID"
              placeholderTextColor="#94A3B8"
              value={ytUrlOrId}
              onChangeText={setYtUrlOrId}
              autoCapitalize="none"
            />

            {/* Category Dropdown / Selector */}
            <Text style={styles.fieldLabel}>Category Tab *</Text>
            <View style={styles.categoryRow}>
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat.key)}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#475569'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleApprove}
            >
              <Text style={styles.confirmText}>Approve Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    ...Typography.titleLarge,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 2,
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    backgroundColor: '#3A9BE8',
    borderColor: '#3A9BE8',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginTop: 18,
  },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 8 },
  cancelText: { color: '#475569', fontWeight: '700' },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: '#475569', fontWeight: '800', fontSize: 14 },
  confirmButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3A9BE8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmText: { color: '#FFFFFF', fontWeight: '700' },
  confirmText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});