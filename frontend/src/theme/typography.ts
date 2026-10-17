// src/theme/typography.ts

import { TextStyle } from 'react-native';
import { Colors } from './colors';

/**
 * KidsStream Typography Tokens
 * Migrated 1:1 from Kotlin Type.kt
 * FontFamily.Default maps to System default font
 */

export const Typography: Record<string, TextStyle> = {
  displayLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',      // ExtraBold
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',      // ExtraBold
    letterSpacing: -0.5,
    color: Colors.kidsTextPrimary,
  },
  headlineLarge: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',      // Bold
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',      // Bold
    letterSpacing: 0,
    color: Colors.kidsTextPrimary,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',      // Bold
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',      // Bold
    letterSpacing: 0.15,
    color: Colors.kidsTextPrimary,
  },
  titleLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',      // SemiBold
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',      // SemiBold / Strong
    letterSpacing: 0,
    color: Colors.kidsTextPrimary,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',      // Bold
    letterSpacing: 0.1,
    color: Colors.kidsTextPrimary,
  },
  bodyLarge: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',      // Medium
    letterSpacing: 0.25,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',      // Bold / SemiBold for prominent paragraphs
    letterSpacing: 0.2,
    color: Colors.kidsTextPrimary,
  },
  bodyMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',      // Normal
    letterSpacing: 0.25,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',      // Bold paragraphs
    letterSpacing: 0.2,
    color: Colors.kidsTextSecondary,
  },
  labelLarge: {
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',      // Bold
    fontWeight: '600',      // Clean legible small body
    letterSpacing: 0.2,
    color: Colors.kidsTextSecondary,
  },
  labelLarge: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',      // Strong button/field label
    letterSpacing: 0.1,
    color: Colors.kidsTextPrimary,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',      // SemiBold
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',      // Bold label
    letterSpacing: 0.2,
    color: Colors.kidsTextSecondary,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',      // Bold
    letterSpacing: 0.3,
    color: Colors.kidsTextMuted,
  },
} as const;

export type TypographyKey = keyof typeof Typography;