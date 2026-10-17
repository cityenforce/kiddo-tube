// src/components/layout/KidsPolicyDialog.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';

/**
 * KidsPolicyDialog
 * Displayed when clicking the Shield safety icon next to Settings.
 * Outlines the safety safeguards, parental approval rules, and privacy policies.
 */

interface KidsPolicyDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export const KidsPolicyDialog: React.FC<KidsPolicyDialogProps> = ({
  visible,
  onDismiss,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialogCard} testID="kids_policy_dialog">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="security" size={26} color={Colors.kidsSkyBlue} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Safety & Policy</Text>
              <Text style={styles.subtitle}>Parent-Controlled Safe Streaming</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={Colors.kidsTextMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.item}>
              <MaterialIcons name="verified-user" size={22} color={Colors.kidsSkyBlue} style={styles.bulletIcon} />
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>100% Parent-Approved Content</Text>
                <Text style={styles.itemDesc}>
                  Children can only view videos, channels, and playlists explicitly added and approved by parents from the Parent Dashboard.
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <MaterialIcons name="block" size={22} color={Colors.kidsCoral} style={styles.bulletIcon} />
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Zero Commercial Ads & Links</Text>
                <Text style={styles.itemDesc}>
                  No third-party advertisements, unapproved external links, or unmoderated comment sections are permitted.
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <MaterialIcons name="timer" size={22} color={Colors.kidsSunnyYellow} style={styles.bulletIcon} />
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Healthy Screen Time Limits</Text>
                <Text style={styles.itemDesc}>
                  Daily watching limits are strictly enforced. When time expires, watch sessions automatically lock until parent authorization.
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <MaterialIcons name="lock" size={22} color={Colors.kidsSkyBlue} style={styles.bulletIcon} />
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>COPPA & Child Privacy</Text>
                <Text style={styles.itemDesc}>
                  We do not collect personal identifiers, tracking data, or behavioral profiles from child users.
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.85}
            onPress={onDismiss}
          >
            <Text style={styles.doneText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1F3FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 19,
    marginTop: 3,
  },
  doneButton: {
    backgroundColor: Colors.kidsSkyBlue,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

