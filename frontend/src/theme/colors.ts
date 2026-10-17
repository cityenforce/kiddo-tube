// src/theme/colors.ts

/**
 * KidsStream Color Tokens
 * Migrated 1:1 from Kotlin Color.kt
 * All values are exact HEX equivalents
 */

export const Colors = {
  // KiddoTube Brand Palette (Concept 3 - Flying Sun App Icon & Tagline "Safe screens. Big smiles.")
  // Primary Reference Palette:
  kiddoYellow: '#FFC93C',             // Sunny Yellow (Flying Sun / Emblem)
  kiddoBlue: '#3A9BE8',               // Sky Blue (App Icon Badge / Highlights)
  kiddoCoral: '#FF6F61',              // Coral (Playful Accents / Buttons)
  kiddoWhite: '#FFFFFF',              // Pure White
  kiddoDarkNavy: '#0F172A',           // Slate 900
  kiddoNavy: '#1E293B',               // Slate 800

  // Alternative Palette 1 (Playful Lagoon):
  kiddoAlt1Amber: '#FFB703',
  kiddoAlt1Ocean: '#0284C7',
  kiddoAlt1Tangerine: '#FB7185',
  kiddoAlt1Surface: '#F8FAFC',

  // Alternative Palette 2 (Cozy Sunset):
  kiddoAlt2Sunshine: '#FDE047',
  kiddoAlt2Azure: '#2563EB',
  kiddoAlt2Sunset: '#F43F5E',
  kiddoAlt2Surface: '#FFFBEB',

  // Core Brand Colors (KiddoTube - Cozy Sunset Selected Palette)
  kidsPrimary: '#F43F5E',              // Sunset Rose
  kidsPrimaryDark: '#E11D48',
  kidsPrimaryContainer: '#FFE4E6',
  // Core Brand Colors (KiddoTube Concept 3 Logo Palette)
  kidsPrimary: '#FF6F61',              // Coral (from logo button/accents)
  kidsPrimaryDark: '#E85B4E',
  kidsPrimaryContainer: '#FFEBE8',
  kidsOnPrimary: '#FFFFFF',

  // Category & Accent Colors
  kidsSkyBlue: '#2563EB',              // Royal Azure (Shows)
  kidsSkyBlueContainer: '#DBEAFE',
  kidsSunnyYellow: '#FDE047',          // Pastel Sunshine (Music)
  kidsSunnyYellowContainer: '#FEF9C3',
  kidsMintGreen: '#06D6A0',            // Learning
  kidsMintGreenContainer: '#E6FAF3',
  kidsPlayfulPurple: '#8338EC',        // Explore
  kidsPlayfulPurpleContainer: '#F1E8FD',
  // Category & Accent Colors (Strictly Logo Palette)
  kidsSkyBlue: '#3A9BE8',              // Sky Blue (from logo icon)
  kidsSkyBlueContainer: '#E1F3FE',
  kidsSunnyYellow: '#FFC93C',          // Sunny Yellow (from logo emblem)
  kidsSunnyYellowContainer: '#FFF8E6',
  kidsCoral: '#FF6F61',                // Coral Red (from logo)
  kidsCoralContainer: '#FFEBE8',

  // Compatibility Mappings (Enforcing strict Logo Colors)
  kidsMintGreen: '#3A9BE8',            // Mapped to Logo Sky Blue
  kidsMintGreenContainer: '#E1F3FE',
  kidsPlayfulPurple: '#FFC93C',        // Mapped to Logo Sunny Yellow
  kidsPlayfulPurpleContainer: '#FFF8E6',

  // Atmosphere Gradients
  kidsSkyGradientTop: '#C8EEFD',
  kidsSkyGradientBottom: '#F5FBFF',
  kidsSkyGradientTop: '#E1F3FE',
  kidsSkyGradientBottom: '#FFFFFF',

  // Profile Selection Screen Palette
  kidsProfileRed: '#E52042',
  kidsProfileDarkRed: '#B81532',
  kidsProfileTeal: '#0097A7',
  // Profile Selection Screen Palette (from logo colors)
  kidsProfileRed: '#FF6F61',
  kidsProfileDarkRed: '#E85B4E',
  kidsProfileTeal: '#3A9BE8',

  // Category Chip Tokens
  kidsActiveChipBg: '#1A1A1A',
  kidsActiveChipBg: '#1E293B',
  kidsActiveChipText: '#FFFFFF',
  kidsInactiveChipBg: '#FFFFFF',
  kidsInactiveChipBorder: '#E2EBF0',
  kidsInactiveChipBorder: '#E2E8F0',

  // Surfaces & Cards
  kidsBackground: '#F6F9FD',
  kidsBackground: '#F8FAFC',
  kidsSurface: '#FFFFFF',
  kidsSurfaceVariant: '#EEF5FA',
  kidsCardBorder: '#E5EDF4',
  kidsSurfaceVariant: '#F1F5F9',
  kidsCardBorder: '#E2E8F0',

  // Typography Colors
  kidsTextPrimary: '#192A3E',
  kidsTextSecondary: '#5A6E85',
  kidsTextMuted: '#8C9EAE',
  // Typography Colors (High contrast, bold, accessible)
  kidsTextPrimary: '#1E293B',          // Slate 800 - dark, bold
  kidsTextSecondary: '#475569',        // Slate 600 - rich readable
  kidsTextMuted: '#64748B',            // Slate 500

  // Night/Timeout Calm Palette
  timeoutNightBackground: '#0C1427',
  timeoutNightSurface: '#17233D',
  timeoutMoonGlow: '#FFD166',
  timeoutNightText: '#E8EEF8',
  timeoutNightMuted: '#8EA4C8',
  timeoutNightBackground: '#0F172A',
  timeoutNightSurface: '#1E293B',
  timeoutMoonGlow: '#FFC93C',
  timeoutNightText: '#F8FAFC',
  timeoutNightMuted: '#94A3B8',

  // Status & Controls
  kidsSuccess: '#10B981',
  kidsWarning: '#F59E0B',
  kidsError: '#EF4444',
  kidsLockAccent: '#475569',
  // Status & Controls (Strictly Logo Palette)
  kidsSuccess: '#3A9BE8',              // Logo Sky Blue
  kidsWarning: '#FFC93C',              // Logo Sunny Yellow
  kidsError: '#FF6F61',                // Logo Coral
  kidsLockAccent: '#1E293B',
} as const;

export type ColorKey = keyof typeof Colors;