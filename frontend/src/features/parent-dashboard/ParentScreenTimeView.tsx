// src/features/parent-dashboard/ParentScreenTimeView.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Typography } from '../../theme/typography';
import type { ChildDetailDto } from '../../types/api';

/**
 * ParentScreenTimeView
 * Migrated from Kotlin ParentPanelScreen.kt → ParentScreenTimeView
 * 
 * Global daily limit slider (15–180 min), applies to all children
 * Plus a preview list of affected children
 */

interface ParentScreenTimeViewProps {
  currentLimit: number;
  children: ChildDetailDto[];
  onSaveDailyLimit: (limit: number) => void;
}

export const ParentScreenTimeView: React.FC<ParentScreenTimeViewProps> = ({
  currentLimit,
  children,
  onSaveDailyLimit,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(currentLimit);
  const [customHours, setCustomHours] = useState(
    String(Math.floor(currentLimit / 60))
  );
  const [customMinutes, setCustomMinutes] = useState(
    String(currentLimit % 60)
  );

  const presets = [30, 60, 120, 180, 360];

  const applyCustomTime = (hoursText: string, minutesText: string) => {
    const hours = Math.min(6, Math.max(0, Number(hoursText) || 0));
    const minutes = Math.min(59, Math.max(0, Number(minutesText) || 0));
    const total = Math.max(1, Math.min(360, hours * 60 + minutes));
    setSelectedMinutes(total);
    setCustomHours(String(Math.floor(total / 60)));
    setCustomMinutes(String(total % 60));
  };

  const adjustUnit = (
    unit: 'hours' | 'minutes',
    change: number
  ) => {
    const nextHours = unit === 'hours'
      ? String(Math.min(6, Math.max(0, (Number(customHours) || 0) + change)))
      : customHours;
    const nextMinutes = unit === 'minutes'
      ? String(Math.min(59, Math.max(0, (Number(customMinutes) || 0) + change)))
      : customMinutes;
    setCustomHours(nextHours);
    setCustomMinutes(nextMinutes);
    applyCustomTime(nextHours, nextMinutes);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="timer" size={20} color="#D97706" />
          <Text style={styles.cardTitle}>Daily Screen Time Setting</Text>
        </View>

        <Text style={styles.explanation}>
          This daily limit is configured at the Parent Account level and
          automatically applies to all children under this account.
        </Text>

        <Text style={styles.rangeLabel}>Set a daily time range</Text>
        <Text style={styles.bigMinutes}>
          {Math.floor(selectedMinutes / 60)} hr {selectedMinutes % 60} min / day
        </Text>

        <Slider
          style={styles.slider}
          value={Math.min(360, Math.max(15, selectedMinutes))}
          onValueChange={(v) => {
            const limit = Math.round(v);
            setSelectedMinutes(limit);
            setCustomHours(String(Math.floor(limit / 60)));
            setCustomMinutes(String(limit % 60));
          }}
          minimumValue={15}
          maximumValue={360}
          step={15}
          minimumTrackTintColor="#D97706"
          maximumTrackTintColor="#E2E8F0"
          thumbTintColor="#D97706"
        />

        {/* Preset buttons */}
        <View style={styles.presetRow}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                selectedMinutes === preset && styles.presetButtonActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedMinutes(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  selectedMinutes === preset && styles.presetTextActive,
                ]}
              >
                {preset}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.customTitle}>Custom time</Text>
        <View style={styles.customRow}>
          <TimeUnitControl
            label="Hours"
            value={customHours}
            onChange={(value) => {
              const safe = value.replace(/[^0-9]/g, '').slice(0, 1);
              setCustomHours(safe);
              applyCustomTime(safe, customMinutes);
            }}
            onAdjust={(change) => adjustUnit('hours', change)}
          />
          <TimeUnitControl
            label="Minutes"
            value={customMinutes}
            onChange={(value) => {
              const safe = value.replace(/[^0-9]/g, '').slice(0, 2);
              setCustomMinutes(safe);
              applyCustomTime(customHours, safe);
            }}
            onAdjust={(change) => adjustUnit('minutes', change)}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={() => onSaveDailyLimit(selectedMinutes)}
        >
          <Text style={styles.saveText}>
            Save & Apply to All Children
          </Text>
        </TouchableOpacity>
      </View>

      {/* Affected children list */}
      <Text style={styles.affectedTitle}>
        Currently Active Explorers Subject to this Limit:
      </Text>

      {children.map((child) => (
        <View key={child.id} style={styles.childRow}>
          <Text style={styles.childEmoji}>{child.avatarEmoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.childName}>{child.displayName}</Text>
            <Text style={styles.childMeta}>
              Currently used: {child.minutesWatchedToday}m today
            </Text>
          </View>
          <Text style={styles.childLimit}>{selectedMinutes}m allowed</Text>
        </View>
      ))}
    </ScrollView>
  );
};

interface TimeUnitControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAdjust: (change: number) => void;
}

const TimeUnitControl: React.FC<TimeUnitControlProps> = ({
  label,
  value,
  onChange,
  onAdjust,
}) => (
  <View style={styles.timeUnit}>
    <Text style={styles.timeUnitLabel}>{label}</Text>
    <View style={styles.timeUnitInputRow}>
      <TextInput
        style={styles.timeInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={2}
        selectTextOnFocus
      />
      <View style={styles.stepper}>
        <TouchableOpacity
          accessibilityLabel={`Increase ${label.toLowerCase()}`}
          onPress={() => onAdjust(1)}
          style={styles.stepButton}
        >
          <MaterialIcons name="keyboard-arrow-up" size={22} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Decrease ${label.toLowerCase()}`}
          onPress={() => onAdjust(-1)}
          style={styles.stepButton}
        >
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

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
    marginBottom: 16,
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
    marginTop: 8,
  },
  rangeLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
  },
  bigMinutes: {
    fontSize: 27,
    fontWeight: '900',
    color: '#D97706',
    textAlign: 'center',
    marginTop: 8,
  },
  slider: {
    marginTop: 8,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  presetTextActive: {
    color: '#D97706',
  },
  customTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 20,
  },
  customRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  timeUnit: { flex: 1 },
  timeUnitLabel: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  timeUnitInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginTop: 5,
    paddingRight: 3,
  },
  timeInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 17,
    color: '#0F172A',
    textAlign: 'center',
  },
  stepper: { alignItems: 'center' },
  stepButton: {
    width: 34,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: 20,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  affectedTitle: {
    ...Typography.labelMedium,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  childEmoji: {
    fontSize: 24,
  },
  childName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F172A',
  },
  childMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  childLimit: {
    fontWeight: '700',
    color: '#059669',
    fontSize: 13,
  },
});