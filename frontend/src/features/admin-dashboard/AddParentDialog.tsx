// src/features/admin-dashboard/AddParentDialog.tsx

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../theme/typography';

interface AddParentDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    dailyLimitMinutes?: number;
    pin?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const AddParentDialog: React.FC<AddParentDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyLimit, setDailyLimit] = useState('60');
  const [pin, setPin] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    setUsername('');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setDailyLimit('60');
    setPin('');
    setIsPasswordVisible(false);
    setIsSubmitting(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetState();
    onDismiss();
  };

  const handleSubmit = async () => {
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter a username for the parent account.');
      return;
    }
    if (cleanUser.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter an initial password.');
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (cleanPin && !/^\d{4}$/.test(cleanPin)) {
      setErrorMessage('PIN must be exactly 4 digits, or left empty.');
      return;
    }

    const limitNum = parseInt(dailyLimit, 10);
    const validLimit = isNaN(limitNum) || limitNum < 1 ? 60 : limitNum;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await onConfirm({
        username: cleanUser,
        displayName: displayName.trim() || cleanUser,
        email: cleanEmail,
        password: cleanPass,
        dailyLimitMinutes: validLimit,
        pin: cleanPin || undefined,
      });

      if (result.success) {
        handleClose();
      } else {
        setErrorMessage(result.error ?? 'Failed to create parent account.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message ?? 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID="add_parent_dialog"
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Parent Account</Text>
              <Text style={styles.subtitle}>
                Create credentials for a new parent user
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
            >
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. sarah_parent"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name / Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sarah Jenkins"
                placeholderTextColor="#94A3B8"
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. sarah@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Password * (Min 6 chars)</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Set account password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrorMessage(null);
                  }}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
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
            </View>

            {/* Daily Screen Time Limit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daily Screen Time Limit (Minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                placeholderTextColor="#94A3B8"
                value={dailyLimit}
                onChangeText={setDailyLimit}
                keyboardType="numeric"
              />
            </View>

            {/* 4-digit PIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent Gate PIN (Optional, 4 digits)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1234"
                placeholderTextColor="#94A3B8"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Error banner */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Create Parent</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    ...Typography.titleLarge,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
    paddingRight: 50,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    width: 44,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#3A9BE8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

