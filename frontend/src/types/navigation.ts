// src/types/navigation.ts

/**
 * KidsStream Navigation State
 * Migrated 1:1 from Kotlin ScreenState enum in KidsAppRoot.kt
 */

export enum ScreenState {
  SPLASH = 'SPLASH',
  CHILD_LOGIN = 'CHILD_LOGIN',
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  SEARCH = 'SEARCH',
  CHANNEL_DETAILS = 'CHANNEL_DETAILS',
  PLAYLIST_DETAILS = 'PLAYLIST_DETAILS',
  PLAYER = 'PLAYER',
  PROFILE = 'PROFILE',
  PARENT_PANEL = 'PARENT_PANEL',
  ADMIN_PANEL = 'ADMIN_PANEL',
}

/**
 * Root Navigation Params
 * ScreenState enum ke saath har screen ka param type
 */
export type RootStackParamList = {
  [ScreenState.SPLASH]: undefined;
  [ScreenState.CHILD_LOGIN]: undefined;
  [ScreenState.HOME]: undefined;
  [ScreenState.EXPLORE]: undefined;
  [ScreenState.SEARCH]: { previousScreen: ScreenState };
  [ScreenState.CHANNEL_DETAILS]: {
    channelId: string;
    previousScreen: ScreenState;
  };
  [ScreenState.PLAYLIST_DETAILS]: {
    playlistId: string;
    previousScreen: ScreenState;
  };
  [ScreenState.PLAYER]: {
    videoId: string;
    previousScreen: ScreenState;
  };
  [ScreenState.PROFILE]: undefined;
  [ScreenState.PARENT_PANEL]: undefined;
  [ScreenState.ADMIN_PANEL]: undefined;
};

/**
 * Child Tab State
 * Maps to Kotlin ChildTab enum in KidsBottomNavigation.kt
 */
export enum ChildTab {
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
}

/**
 * Parent Panel Navigation Sections
 * Maps to Kotlin ParentNavSection enum in ParentPanelScreen.kt
 */
export enum ParentNavSection {
  DASHBOARD = 'DASHBOARD',
  CHILDREN = 'CHILDREN',
  CONTENT = 'CONTENT',
  SCREEN_TIME = 'SCREEN_TIME',
  PIN = 'PIN',
  ACCOUNT = 'ACCOUNT',
}

/**
 * Admin Panel Navigation Sections
 * Maps to Kotlin AdminSection enum in AdminPanelScreen.kt
 */
export enum AdminSection {
  OVERVIEW = 'OVERVIEW',
  PARENTS = 'PARENTS',
  CHILDREN = 'CHILDREN',
  CONTENT = 'CONTENT',
}

/**
 * Parent Auth Dialog Modes
 * Maps to Kotlin AuthMode enum in ParentAdminAuthDialog.kt
 */
export enum AuthMode {
  PARENT_PIN = 'PARENT_PIN',
  PARENT_LOGIN = 'PARENT_LOGIN',
  PARENT_REGISTER = 'PARENT_REGISTER',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
}