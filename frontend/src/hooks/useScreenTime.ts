// src/hooks/useScreenTime.ts

import { useScreenTimeStore } from '../store/screenTimeStore';
import { useContentStore } from '../store/contentStore';

/**
 * useScreenTime
 * Convenience hook for screen-time state + auto-initialization
 * 
 * Maps Kotlin pattern:
 *   val screenTimeState by screenTimeRepository.screenTimeState.collectAsState()
 */

export const useScreenTime = () => {
  const state = useScreenTimeStore();
  return {
    // State
    dailyLimitMinutes: state.dailyLimitMinutes,
    secondsWatched: state.secondsWatched,
    tempExtensionMinutes: state.tempExtensionMinutes,
    isTimerActive: state.isTimerActive,
    isLocked: state.isLocked,
    isAlmostTimeWarningShown: state.isAlmostTimeWarningShown,
    // Derived
    totalAllowedMinutes: state.totalAllowedMinutes,
    remainingSeconds: state.remainingSeconds,
    remainingMinutes: state.remainingMinutes,
    minutesWatched: state.minutesWatched,
    isTimeUp: state.isTimeUp,
    // Actions
    initializeForChild: state.initializeForChild,
    verifyParentPin: state.verifyParentPin,
    grantTemporaryExtensionWithPin: state.grantTemporaryExtensionWithPin,
    updateDailyLimit: state.updateDailyLimit,
    recordWatchSeconds: state.recordWatchSeconds,
    dismissAlmostTimeWarning: state.dismissAlmostTimeWarning,
    clearSession: state.clearSession,
  };
};

/**
 * useIsLocked
 * Lightweight — only subscribes to lock state
 */
export const useIsLocked = () => useScreenTimeStore((s) => s.isLocked);

/**
 * useRemainingMinutes
 * Lightweight — only subscribes to remaining minutes
 */
export const useRemainingMinutes = () =>
  useScreenTimeStore((s) => s.remainingMinutes);

/**
 * useChildSession
 * Access current authenticated child session
 */
export const useChildSession = () => {
  const session = useContentStore((s) => s.session);
  const profile = useContentStore((s) => s.selectedProfile);
  const profiles = useContentStore((s) => s.childProfiles);
  return { session, profile, profiles };
};