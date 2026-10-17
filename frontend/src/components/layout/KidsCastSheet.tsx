// src/components/layout/KidsCastSheet.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * KidsCastSheet
 * Cloned directly from YouTube Kids "Select a device" sheet (Screenshot 2).
 * 
 * Purpose:
 * Google Cast / Chromecast feature lets users stream or mirror videos
 * directly to smart TVs, Chromecast dongles, or Google Nest Hub displays
 * on the local Wi-Fi network.
 */

interface KidsCastSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export const KidsCastSheet: React.FC<KidsCastSheetProps> = ({
  visible,
  onDismiss,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer} testID="cast_device_sheet">
              {/* Top drag handle indicator */}
              <View style={styles.handleBar} />

              {/* Title row */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>Select a device</Text>
                <TouchableOpacity onPress={onDismiss} style={styles.closeIconBtn}>
                  <MaterialIcons name="keyboard-arrow-down" size={26} color="#606060" />
                </TouchableOpacity>
              </View>

              {/* No devices status container */}
              <View style={styles.bodyContent}>
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="info-outline"
                    size={28}
                    color="#202124"
                    style={styles.infoIcon}
                  />
                  <View style={styles.textWrap}>
                    <Text style={styles.statusTitle}>No devices available</Text>
                    <Text style={styles.statusSubtitle}>
                      Check your connection and try again
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DADCE0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#202124',
    letterSpacing: -0.2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    marginTop: 18,
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#5F6368',
    marginTop: 4,
    lineHeight: 20,
  },
});

