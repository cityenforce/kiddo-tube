import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../../theme/typography';

/**
 * ResetPasswordDialog
 * Migrated 1:1 from Kotlin ParentPanelScreen.kt → ResetPasswordDialog
 */

interface ResetPasswordDialogProps {
  visible: boolean;
  childName: string;
  onDismiss: () => void;
  onConfirm: (newPassword: string) => void;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  visible,
  childName,
  onDismiss,
  onConfirm,
}) => {
  const [newPassword, setNewPassword] = useState('1234');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleClose = () => {
    setNewPassword('1234');
    setIsPasswordVisible(false);
    onDismiss();
  };

  const handleConfirm = () => {
    if (!newPassword.trim()) return;
    onConfirm(newPassword.trim());
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
          <Text style={styles.title}>Reset Password for {childName}</Text>
          <Text style={styles.body}>
            Enter the new password for your child to use on the login screen:
          </Text>

          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="New Password"
              placeholderTextColor="#94A3B8"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              accessibilityLabel="Toggle password visibility"
            >
              <MaterialIcons
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Reset Password</Text>
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
  body: {
    ...Typography.bodyMedium,
    color: '#475569',
    marginBottom: 4,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  passwordWrap: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginTop: 12,
  },
  passwordInput: {
    marginTop: 0,
    paddingRight: 44,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 40,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
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