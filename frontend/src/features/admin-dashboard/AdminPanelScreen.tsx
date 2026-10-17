// src/features/admin-dashboard/AdminPanelScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { MaterialIconsIconName } from 'react-native-vector-icons/MaterialIcons';
import { Typography } from '../../theme/typography';

import { AdminOverviewView } from './AdminOverviewView';
import { AdminParentsListView } from './AdminParentsListView';
import { AdminChildrenListView } from './AdminChildrenListView';
import { AdminContentOversightView } from './AdminContentOversightView';
import { AddParentDialog } from './AddParentDialog';

import { useParentAdminStore } from '../../store/parentAdminStore';
import { AdminSection } from '../../types/navigation';
import { resetToChildLogin } from '../../app/navigation/navigationRef';

/**
 * AdminPanelScreen
 * Migrated 1:1 from Kotlin AdminPanelScreen.kt
 * 
 * Dark top bar + 4-item bottom nav
 * Sections: Overview, Parents, Children, Content
 */

export const AdminPanelScreen: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>(
    AdminSection.OVERVIEW
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddParent, setShowAddParent] = useState(false);

  const adminDashboard = useParentAdminStore((s) => s.adminDashboard);
  const adminParents = useParentAdminStore((s) => s.adminParents);
  const adminChildren = useParentAdminStore((s) => s.adminChildrenList);
  const adminVideos = useParentAdminStore((s) => s.adminVideos);

  const fetchAdminDashboard = useParentAdminStore(
    (s) => s.fetchAdminDashboard
  );
  const fetchAdminParents = useParentAdminStore((s) => s.fetchAdminParents);
  const fetchAdminChildren = useParentAdminStore((s) => s.fetchAdminChildren);
  const fetchAdminContent = useParentAdminStore((s) => s.fetchAdminContent);
  const createParentByAdmin = useParentAdminStore((s) => s.createParentByAdmin);
  const toggleParentStatus = useParentAdminStore((s) => s.toggleParentStatus);
  const toggleChildStatus = useParentAdminStore((s) => s.toggleChildStatus);
  const moderateContent = useParentAdminStore((s) => s.moderateContent);
  const logoutAdmin = useParentAdminStore((s) => s.logoutAdmin);

  useEffect(() => {
    fetchAdminDashboard();
    fetchAdminParents();
    fetchAdminChildren();
    fetchAdminContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReturnToApp = () => {
    Alert.alert('Log out', 'Log out of the admin account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logoutAdmin();
          resetToChildLogin();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} testID="admin_panel_screen">
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleReturnToApp}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.logoBadge}>
          <MaterialIcons
            name="admin-panel-settings"
            size={20}
            color="#0F172A"
          />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.topTitle}>KiddoTube Admin Console</Text>
          <Text style={styles.topSubtitle}>
            System Governance • Safe screens. Big smiles.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.kidsViewButton}
          onPress={handleReturnToApp}
        >
          <Text style={styles.kidsViewText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {currentSection === AdminSection.OVERVIEW && (
          <AdminOverviewView
            stats={adminDashboard}
            onRefresh={() => {
              fetchAdminDashboard();
              fetchAdminParents();
              fetchAdminChildren();
            }}
          />
        )}

        {currentSection === AdminSection.PARENTS && (
          <AdminParentsListView
            parents={adminParents}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              fetchAdminParents(q);
            }}
            onToggleStatus={(id) => toggleParentStatus(id)}
            onAddParentClick={() => setShowAddParent(true)}
          />
        )}

        {currentSection === AdminSection.CHILDREN && (
          <AdminChildrenListView
            children={adminChildren}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              fetchAdminChildren(q);
            }}
            onToggleStatus={(id) => toggleChildStatus(id)}
          />
        )}

        {currentSection === AdminSection.CONTENT && (
          <AdminContentOversightView
            videos={adminVideos}
            onModerate={(id, action) =>
              moderateContent('video', id, action)
            }
          />
        )}
      </View>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="dns"
          label="Overview"
          isSelected={currentSection === AdminSection.OVERVIEW}
          onPress={() => setCurrentSection(AdminSection.OVERVIEW)}
        />
        <NavItem
          icon="manage-accounts"
          label="Parents"
          isSelected={currentSection === AdminSection.PARENTS}
          onPress={() => setCurrentSection(AdminSection.PARENTS)}
        />
        <NavItem
          icon="people"
          label="Children"
          isSelected={currentSection === AdminSection.CHILDREN}
          onPress={() => setCurrentSection(AdminSection.CHILDREN)}
        />
        <NavItem
          icon="video-library"
          label="Content"
          isSelected={currentSection === AdminSection.CONTENT}
          onPress={() => setCurrentSection(AdminSection.CONTENT)}
        />
      </View>

      <AddParentDialog
        visible={showAddParent}
        onDismiss={() => setShowAddParent(false)}
        onConfirm={createParentByAdmin}
      />
    </SafeAreaView>
  );
};

// --- NavItem ---
interface NavItemProps {
  icon: MaterialIconsIconName;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.navItem}
    activeOpacity={0.75}
    onPress={onPress}
  >
    <MaterialIcons
      name={icon}
      size={22}
      color={isSelected ? '#38BDF8' : '#94A3B8'}
    />
    <Text
      style={[
        styles.navLabel,
        { color: isSelected ? '#38BDF8' : '#94A3B8' },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  topBar: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  titleBlock: {
    flex: 1,
    marginLeft: 10,
  },
  topTitle: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  topSubtitle: {
    ...Typography.labelSmall,
    color: '#94A3B8',
    marginTop: 2,
  },
  kidsViewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kidsViewText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});