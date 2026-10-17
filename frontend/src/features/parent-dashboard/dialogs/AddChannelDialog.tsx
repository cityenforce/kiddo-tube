// src/features/parent-dashboard/dialogs/AddChannelDialog.tsx

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

/**
 * AddChannelDialog
 * Migrated 1:1 from Kotlin ParentPanelScreen.kt → AddChannelDialog
 */

interface AddChannelDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (
    title: string,
    channelUrlOrId: string,
    desc: string,
    category: string
  ) => void;
}

const CATEGORY_OPTIONS = [
  { key: 'SHOWS', label: 'Shows', icon: 'movie' },
  { key: 'LEARNING', label: 'Learning', icon: 'lightbulb' },
  { key: 'MUSIC', label: 'Music', icon: 'music-note' },
  { key: 'EXPLORE', label: 'Explore', icon: 'explore' },
];

export const AddChannelDialog: React.FC<AddChannelDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [channelUrlOrId, setChannelUrlOrId] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SHOWS');

  const handleClose = () => {
    setTitle('');
    setChannelUrlOrId('');
    setDescription('');
    setCategory('SHOWS');
    onDismiss();
  };

  const handleApprove = () => {
    if (!channelUrlOrId.trim()) {
      Alert.alert(
        'Missing channel details',
        'Enter a YouTube channel URL, handle, or ID.'
      );
      return;
    }
    onConfirm(
      title.trim(),
      channelUrlOrId.trim(),
      description.trim(),
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
          <Text style={styles.title}>Approve YouTube Channel</Text>
          <Text style={styles.helpText}>
            Optional: enter a custom name for children to see. Otherwise, the YouTube channel name is used.
          </Text>

          <ScrollView
            contentContainerStyle={{ paddingVertical: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>Custom Channel Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nursery Songville"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>YouTube Channel URL or @Handle *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://youtube.com/@channel or UC..."
              placeholderTextColor="#94A3B8"
              value={channelUrlOrId}
              onChangeText={setChannelUrlOrId}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Description for kids"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
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
              <Text style={styles.confirmText}>Approve Channel</Text>
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
  helpText: { color: '#64748B', fontSize: 12, marginBottom: 4 },
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