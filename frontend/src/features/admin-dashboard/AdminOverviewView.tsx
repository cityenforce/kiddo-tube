// src/features/admin-dashboard/AdminOverviewView.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import type { AdminStatsDto } from '../../types/api';

/**
 * AdminOverviewView
 * Migrated from Kotlin AdminPanelScreen.kt → AdminOverviewView
 * 
 * System health + stats grid + security audit
 */

interface AdminOverviewViewProps {
  stats: AdminStatsDto | null;
  onRefresh: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  stats,
  onRefresh,
}) => {
  const s: AdminStatsDto =
    stats ?? {
      totalParents: 0,
      activeParents: 0,
      disabledParents: 0,
      totalChildren: 0,
      activeChildren: 0,
      disabledChildren: 0,
      totalChannels: 0,
      totalPlaylists: 0,
      totalVideos: 0,
      systemStatus: 'ONLINE',
      uptimeSeconds: 0,
      nodeVersion: '—',
      databaseType: '—',
    };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* System health card */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <View style={styles.healthStatusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              SYSTEM {s.systemStatus}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={22} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.healthTitle}>
          Production Platform Telemetry
        </Text>
        <Text style={styles.healthMeta}>
          Node.js Engine {s.nodeVersion} • Database: {s.databaseType}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Platform Statistics (Real Backend)
      </Text>

      {/* Row 1 */}
      <View style={styles.row}>
        <StatCard
          title="Total Parents"
          count={`${s.totalParents}`}
          sub={`${s.activeParents} active / ${s.disabledParents} disabled`}
          color="#0284C7"
          color={Colors.kidsSkyBlue}
        />
        <StatCard
          title="Total Children"
          count={`${s.totalChildren}`}
          sub={`${s.activeChildren} active / ${s.disabledChildren} disabled`}
          color="#059669"
          color={Colors.kidsCoral}
        />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <StatCard
          title="Approved Videos"
          count={`${s.totalVideos}`}
          sub="Filtered YouTube whitelist"
          color="#D97706"
          color={Colors.kidsSunnyYellow}
        />
        <StatCard
          title="Approved Channels"
          count={`${s.totalChannels}`}
          sub="Curated content hubs"
          color="#7C3AED"
          color={Colors.kidsSkyBlue}
        />
      </View>

      {/* Security audit card */}
      <View style={styles.auditCard}>
        <View style={styles.auditHeader}>
          <MaterialIcons name="security" size={20} color="#059669" />
          <MaterialIcons name="security" size={22} color={Colors.kidsSkyBlue} />
          <Text style={styles.auditTitle}>
            Zero-Trust Security Verification
          </Text>
        </View>
        <Text style={styles.auditBody}>
          • Role-Based Access: CHILD, PARENT, ADMIN enforced at HTTP
          middleware.{'\n'}
          • Passwords & PINs securely hashed; no plaintext stored.{'\n'}
          • Rate-limiting active: 3 failed attempts triggers automatic 60s
          cooldown.
        </Text>
      </View>
    </ScrollView>
  );
};

// --- StatCard ---
interface StatCardProps {
  title: string;
  count: string;
  sub: string;
  color: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, count, sub, color }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={styles.statSub}>{sub}</Text>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  healthCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  refreshButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
    marginTop: 12,
  },
  healthMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  statCount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auditTitle: {
    fontWeight: '700',
    fontSize: 15,
    fontWeight: '800',
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 8,
  },
  auditBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 22,
    marginTop: 10,
  },
});