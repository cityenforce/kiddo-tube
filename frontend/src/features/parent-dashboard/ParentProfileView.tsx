import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import type { ParentAccountDto } from '../../types/api';

interface ActionResult {
  success: boolean;
  error?: string;
}

interface ParentProfileViewProps {
  account: ParentAccountDto | null;
  onSaveProfile: (username: string, email: string) => Promise<ActionResult>;
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<ActionResult>;
}

export const ParentProfileView: React.FC<ParentProfileViewProps> = ({
  account,
  onSaveProfile,
  onChangePassword,
}) => {
  const [username, setUsername] = useState(account?.username ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsername(account?.username ?? '');
    setEmail(account?.email ?? '');
  }, [account?.email, account?.username]);

  const saveProfile = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Missing details', 'Enter a username and email address.');
      return;
    }
    setIsSaving(true);
    const result = await onSaveProfile(username.trim(), email.trim());
    setIsSaving(false);
    Alert.alert(
      result.success ? 'Profile updated' : 'Could not update profile',
      result.success
        ? 'Your username and email have been saved.'
        : result.error ?? 'Please try again.'
    );
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing password', 'Enter your current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Confirm the new password again.');
      return;
    }

    setIsSaving(true);
    const result = await onChangePassword(currentPassword, newPassword);
    setIsSaving(false);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    Alert.alert(
      result.success ? 'Password updated' : 'Could not change password',
      result.success
        ? 'Your new password is active.'
        : result.error ?? 'Please try again.'
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.heading}>
          <MaterialIcons name="account-circle" size={24} color="#0284C7" />
          <Text style={styles.title}>Profile details</Text>
        </View>
        <Text style={styles.help}>
          Update the username and email used for your parent account.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={saveProfile}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Save profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.heading}>
          <MaterialIcons name="lock" size={22} color="#7C3AED" />
          <MaterialIcons name="lock" size={22} color={Colors.kidsSkyBlue} />
          <Text style={styles.title}>Change password</Text>
        </View>
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPass}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowCurrentPass(!showCurrentPass)}
            accessibilityLabel="Toggle current password visibility"
          >
            <MaterialIcons
              name={showCurrentPass ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="New password (at least 6 characters)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPass}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowNewPass(!showNewPass)}
            accessibilityLabel="Toggle new password visibility"
          >
            <MaterialIcons
              name={showNewPass ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPass}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPass(!showConfirmPass)}
            accessibilityLabel="Toggle confirm password visibility"
          >
            <MaterialIcons
              name={showConfirmPass ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.passwordButton]}
          onPress={savePassword}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Update password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 36 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  help: { color: '#64748B', fontSize: 13, marginTop: 8 },
  help: { color: '#475569', fontSize: 14, fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: 1,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
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
  button: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    height: 46,
    backgroundColor: Colors.kidsSkyBlue,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginTop: 18,
  },
  passwordButton: { backgroundColor: '#7C3AED' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  passwordButton: { backgroundColor: Colors.kidsCoral },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
