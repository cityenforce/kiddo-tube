// src/utils/formatTime.ts

/**
 * Time & Duration Formatting Utilities
 * Extracted from inline Kotlin logic for reusability
 */

/**
 * Format remaining minutes as human-readable
 * Kotlin: "${remainingMinutes} min left"
 */
export const formatRemainingMinutes = (remainingMinutes: number): string => {
  return `${remainingMinutes} min left`;
};

/**
 * Format compact minutes for player badge
 * Kotlin: "${remainingMinutes}m"
 */
export const formatCompactMinutes = (minutes: number): string => {
  return `${minutes}m`;
};

/**
 * Format minutes + seconds as MM:SS
 * Used in player countdown
 */
export const formatCountdown = (totalSeconds: number): string => {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Format usage string used in ChildProfileScreen
 * Kotlin: "$usedMinutes min used out of $dailyLimitMinutes min daily limit"
 */
export const formatUsageText = (
  usedMinutes: number,
  dailyLimitMinutes: number
): string => {
  return `${usedMinutes} min used out of ${dailyLimitMinutes} min daily limit`;
};

/**
 * Format today's watched text for parent dashboard
 * Kotlin: "${child.minutesWatchedToday}m today"
 */
export const formatTodayWatched = (minutes: number): string => {
  return `${minutes}m today`;
};

/**
 * Format duration text with fallback
 * Kotlin: video.durationText default "05:00"
 */
export const formatVideoDuration = (
  durationText: string | undefined | null
): string => {
  return durationText && durationText.trim().length > 0
    ? durationText
    : '05:00';
};

/**
 * Compute used minutes from remaining + limit
 * Kotlin: val usedMinutes = maxOf(0, dailyLimitMinutes - remainingMinutes)
 */
export const computeUsedMinutes = (
  dailyLimitMinutes: number,
  remainingMinutes: number
): number => {
  return Math.max(0, dailyLimitMinutes - remainingMinutes);
};

/**
 * Compute progress fraction (0..1) for LinearProgressIndicator
 * Kotlin: (usedMinutes.toFloat() / dailyLimitMinutes).coerceIn(0f, 1f)
 */
export const computeProgress = (
  usedMinutes: number,
  dailyLimitMinutes: number
): number => {
  if (dailyLimitMinutes <= 0) return 0;
  return Math.min(1, Math.max(0, usedMinutes / dailyLimitMinutes));
};