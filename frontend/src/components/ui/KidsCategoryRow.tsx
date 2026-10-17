// src/components/ui/KidsCategoryRow.tsx

import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Dimensions } from '../../theme/dimensions';
import { VideoCategory } from '../../types/models';
import { CATEGORY_TABS } from '../../constants/tabs';

/**
 * KidsCategoryRow
 * Migrated 1:1 from Kotlin KidsCategoryRow.kt
 * 
 * Horizontal scrollable row of category chips
 * Active chip: dark background + white text
 * Inactive chip: white bg + border + dark text
 */

interface KidsCategoryRowProps {
  selectedCategory: VideoCategory;
  onCategorySelected: (category: VideoCategory) => void;
}

export const KidsCategoryRow: React.FC<KidsCategoryRowProps> = ({
  selectedCategory,
  onCategorySelected,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {CATEGORY_TABS.map((meta) => {
        const isSelected = meta.category === selectedCategory;

        return (
          <TouchableOpacity
            key={meta.category}
            activeOpacity={0.7}
            onPress={() => onCategorySelected(meta.category)}
            style={[
              styles.chip,
              isSelected ? styles.chipActive : styles.chipInactive,
            ]}
            testID={`category_pill_${meta.category.toLowerCase()}`}
          >
            <MaterialIcons
              name={meta.icon}
              size={19}
              color={isSelected ? Colors.kidsOnPrimary : Colors.kidsTextPrimary}
            />
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected
                    ? Colors.kidsOnPrimary
                    : Colors.kidsTextPrimary,
                  fontWeight: isSelected ? '700' : '600',
                },
              ]}
            >
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Dimensions.spaceMedium,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  chipInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    borderRadius: 14,
  },
  chipText: {
    fontSize: 14,
    marginLeft: 6,
  },
});