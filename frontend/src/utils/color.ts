// src/utils/color.ts

/**
 * Color Conversion Utilities
 * Kotlin: Color(0xFF00A6FB) → React Native: '#00A6FB'
 * 
 * Kotlin uses ARGB Long format (0xAARRGGBB)
 * React Native uses #RRGGBB or #AARRGGBB strings
 */

/**
 * Convert Kotlin hex Long (e.g. 0xFF00A6FB) to RN color string
 * Handles both 0xAARRGGBB and plain 0xRRGGBB
 */
export const hexLongToColor = (value: number): string => {
  // Ensure positive unsigned 32-bit
  const unsigned = value >>> 0;
  const hex = unsigned.toString(16).padStart(8, '0').toUpperCase();

  const alpha = hex.slice(0, 2);
  const rgb = hex.slice(2);

  // If alpha is FF (fully opaque), return #RRGGBB
  if (alpha === 'FF') {
    return `#${rgb}`;
  }
  // Otherwise include alpha
  return `#${alpha}${rgb}`;
};

/**
 * Get readable initial from a title (for channel avatar fallback)
 * Kotlin: channel.title.firstOrNull()?.toString() ?: "C"
 */
export const getInitial = (text: string | undefined | null): string => {
  if (!text || text.trim().length === 0) return '?';
  return text.trim().charAt(0).toUpperCase();
};

/**
 * Add alpha channel to a hex color
 * Kotlin: Color.copy(alpha = 0.15f)
 */
export const withAlpha = (hexColor: string, alpha: number): string => {
  const clampedAlpha = Math.min(1, Math.max(0, alpha));
  const alphaHex = Math.round(clampedAlpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  // Strip existing # and any alpha
  let rgb = hexColor.replace('#', '');
  if (rgb.length === 8) {
    rgb = rgb.slice(2);
  }

  return `#${alphaHex}${rgb}`;
};