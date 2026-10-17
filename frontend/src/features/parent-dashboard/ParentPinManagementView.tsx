// src/features/parent-dashboard/ParentPinManagementView.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

/**
 * ParentPinManagementView
 * Migrated from Kotlin ParentPanelScreen.kt → ParentPinManagementView
 * 
 * Fields: current PIN, new PIN, confirm new PIN
 * Validation: new PIN must be 4 digits and match confirm
 */

interface ParentPinManagementViewProps {
  onUpdatePin: (currentPin: string, newPin: string) => void;
}

export const ParentPinManagementView: React.FC<
  ParentPinManagementViewProps
> = ({ onUpdatePin }) => {
  const [curPin, setCurPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurPin, setShowCurPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [errText, setErrText] = useState<string | null>(null);

  const handleSubmit = () => {
    if (newPin.length !== 4) {
      setErrText('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setErrText('New PIN and confirmation do not match');
      return;
    }
    onUpdatePin(curPin, newPin);
    setCurPin('');
    setNewPin('');
    setConfirmPin('');
    setErrText(null);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="key" size={20} color="#7C3AED" />
          <MaterialIcons name="key" size={22} color={Colors.kidsSkyBlue} />
          <Text style={styles.cardTitle}>Security PIN Management</Text>
        </View>

        <Text style={styles.explanation}>
          Set a 4-digit PIN to protect time extensions and adult settings.
          Leave the current PIN blank if you have not set one yet.
        </Text>

        <View style={styles.pinWrap}>
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="Current PIN (leave blank if not set)"
            placeholderTextColor="#94A3B8"
            value={curPin}
            onChangeText={(t) => {
              setCurPin(t.replace(/[^0-9]/g, '').slice(0, 4));
              setErrText(null);
            }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={!showCurPin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowCurPin(!showCurPin)}
            accessibilityLabel="Toggle current PIN visibility"
          >
            <MaterialIcons
              name={showCurPin ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.pinWrap}>
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="New 4-Digit PIN"
            placeholderTextColor="#94A3B8"
            value={newPin}
            onChangeText={(t) => {
              setNewPin(t.replace(/[^0-9]/g, '').slice(0, 4));
              setErrText(null);
            }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={!showNewPin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNewPin(!showNewPin)}
            accessibilityLabel="Toggle new PIN visibility"
          >
            <MaterialIcons
              name={showNewPin ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.pinWrap}>
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="Confirm New PIN"
            placeholderTextColor="#94A3B8"
            value={confirmPin}
            onChangeText={(t) => {
              setConfirmPin(t.replace(/[^0-9]/g, '').slice(0, 4));
              setErrText(null);
            }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry={!showConfirmPin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirmPin(!showConfirmPin)}
            accessibilityLabel="Toggle confirm PIN visibility"
          >
            <MaterialIcons
              name={showConfirmPin ? 'visibility-off' : 'visibility'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        {errText ? <Text style={styles.errorText}>{errText}</Text> : null}

        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Update PIN Securely</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: '#0F172A',
    fontWeight: '700',
    marginLeft: 8,
  },
  explanation: {
    ...Typography.bodySmall,
    color: '#64748B',
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    marginBottom: 12,
    marginBottom: 14,
    lineHeight: 20,
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
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  pinWrap: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginTop: 10,
  },
  pinInput: {
    marginTop: 0,
    paddingRight: 44,
    paddingRight: 50,
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 40,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 20,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: Colors.kidsSkyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontWeight: '800',
    fontSize: 16,
  },
});