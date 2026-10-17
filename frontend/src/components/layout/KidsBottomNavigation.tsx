// src/components/layout/KidsBottomNavigation.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { MaterialIconsIconName } from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { ChildTab } from '../../types/navigation';

/**
 * KidsBottomNavigation
 * Migrated 1:1 from Kotlin KidsBottomNavigation.kt
 * 
 * 4 tabs: Home, Explore, Search, Profile
 * Profile tab shows avatar emoji instead of icon
 */

interface TabMeta {
  tab: ChildTab;
  label: string;
  activeIcon: MaterialIconsIconName;
  inactiveIcon: MaterialIconsIconName;
}

const TABS: TabMeta[] = [
  {
    tab: ChildTab.HOME,
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home',
  },
  {
    tab: ChildTab.SEARCH,
    label: 'Search',
    activeIcon: 'search',
    inactiveIcon: 'search',
  },
  {
    tab: ChildTab.EXPLORE,
    label: 'Your stuff',
    activeIcon: 'star',
    inactiveIcon: 'star-border',
  },
  {
    tab: ChildTab.PROFILE,
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

interface KidsBottomNavigationProps {
  selectedTab: ChildTab;
  profileEmoji?: string;
  onTabSelected: (tab: ChildTab) => void;
}

export const KidsBottomNavigation: React.FC<KidsBottomNavigationProps> = ({
  selectedTab,
  profileEmoji = '🥷',
  onTabSelected,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TABS.map((meta) => {
          const isSelected = meta.tab === selectedTab;

          return (
            <TouchableOpacity
              key={meta.tab}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => onTabSelected(meta.tab)}
              testID={`nav_tab_${meta.tab.toLowerCase()}`}
            >
              {meta.tab === ChildTab.PROFILE ? (
                // Profile avatar pill
                <View
                  style={[
                    styles.profileAvatar,
                    isSelected && styles.profileAvatarSelected,
                  ]}
                >
                  <Text style={styles.profileEmoji}>{profileEmoji}</Text>
                </View>
              ) : (
                <MaterialIcons
                  name={isSelected ? meta.activeIcon : meta.inactiveIcon}
                  size={26}
                  color={
                    isSelected ? Colors.kidsTextPrimary : Colors.kidsTextMuted
                  }
                />
              )}

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected
                      ? Colors.kidsTextPrimary
                      : Colors.kidsTextMuted,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 68,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarSelected: {
    borderWidth: 2,
    borderColor: Colors.kidsPrimary,
  },
  profileEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});