// src/theme/dimensions.ts

/**
 * KidsStream Dimensions Tokens
 * Migrated 1:1 from Kotlin Dimensions.kt
 * All values in dp → React Native number (density-independent pixels)
 */

export const Dimensions = {
  // Spacing
  spaceExtraSmall: 4,
  spaceSmall: 8,
  spaceMedium: 16,
  spaceLarge: 24,
  spaceExtraLarge: 32,

  // Border Radii (Soft, playful corners)
  radiusSmall: 12,
  radiusMedium: 18,
  radiusLarge: 26,
  radiusPill: 999,

  // Touch Targets (Meeting and exceeding accessibility for kids)
  touchTargetMin: 48,
  touchTargetLarge: 56,
  touchTargetHero: 64,

  // Icons
  iconSmall: 18,
  iconMedium: 24,
  iconLarge: 32,
  iconHero: 48,

  // Cards & Elevations
  cardElevationDefault: 3,
  cardElevationPressed: 8,
  cardBorderWidth: 1.5,

  // Heights
  // Heights & Inputs
  headerHeight: 64,
  bottomNavHeight: 72,
  channelAvatarSize: 72,
  categoryChipHeight: 44,
  inputHeight: 52,
  inputRadius: 14,
  inputPaddingHorizontal: 16,
  inputPaddingVertical: 13,
} as const;

export type DimensionKey = keyof typeof Dimensions;